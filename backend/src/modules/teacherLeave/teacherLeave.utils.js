export const inclusiveDayCount = (fromDate, toDate) => {
  const a = new Date(fromDate);
  const b = new Date(toDate);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  if (b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
};

export const formatTeacherLeaveRow = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const fromDate = o.fromDate || o.startDate;
  const toDate = o.toDate || o.endDate;
  const teacher = o.teacherId && typeof o.teacherId === "object" ? o.teacherId : null;
  const teacherUser = teacher?.userId;
  return {
    ...o,
    fromDate,
    toDate,
    startDate: fromDate,
    endDate: toDate,
    leaveDisplayId: o._id ? `TL-${String(o._id).slice(-8).toUpperCase()}` : "",
    teacherName:
      teacherUser?.name ||
      `${teacher?.firstName || ""} ${teacher?.lastName || ""}`.trim() ||
      "Teacher",
    teacherEmail: teacherUser?.email || "",
    teacherPhoto: teacher?.profileImage || "",
    department: teacher?.department || "",
    subjectLabel: (teacher?.subjectNames || []).join(", ") || "",
    subjects: teacher?.subjects || [],
  };
};
