import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import Subject from "../../models/Subject.js";
import Teacher from "../../models/Teacher.js";
import ClassModel from "../../models/Class.js";
import { timetableRepository } from "./timetable.repository.js";
import { assertNoTimetableConflicts, scanYearForConflicts } from "./timetable.validation.js";
import { normalizeDay, displaySubject } from "./timetable.utils.js";
import { adminRepository } from "../admin/repository.js";

const ensureSchoolAdmin = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing for current user", 400);
  if (user.role !== ROLES.SCHOOL_ADMIN) throw new AppError("Only SCHOOL_ADMIN can manage timetable", 403);
  return user.schoolId;
};

const defaultYear = () => "2025-2026";

async function assertClassInSchool(schoolId, classId) {
  const cls = await ClassModel.findOne({ _id: classId, schoolId });
  if (!cls) throw new AppError("Class not found in your school", 404);
  return cls;
}

async function assertTeacherInSchool(schoolId, teacherId) {
  if (!teacherId) return null;
  const t = await Teacher.findOne({ _id: teacherId, schoolId });
  if (!t) throw new AppError("Teacher not found in your school", 404);
  return t;
}

async function assertSubjectInClass(schoolId, classId, subjectId) {
  if (!subjectId) return null;
  const sub = await Subject.findOne({ _id: subjectId, schoolId, classId });
  if (!sub) throw new AppError("Subject not found for this class", 404);
  return sub;
}

function formatRow(doc) {
  const o = doc?.toObject ? doc.toObject() : { ...doc };
  return {
    ...o,
    subjectName: displaySubject(o),
    periodNumber: o.periodNumber ?? o.period,
  };
}

