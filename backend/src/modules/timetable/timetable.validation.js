import AppError from "../../common/errors/AppError.js";
import { timesOverlap, normalizeDay, timeToMinutes } from "./timetable.utils.js";

const sameClassSection = (a, b) =>
  String(a.classId?._id || a.classId) === String(b.classId?._id || b.classId) &&
  String(a.section || "").trim().toUpperCase() === String(b.section || "").trim().toUpperCase();

/**
 * @param {object} candidate - normalized slot fields
 * @param {Array} existingRows - lean or docs same school+year
 * @param {string|null} excludeId - update mode
 */
export function assertNoTimetableConflicts(candidate, existingRows, excludeId = null) {
  const ex = (existingRows || []).filter((r) => String(r._id) !== String(excludeId || ""));
  const day = normalizeDay(candidate.day);

  for (const r of ex) {
    if (normalizeDay(r.day) !== day) continue;

    if (sameClassSection(candidate, r)) {
      if (Number(r.periodNumber ?? r.period) === Number(candidate.periodNumber)) {
        throw new AppError(`Period ${candidate.periodNumber} on ${day} already exists for this class`, 409);
      }
      if (timesOverlap(candidate.startTime, candidate.endTime, r.startTime, r.endTime)) {
        throw new AppError(
          `Time overlap for this class on ${day}: period ${candidate.periodNumber} (${candidate.startTime}-${candidate.endTime}) conflicts with period ${r.periodNumber ?? r.period} (${r.startTime}-${r.endTime})`,
          409
        );
      }
    }

    const tid = candidate.teacherId && String(candidate.teacherId);
    if (tid && !candidate.isBreak && r.teacherId && String(r.teacherId) === tid && !r.isBreak) {
      if (timesOverlap(candidate.startTime, candidate.endTime, r.startTime, r.endTime)) {
        throw new AppError(
          `Teacher double-booked on ${day}: slot (${candidate.startTime}-${candidate.endTime}) overlaps (${r.startTime}-${r.endTime}) for another class`,
          409
        );
      }
    }
  }

  const s0 = timeToMinutes(candidate.startTime);
  const s1 = timeToMinutes(candidate.endTime);
  if (s0 == null || s1 == null) throw new AppError("Invalid startTime or endTime (use HH:MM)", 400);
  if (s1 <= s0) throw new AppError("endTime must be after startTime", 400);
}

export function scanYearForConflicts(rows) {
  const alerts = [];
  const list = (rows || []).map((r) => (r?.toObject ? r.toObject() : r));

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (normalizeDay(a.day) !== normalizeDay(b.day)) continue;

      if (sameClassSection(a, b)) {
        const pnA = Number(a.periodNumber ?? a.period);
        const pnB = Number(b.periodNumber ?? b.period);
        if (pnA === pnB) {
          alerts.push({
            type: "DUPLICATE_PERIOD",
            message: `${a.day} class ${pnA}: duplicate period number`,
            ids: [a._id, b._id],
          });
        }
        if (timesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
          alerts.push({
            type: "CLASS_OVERLAP",
            message: `${a.day} same class: periods ${pnA} and ${pnB} times overlap`,
            ids: [a._id, b._id],
          });
        }
      }

      if (a.teacherId && b.teacherId && String(a.teacherId) === String(b.teacherId) && !a.isBreak && !b.isBreak) {
        if (timesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
          alerts.push({
            type: "TEACHER_OVERLAP",
            message: `${a.day} teacher double-booked — periods ${a.periodNumber ?? a.period} & ${b.periodNumber ?? b.period}`,
            ids: [a._id, b._id],
          });
        }
      }
    }
  }

  return alerts;
}
