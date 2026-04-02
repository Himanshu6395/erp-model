import Teacher from "../../models/Teacher.js";
import User from "../../models/User.js";
import ClassModel from "../../models/Class.js";
import Subject from "../../models/Subject.js";
import Student from "../../models/Student.js";
import Attendance from "../../models/Attendance.js";
import Assignment from "../../models/Assignment.js";
import HomeworkSubmission from "../../models/HomeworkSubmission.js";
import Exam from "../../models/Exam.js";
import Result from "../../models/Result.js";
import Timetable from "../../models/Timetable.js";
import Communication from "../../models/Communication.js";
import StudyMaterial from "../../models/StudyMaterial.js";
import TeacherLeave from "../../models/TeacherLeave.js";
import TeacherDiary from "../../models/TeacherDiary.js";
import OnlineClass from "../../models/OnlineClass.js";
import DoubtQuery from "../../models/DoubtQuery.js";
import Notification from "../../models/Notification.js";
import TeacherActivityLog from "../../models/TeacherActivityLog.js";
import StudentLeave from "../../models/StudentLeave.js";
import mongoose from "mongoose";

export const teacherRepository = {
  findTeacherByUser: ({ schoolId, userId }) => Teacher.findOne({ schoolId, userId }).populate("userId"),
  findTeacherById: ({ schoolId, teacherId }) => Teacher.findOne({ schoolId, _id: teacherId }).populate("userId"),
  updateTeacherById: ({ schoolId, teacherId, payload }) =>
    Teacher.findOneAndUpdate({ schoolId, _id: teacherId }, payload, { new: true }).populate("userId"),
  updateUserById: ({ userId, payload }) => User.findByIdAndUpdate(userId, payload, { new: true }),
  findUserById: (userId) => User.findById(userId),

  findAssignedClassesByClassTeacher: ({ schoolId, teacherId }) => ClassModel.find({ schoolId, classTeacherId: teacherId }),
  findClassByIdSchool: ({ schoolId, classId }) => ClassModel.findOne({ schoolId, _id: classId }),
  findAssignedClassesBySubject: ({ schoolId, teacherId }) => Subject.find({ schoolId, teacherId }).select("classId"),
  findAssignedSubjects: ({ schoolId, teacherId }) => Subject.find({ schoolId, teacherId }).populate("classId"),

  findStudentsByClassIds: ({ schoolId, classIds, search, skip, limit, section }) =>
    Student.find({
      schoolId,
      classId: { $in: classIds },
      ...(section ? { section } : {}),
      ...(search ? { $or: [{ rollNumber: new RegExp(search, "i") }, { parentName: new RegExp(search, "i") }] } : {}),
    })
      .populate("userId classId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  countStudentsByClassIds: ({ schoolId, classIds, section }) =>
    Student.countDocuments({ schoolId, classId: { $in: classIds }, ...(section ? { section } : {}) }),
  findStudentById: ({ schoolId, studentId }) => Student.findOne({ schoolId, _id: studentId }).populate("userId classId"),

  findStudentIdsMatchingName: async ({ schoolId, search }) => {
    if (!search?.trim()) return null;
    const users = await User.find({ name: new RegExp(search.trim(), "i") }).select("_id").lean();
    if (!users.length) return [];
    const ids = users.map((u) => u._id);
    const studs = await Student.find({ schoolId, userId: { $in: ids } }).select("_id").lean();
    return studs.map((s) => s._id);
  },

  upsertAttendance: ({ schoolId, studentId, date, payload }) =>
    Attendance.findOneAndUpdate({ schoolId, studentId, date }, payload, { upsert: true, new: true }),
  findAttendanceByQuery: ({ schoolId, classIds, from, to }) =>
    Attendance.find({ schoolId, date: { $gte: from, $lte: to } })
      .populate({ path: "studentId", match: { classId: { $in: classIds } }, populate: "userId classId" })
      .sort({ date: -1 }),
  findAttendanceByStudent: ({ schoolId, studentId }) => Attendance.find({ schoolId, studentId }).sort({ date: -1 }),

  findStudentIdsByClassSection: ({ schoolId, classId, section }) =>
    Student.find({ schoolId, classId, section: String(section || "").trim() }).select("_id").lean(),

  findAttendanceByStudentIdsDateRange: ({ schoolId, studentIds, from, to }) => {
    if (!studentIds?.length) return Promise.resolve([]);
    return Attendance.find({
      schoolId,
      studentId: { $in: studentIds },
      date: { $gte: from, $lte: to },
    })
      .select("studentId date status")
      .lean();
  },

  findAttendanceForStudentsOnDate: ({ schoolId, studentIds, dayStart, dayEnd }) => {
    if (!studentIds?.length) return Promise.resolve([]);
    return Attendance.find({
      schoolId,
      studentId: { $in: studentIds },
      date: { $gte: dayStart, $lte: dayEnd },
    })
      .select("studentId status")
      .lean();
  },

  createAssignment: (payload) => Assignment.create(payload),
  updateAssignment: ({ schoolId, assignmentId, teacherId, payload }) =>
    Assignment.findOneAndUpdate({ schoolId, _id: assignmentId, createdBy: teacherId }, payload, { new: true }),
  deleteAssignment: ({ schoolId, assignmentId, teacherId }) =>
    Assignment.findOneAndDelete({ schoolId, _id: assignmentId, createdBy: teacherId }),
  findAssignments: ({ schoolId, classIds, teacherId }) =>
    Assignment.find({ schoolId, classId: { $in: classIds }, createdBy: teacherId }).populate("classId").sort({ dueDate: 1 }),
  countPendingAssignments: ({ schoolId, teacherId, now }) =>
    Assignment.countDocuments({ schoolId, createdBy: teacherId, dueDate: { $gte: now } }),

  findSubmissionsByAssignmentIds: ({ schoolId, assignmentIds }) =>
    HomeworkSubmission.find({ schoolId, assignmentId: { $in: assignmentIds } }).populate({ path: "studentId", populate: "userId classId" }),

  createExam: (payload) => Exam.create(payload),
  findExams: ({ schoolId, classIds }) => Exam.find({ schoolId, classId: { $in: classIds } }).populate("classId").sort({ examDate: 1 }),
  findUpcomingExams: ({ schoolId, classIds, now }) =>
    Exam.find({ schoolId, classId: { $in: classIds }, examDate: { $gte: now } }).populate("classId").sort({ examDate: 1 }).limit(10),

  upsertResult: ({ schoolId, studentId, examId, subject, payload }) => {
    const examSubjectKey = `legacy:${String(subject || "").trim()}`;
    return Result.findOneAndUpdate(
      { schoolId, studentId, examId, examSubjectKey },
      { $set: { ...payload, subject: String(subject || "").trim(), examSubjectKey } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },
  findResultsByStudent: ({ schoolId, studentId }) => Result.find({ schoolId, studentId }).populate("examId").sort({ createdAt: -1 }),

  getTimetable: ({ schoolId, teacherId, academicYear }) => {
    const y = academicYear || "2025-2026";
    return Timetable.find({
      schoolId,
      teacherId,
      $or: [{ academicYear: y }, { academicYear: { $exists: false } }, { academicYear: null }, { academicYear: "" }],
    })
      .populate({ path: "classId", select: "name section" })
      .populate({ path: "subjectId", select: "name" })
      .sort({ day: 1, periodNumber: 1, period: 1 });
  },
  getTodayTimetable: ({ schoolId, teacherId, day, academicYear }) => {
    const y = academicYear || "2025-2026";
    return Timetable.find({
      schoolId,
      teacherId,
      day,
      $or: [{ academicYear: y }, { academicYear: { $exists: false } }, { academicYear: null }, { academicYear: "" }],
    })
      .populate({ path: "classId", select: "name section" })
      .populate({ path: "subjectId", select: "name" })
      .sort({ periodNumber: 1, period: 1 });
  },

  createCommunication: (payload) => Communication.create(payload),
  getCommunications: ({ schoolId, teacherId }) => Communication.find({ schoolId, teacherId }).sort({ sentAt: -1 }),

  createStudyMaterial: (payload) => StudyMaterial.create(payload),
  getStudyMaterials: ({ schoolId, teacherId }) =>
    StudyMaterial.find({ schoolId, teacherId })
      .populate("classId")
      .populate("subjectId")
      .populate({ path: "teacherId", populate: { path: "userId", select: "name email" } })
      .sort({ createdAt: -1 }),
  getStudyMaterialsFiltered: ({ schoolId, teacherId, classId, section, subjectId, materialType, from, to }) => {
    const q = { schoolId, teacherId };
    if (classId) q.classId = classId;
    if (section) q.section = section;
    if (subjectId) q.subjectId = subjectId;
    if (materialType) q.materialType = materialType;
    if (from || to) {
      q.publishDate = {};
      if (from) q.publishDate.$gte = new Date(from);
      if (to) q.publishDate.$lte = new Date(to);
    }
    return StudyMaterial.find(q)
      .populate("classId")
      .populate("subjectId")
      .populate({ path: "teacherId", populate: { path: "userId", select: "name email" } })
      .sort({ publishDate: -1, createdAt: -1 });
  },
  findStudyMaterialByTeacher: ({ schoolId, teacherId, materialId }) =>
    StudyMaterial.findOne({ schoolId, teacherId, _id: materialId })
      .populate("classId")
      .populate("subjectId"),
  updateStudyMaterialByTeacher: ({ schoolId, teacherId, materialId, payload }) =>
    StudyMaterial.findOneAndUpdate({ schoolId, teacherId, _id: materialId }, payload, { new: true })
      .populate("classId")
      .populate("subjectId"),
  deleteStudyMaterialByTeacher: ({ schoolId, teacherId, materialId }) =>
    StudyMaterial.findOneAndDelete({ schoolId, teacherId, _id: materialId }),
  findSubjectInClass: ({ schoolId, subjectId, classId }) =>
    Subject.findOne({ _id: subjectId, schoolId, classId }).lean(),

  createLeave: (payload) => TeacherLeave.create(payload),
  listLeaves: ({ schoolId, teacherId }) => TeacherLeave.find({ schoolId, teacherId }).sort({ createdAt: -1 }),
  cancelLeave: ({ schoolId, teacherId, leaveId }) =>
    TeacherLeave.findOneAndUpdate({ schoolId, teacherId, _id: leaveId }, { status: "CANCELLED" }, { new: true }),

  createDiary: (payload) => TeacherDiary.create(payload),
  listDiaries: ({ schoolId, teacherId }) => TeacherDiary.find({ schoolId, teacherId }).populate("classId").sort({ date: -1 }),

  createOnlineClass: (payload) => OnlineClass.create(payload),
  listOnlineClasses: ({ schoolId, teacherId }) => OnlineClass.find({ schoolId, teacherId }).populate("classId").sort({ date: -1 }),

  listDoubts: ({ schoolId, teacherId }) => DoubtQuery.find({ schoolId, teacherId }).populate({ path: "studentId", populate: "userId" }),
  answerDoubt: ({ schoolId, teacherId, doubtId, answer }) =>
    DoubtQuery.findOneAndUpdate({ schoolId, teacherId, _id: doubtId }, { answer }, { new: true }),

  listNotifications: ({ schoolId, userId }) => Notification.find({ schoolId, userId }).sort({ createdAt: -1 }),
  markNotificationRead: ({ schoolId, userId, notificationId }) =>
    Notification.findOneAndUpdate({ schoolId, userId, _id: notificationId }, { isRead: true }, { new: true }),

  createActivityLog: (payload) => TeacherActivityLog.create(payload),
  listActivityLogs: ({ schoolId, teacherId }) => TeacherActivityLog.find({ schoolId, teacherId }).sort({ createdAt: -1 }).limit(100),

  createNotification: (payload) => Notification.create(payload),

  findStudentLeavesForClassTeacher: ({ schoolId, classTeacherId, filter = {}, limit }) => {
    const q = { schoolId, classTeacherId, ...filter };
    let qy = StudentLeave.find(q)
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } })
      .populate("classId")
      .sort({ createdAt: -1 });
    if (limit) qy = qy.limit(limit);
    return qy;
  },

  findStudentLeaveByIdForClassTeacher: ({ schoolId, leaveId, classTeacherId }) =>
    StudentLeave.findOne({ _id: leaveId, schoolId, classTeacherId })
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } })
      .populate("classId"),

  updateStudentLeaveForClassTeacher: ({ schoolId, leaveId, classTeacherId, payload }) =>
    StudentLeave.findOneAndUpdate({ _id: leaveId, schoolId, classTeacherId }, payload, { new: true })
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } })
      .populate("classId"),

  aggregateStudentLeaveStats: async ({ schoolId, classTeacherId }) => {
    const sid = new mongoose.Types.ObjectId(String(schoolId));
    const tid = new mongoose.Types.ObjectId(String(classTeacherId));
    const rows = await StudentLeave.aggregate([
      { $match: { schoolId: sid, classTeacherId: tid } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const map = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    let total = 0;
    rows.forEach((r) => {
      if (r._id && map[r._id] !== undefined) {
        map[r._id] = r.count;
        total += r.count;
      }
    });
    return { total, pending: map.PENDING, approved: map.APPROVED, rejected: map.REJECTED };
  },
};
