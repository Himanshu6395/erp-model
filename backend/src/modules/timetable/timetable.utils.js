/** Normalize day names */
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function normalizeDay(day) {
  const d = String(day || "").trim();
  if (!d) return "";
  const cap = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
  const match = WEEKDAYS.find((w) => w.toLowerCase() === d.toLowerCase());
  return match || cap;
}

/** "09:30" or "9:30" → minutes from midnight */
export function timeToMinutes(t) {
  const s = String(t || "").trim();
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 23 || mm > 59) return null;
  return hh * 60 + mm;
}

export function timesOverlap(startA, endA, startB, endB) {
  const a0 = timeToMinutes(startA);
  const a1 = timeToMinutes(endA);
  const b0 = timeToMinutes(startB);
  const b1 = timeToMinutes(endB);
  if (a0 == null || a1 == null || b0 == null || b1 == null) return false;
  if (a1 <= a0 || b1 <= b0) return true;
  return Math.max(a0, b0) < Math.min(a1, b1);
}

export function displaySubject(row) {
  const o = row?.toObject ? row.toObject() : row || {};
  if (o.subjectId?.name) return o.subjectId.name;
  if (o.subjectLabel) return o.subjectLabel;
  if (o.subject) return o.subject;
  if (o.isBreak) return "Break";
  return "—";
}