export const timetableAdminService = {
  async create(user, body) {
    const schoolId = ensureSchoolAdmin(user);
    const academicYear = String(body.academicYear || defaultYear()).trim();
    const classId = body.classId;
    const section = String(body.section || "").trim();
    const day = normalizeDay(body.day);
    const periodNumber = Number(body.periodNumber ?? body.period);
    const startTime = String(body.startTime || "").trim();
    const endTime = String(body.endTime || "").trim();
    const isBreak = Boolean(body.isBreak);

    if (!classId) throw new AppError("classId is required", 400);
    if (!day) throw new AppError("day is required", 400);
    if (!Number.isFinite(periodNumber) || periodNumber < 1) throw new AppError("periodNumber must be >= 1", 400);

    await assertClassInSchool(schoolId, classId);

    let subjectId = body.subjectId || null;
    let teacherId = body.teacherId || null;
    let subjectLabel = String(body.subjectLabel || body.subject || "").trim();

    if (isBreak) {
      subjectId = null;
      teacherId = null;
      if (!subjectLabel) subjectLabel = "Break";
    } else {
      if (subjectId) await assertSubjectInClass(schoolId, classId, subjectId);
      if (teacherId) await assertTeacherInSchool(schoolId, teacherId);
      if (!subjectId && !subjectLabel) throw new AppError("subjectId or subject label is required when not a break", 400);
      if (!teacherId) throw new AppError("teacherId is required when not a break", 400);
    }

    const existing = await timetableRepository.findAllForYear({ schoolId, academicYear });
    const candidate = {
      classId,
      section,
      day,
      periodNumber,
      startTime,
      endTime,
      teacherId,
      isBreak,
    };
    assertNoTimetableConflicts(candidate, existing, null);

    const created = await timetableRepository.create({
      schoolId,
      academicYear,
      classId,
      section,
      day,
      periodNumber,
      startTime,
      endTime,
      subjectId,
      subjectLabel,
      teacherId,
      roomNumber: String(body.roomNumber || "").trim(),
      isBreak,
      notes: String(body.notes || "").trim(),
      subject: subjectLabel,
    });

    await adminRepository.createActivity({
      schoolId,
      actorUserId: user.userId,
      action: "CREATE",
      entityType: "TIMETABLE",
      entityId: String(created._id),
      meta: { day, periodNumber },
    });

    const full = await timetableRepository.findByIdSchool({ schoolId, id: created._id });
    return formatRow(full);
  },

  async bulkCreate(user, body) {
    const schoolId = ensureSchoolAdmin(user);
    const academicYear = String(body.academicYear || defaultYear()).trim();
    const classId = body.classId;
    const section = String(body.section || "").trim();

    if (!classId) throw new AppError("classId is required", 400);
    await assertClassInSchool(schoolId, classId);

    let entries = Array.isArray(body.entries) ? body.entries : [];
    const duplicateFrom = body.duplicateFrom;
    if (duplicateFrom?.classId) {
      const source = await timetableRepository.findForClassSection({
        schoolId,
        academicYear,
        classId: duplicateFrom.classId,
        section: String(duplicateFrom.section ?? "").trim(),
      });
      entries = (source || []).map((row) => {
        const o = row.toObject ? row.toObject() : row;
        return {
          day: o.day,
          periodNumber: o.periodNumber ?? o.period,
          startTime: o.startTime,
          endTime: o.endTime,
          subjectId: o.subjectId,
          teacherId: o.teacherId,
          roomNumber: o.roomNumber,
          isBreak: o.isBreak,
          notes: o.notes,
          subjectLabel: o.subjectLabel || o.subject,
        };
      });
    }

    const copyFromDay = body.copyFromDay ? normalizeDay(body.copyFromDay) : "";
    const targetDays = Array.isArray(body.targetDays) ? body.targetDays.map(normalizeDay).filter(Boolean) : [];

    if (copyFromDay && targetDays.length) {
      const dayEntries = entries.filter((e) => normalizeDay(e.day) === copyFromDay);
      const clones = [];
      for (const td of targetDays) {
        for (const e of dayEntries) {
          clones.push({ ...e, day: td });
        }
      }
      entries = [...entries, ...clones];
    }

    if (!entries.length) throw new AppError("No entries to create (provide entries, duplicateFrom, or copyFromDay+targetDays)", 400);

    let existing = await timetableRepository.findAllForYear({ schoolId, academicYear });
    const created = [];

    for (const raw of entries) {
      const day = normalizeDay(raw.day);
      const periodNumber = Number(raw.periodNumber ?? raw.period);
      const startTime = String(raw.startTime || "").trim();
      const endTime = String(raw.endTime || "").trim();
      const isBreak = Boolean(raw.isBreak);

      if (!day || !Number.isFinite(periodNumber)) continue;

      let subjectId = raw.subjectId || null;
      let teacherId = raw.teacherId || null;
      let subjectLabel = String(raw.subjectLabel || raw.subject || "").trim();

      if (isBreak) {
        subjectId = null;
        teacherId = null;
        if (!subjectLabel) subjectLabel = "Break";
      } else {
        if (subjectId) await assertSubjectInClass(schoolId, classId, subjectId);
        if (teacherId) await assertTeacherInSchool(schoolId, teacherId);
        if (!teacherId) throw new AppError("Each non-break entry needs teacherId", 400);
        if (!subjectId && !subjectLabel) throw new AppError("Each non-break entry needs subjectId or subject name", 400);
      }

      const candidate = { classId, section, day, periodNumber, startTime, endTime, teacherId, isBreak };
      assertNoTimetableConflicts(candidate, [...existing, ...created.map((c) => c.toObject?.() || c)], null);

      const row = await timetableRepository.create({
        schoolId,
        academicYear,
        classId,
        section,
        day,
        periodNumber,
        startTime,
        endTime,
        subjectId,
        subjectLabel,
        teacherId,
        roomNumber: String(raw.roomNumber || "").trim(),
        isBreak,
        notes: String(raw.notes || "").trim(),
        subject: subjectLabel,
      });
      created.push(row);
      existing = [...existing, row.toObject()];
    }

    await adminRepository.createActivity({
      schoolId,
      actorUserId: user.userId,
      action: "BULK_CREATE",
      entityType: "TIMETABLE",
      entityId: "bulk",
      meta: { count: created.length },
    });

    return { created: created.length, items: created.map((r) => formatRow(r)) };
  },

  async list(user, query) {
    const schoolId = ensureSchoolAdmin(user);
    const academicYear = String(query.academicYear || defaultYear()).trim();
    const rows = await timetableRepository.findForSchoolYear({
      schoolId,
      academicYear,
      filters: {
        classId: query.classId || undefined,
        section: query.section !== undefined ? query.section : undefined,
        teacherId: query.teacherId || undefined,
        day: query.day ? normalizeDay(query.day) : undefined,
      },
    });
    return rows.map(formatRow);
  },

  async update(user, id, body) {
    const schoolId = ensureSchoolAdmin(user);
    const existing = await timetableRepository.findByIdSchool({ schoolId, id });
    if (!existing) throw new AppError("Timetable entry not found", 404);

    const academicYear = String(body.academicYear || existing.academicYear).trim();
    const classId = body.classId || existing.classId?._id || existing.classId;
    const section = body.section !== undefined ? String(body.section).trim() : existing.section;
    const day = body.day !== undefined ? normalizeDay(body.day) : existing.day;
    const periodNumber = body.periodNumber != null ? Number(body.periodNumber) : existing.periodNumber ?? existing.period;
    const startTime = body.startTime !== undefined ? String(body.startTime).trim() : existing.startTime;
    const endTime = body.endTime !== undefined ? String(body.endTime).trim() : existing.endTime;
    const isBreak = body.isBreak !== undefined ? Boolean(body.isBreak) : existing.isBreak;

    await assertClassInSchool(schoolId, classId);

    let subjectId = body.subjectId !== undefined ? body.subjectId : existing.subjectId;
    let teacherId = body.teacherId !== undefined ? body.teacherId : existing.teacherId;
    let subjectLabel = body.subjectLabel !== undefined ? String(body.subjectLabel).trim() : existing.subjectLabel || existing.subject;

    if (isBreak) {
      subjectId = null;
      teacherId = null;
      if (!subjectLabel) subjectLabel = "Break";
    } else {
      if (subjectId) await assertSubjectInClass(schoolId, classId, subjectId);
      if (teacherId) await assertTeacherInSchool(schoolId, teacherId);
      if (!teacherId) throw new AppError("teacherId is required when not a break", 400);
    }

    const all = await timetableRepository.findAllForYear({ schoolId, academicYear });
    const candidate = { classId, section, day, periodNumber, startTime, endTime, teacherId, isBreak };
    assertNoTimetableConflicts(candidate, all, id);

    const updated = await timetableRepository.updateByIdSchool({
      schoolId,
      id,
      payload: {
        academicYear,
        classId,
        section,
        day,
        periodNumber,
        startTime,
        endTime,
        subjectId,
        subjectLabel,
        teacherId,
        roomNumber: body.roomNumber !== undefined ? String(body.roomNumber).trim() : existing.roomNumber,
        isBreak,
        notes: body.notes !== undefined ? String(body.notes).trim() : existing.notes,
        subject: subjectLabel,
      },
    });

    await adminRepository.createActivity({
      schoolId,
      actorUserId: user.userId,
      action: "UPDATE",
      entityType: "TIMETABLE",
      entityId: String(id),
      meta: {},
    });

    return formatRow(updated);
  },

  async remove(user, id) {
    const schoolId = ensureSchoolAdmin(user);
    const deleted = await timetableRepository.deleteByIdSchool({ schoolId, id });
    if (!deleted) throw new AppError("Timetable entry not found", 404);
    await adminRepository.createActivity({
      schoolId,
      actorUserId: user.userId,
      action: "DELETE",
      entityType: "TIMETABLE",
      entityId: String(id),
      meta: {},
    });
    return { deleted: true };
  },

  async dashboard(user, query) {
    const schoolId = ensureSchoolAdmin(user);
    const academicYear = String(query.academicYear || defaultYear()).trim();
    const rows = await timetableRepository.findAllForYear({ schoolId, academicYear });

    const classKeys = new Set();
    const teacherMinutes = new Map();

    for (const r of rows) {
      const cid = String(r.classId);
      const sec = String(r.section || "").trim();
      classKeys.add(`${cid}::${sec}`);
      if (r.teacherId && !r.isBreak) {
        const tid = String(r.teacherId);
        teacherMinutes.set(tid, (teacherMinutes.get(tid) || 0) + 1);
      }
    }

    const teacherLoad = [];
    for (const [tid, periods] of teacherMinutes.entries()) {
      const t = await Teacher.findOne({ _id: tid, schoolId }).populate("userId", "name");
      teacherLoad.push({
        teacherId: tid,
        name: t?.userId?.name || "Teacher",
        periods,
      });
    }
    teacherLoad.sort((a, b) => b.periods - a.periods);

    const conflictAlerts = scanYearForConflicts(rows);

    return {
      academicYear,
      totalClassesScheduled: classKeys.size,
      totalSlots: rows.length,
      teacherLoad,
      conflictAlerts,
    };
  },
};
