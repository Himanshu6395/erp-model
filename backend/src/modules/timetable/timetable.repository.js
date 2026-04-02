import Timetable from "../../models/Timetable.js";

const populatePaths = [
  { path: "classId", select: "name section" },
  { path: "subjectId", select: "name classId" },
  { path: "teacherId", populate: { path: "userId", select: "name email" } },
];

export const timetableRepository = {
  create: (doc) => Timetable.create(doc),
  insertMany: (docs, options = {}) => Timetable.insertMany(docs, { ordered: true, ...options }),

  findByIdSchool: ({ schoolId, id }) => Timetable.findOne({ _id: id, schoolId }).populate(populatePaths),

  updateByIdSchool: ({ schoolId, id, payload }) =>
    Timetable.findOneAndUpdate({ _id: id, schoolId }, payload, { new: true }).populate(populatePaths),

  deleteByIdSchool: ({ schoolId, id }) => Timetable.findOneAndDelete({ _id: id, schoolId }),

  findForSchoolYear: ({ schoolId, academicYear, filters = {} }) => {
    const q = { schoolId, academicYear };
    if (filters.classId) q.classId = filters.classId;
    if (filters.section !== undefined && filters.section !== "") q.section = String(filters.section).trim();
    if (filters.day) q.day = filters.day;
    if (filters.teacherId) q.teacherId = filters.teacherId;
    return Timetable.find(q).populate(populatePaths).sort({ day: 1, periodNumber: 1, period: 1 });
  },

  /** All rows for a school + year (for conflict scan) */
  findAllForYear: ({ schoolId, academicYear }) => Timetable.find({ schoolId, academicYear }).lean(),

  findForTeacher: ({ schoolId, academicYear, teacherId, day }) => {
    const q = { schoolId, academicYear, teacherId };
    if (day) q.day = day;
    return Timetable.find(q).populate(populatePaths).sort({ day: 1, periodNumber: 1, period: 1 });
  },

  findForClassSection: ({ schoolId, academicYear, classId, section, day }) => {
    const y = academicYear || "2025-2026";
    const q = {
      schoolId,
      classId,
      section: String(section || "").trim(),
      $or: [{ academicYear: y }, { academicYear: { $exists: false } }, { academicYear: null }, { academicYear: "" }],
    };
    if (day) q.day = day;
    return Timetable.find(q).populate(populatePaths).sort({ day: 1, periodNumber: 1, period: 1 });
  },

  findDaySlots: ({ schoolId, academicYear, classId, section, day }) =>
    Timetable.find({
      schoolId,
      academicYear,
      classId,
      section: String(section || "").trim(),
      day,
    }).lean(),
};
