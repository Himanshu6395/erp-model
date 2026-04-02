import User from "../../models/User.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import ClassModel from "../../models/Class.js";
import Subject from "../../models/Subject.js";
import Attendance from "../../models/Attendance.js";
import TeacherAttendance from "../../models/TeacherAttendance.js";
import FeeStructure from "../../models/FeeStructure.js";
import FeeAssignment from "../../models/FeeAssignment.js";
import FeePayment from "../../models/FeePayment.js";
import ActivityLog from "../../models/ActivityLog.js";
import Notice from "../../models/Notice.js";
import Notification from "../../models/Notification.js";

export const adminRepository = {
  findUserByEmail: (email) => User.findOne({ email }),
  createUser: (payload) => User.create(payload),
  findUserById: (id) => User.findById(id),
  updateUserById: (id, payload) => User.findByIdAndUpdate(id, payload, { new: true }),
  deleteUserById: (id) => User.findByIdAndDelete(id),

  createStudent: (payload) => Student.create(payload),
  findStudentById: ({ schoolId, studentId }) =>
    Student.findOne({ _id: studentId, schoolId }).populate("userId classId"),
  findStudents: ({ schoolId, query, skip, limit }) =>
    Student.find({ schoolId })
      .populate({
        path: "userId",
        match: query ? { $or: [{ name: new RegExp(query, "i") }, { email: new RegExp(query, "i") }] } : {},
      })
      .populate("classId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  countStudents: ({ schoolId }) => Student.countDocuments({ schoolId }),
  updateStudent: ({ schoolId, studentId, payload }) =>
    Student.findOneAndUpdate({ _id: studentId, schoolId }, payload, { new: true }).populate("userId classId"),
  deleteStudent: ({ schoolId, studentId }) => Student.findOneAndDelete({ _id: studentId, schoolId }),

  createTeacher: (payload) => Teacher.create(payload),
  findTeacherById: ({ schoolId, teacherId }) =>
    Teacher.findOne({ _id: teacherId, schoolId }).populate("userId"),
  findTeachers: ({ schoolId, query, skip, limit }) =>
    Teacher.find({ schoolId })
      .populate({
        path: "userId",
        match: query ? { $or: [{ name: new RegExp(query, "i") }, { email: new RegExp(query, "i") }] } : {},
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  countTeachers: ({ schoolId }) => Teacher.countDocuments({ schoolId }),
  updateTeacher: ({ schoolId, teacherId, payload }) =>
    Teacher.findOneAndUpdate({ _id: teacherId, schoolId }, payload, { new: true }).populate("userId"),
  deleteTeacher: ({ schoolId, teacherId }) => Teacher.findOneAndDelete({ _id: teacherId, schoolId }),

  createClass: (payload) => ClassModel.create(payload),
  findClassById: ({ schoolId, classId }) =>
    ClassModel.findOne({ _id: classId, schoolId }).populate({ path: "classTeacherId", populate: { path: "userId" } }),
  findClasses: ({ schoolId }) =>
    ClassModel.find({ schoolId })
      .populate({ path: "classTeacherId", populate: { path: "userId" } })
      .sort({ name: 1, section: 1 }),
  updateClass: ({ schoolId, classId, payload }) =>
    ClassModel.findOneAndUpdate({ _id: classId, schoolId }, payload, { new: true }).populate({
      path: "classTeacherId",
      populate: { path: "userId" },
    }),
  deleteClass: ({ schoolId, classId }) => ClassModel.findOneAndDelete({ _id: classId, schoolId }),

  createSubject: (payload) => Subject.create(payload),
  findSubjects: ({ schoolId }) => Subject.find({ schoolId }).populate("classId teacherId").sort({ createdAt: -1 }),
  updateSubject: ({ schoolId, subjectId, payload }) =>
    Subject.findOneAndUpdate({ _id: subjectId, schoolId }, payload, { new: true }).populate("classId teacherId"),
  deleteSubject: ({ schoolId, subjectId }) => Subject.findOneAndDelete({ _id: subjectId, schoolId }),

  upsertStudentAttendance: ({ schoolId, studentId, date, status }) =>
    Attendance.findOneAndUpdate({ schoolId, studentId, date }, { status }, { new: true, upsert: true }),
  studentAttendanceReport: ({ schoolId, studentId, from, to }) =>
    Attendance.find({ schoolId, studentId, date: { $gte: from, $lte: to } }).sort({ date: -1 }),

  upsertTeacherAttendance: ({ schoolId, teacherId, date, status }) =>
    TeacherAttendance.findOneAndUpdate({ schoolId, teacherId, date }, { status }, { new: true, upsert: true }),
  teacherAttendanceReport: ({ schoolId, teacherId, from, to }) =>
    TeacherAttendance.find({ schoolId, teacherId, date: { $gte: from, $lte: to } }).sort({ date: -1 }),

  createFeeStructure: (payload) => FeeStructure.create(payload),
  updateFeeStructure: ({ schoolId, structureId, payload }) =>
    FeeStructure.findOneAndUpdate({ _id: structureId, schoolId }, payload, { new: true }),
  getFeeStructures: ({ schoolId }) => FeeStructure.find({ schoolId }).populate("classId").sort({ createdAt: -1 }),
  findFeeStructureById: ({ schoolId, structureId }) =>
    FeeStructure.findOne({ _id: structureId, schoolId }).populate("classId"),
  countActiveDuplicateStructure: async ({ schoolId, classId, academicYear, section, excludeId }) => {
    const q = {
      schoolId,
      classId,
      academicYear: String(academicYear || "").trim(),
      section: String(section || "").trim(),
      status: "ACTIVE",
    };
    if (excludeId) q._id = { $ne: excludeId };
    return FeeStructure.countDocuments(q);
  },
  findActiveStructuresForClass: ({ schoolId, classId }) =>
    FeeStructure.find({ schoolId, classId, status: "ACTIVE" }).sort({ createdAt: -1 }),

  createFeeAssignment: (payload) => FeeAssignment.create(payload),
  findFeeAssignmentById: ({ schoolId, assignmentId }) =>
    FeeAssignment.findOne({ _id: assignmentId, schoolId })
      .populate("feeStructureId")
      .populate({ path: "studentId", populate: { path: "userId" } })
      .populate("classId"),
  findFeeAssignmentByStudentStructure: ({ schoolId, studentId, feeStructureId }) =>
    FeeAssignment.findOne({ schoolId, studentId, feeStructureId }),
  updateFeeAssignmentById: ({ schoolId, assignmentId, payload }) =>
    FeeAssignment.findOneAndUpdate({ _id: assignmentId, schoolId }, payload, { new: true })
      .populate("feeStructureId")
      .populate({ path: "studentId", populate: { path: "userId" } })
      .populate("classId"),
  getFeeAssignmentsByStudent: ({ schoolId, studentId }) =>
    FeeAssignment.find({ schoolId, studentId }).populate("feeStructureId").sort({ createdAt: -1 }),
  listFeeAssignments: ({ schoolId, filter, skip, limit }) => {
    const q = { schoolId, ...filter };
    let cursor = FeeAssignment.find(q)
      .populate({ path: "studentId", populate: { path: "userId" } })
      .populate("classId")
      .populate("feeStructureId")
      .sort({ dueDate: 1, createdAt: -1 });
    if (skip != null) cursor = cursor.skip(skip);
    if (limit != null) cursor = cursor.limit(limit);
    return cursor;
  },
  countFeeAssignments: ({ schoolId, filter }) => FeeAssignment.countDocuments({ schoolId, ...filter }),

  createFeePayment: (payload) => FeePayment.create(payload),
  getFeePaymentsByStudent: ({ schoolId, studentId }) =>
    FeePayment.find({ schoolId, studentId }).sort({ paymentDate: -1 }),
  getFeePaymentById: ({ schoolId, paymentId }) =>
    FeePayment.findOne({ _id: paymentId, schoolId })
      .populate({
        path: "studentId",
        populate: [{ path: "userId" }, { path: "classId" }],
      })
      .populate({ path: "studentFeeId", populate: { path: "feeStructureId" } }),

  aggregateFeeDashboard: async ({ schoolId }) => {
    const sid = schoolId;
    const assignments = await FeeAssignment.find({ schoolId: sid }).lean();
    let generated = 0;
    let collected = 0;
    let pending = 0;
    let overdueCount = 0;
    assignments.forEach((a) => {
      const finalAmt = Number(a.finalAmount || a.amount || 0);
      const fine = Number(a.fineAmount || 0);
      const paid = Number(a.paidAmount || 0);
      generated += finalAmt + fine;
      collected += paid;
      pending += Math.max(finalAmt + fine - paid, 0);
      if (a.status === "OVERDUE") overdueCount += 1;
    });
    return { totalFeesGenerated: generated, totalCollected: collected, pendingAmount: pending, overdueRecords: overdueCount };
  },

  countAttendance: ({ schoolId, from }) => Attendance.countDocuments({ schoolId, ...(from ? { date: { $gte: from } } : {}) }),
  countCollectedFees: ({ schoolId, from }) =>
    FeePayment.aggregate([
      { $match: { schoolId, ...(from ? { paymentDate: { $gte: from } } : {}) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

  createActivity: (payload) => ActivityLog.create(payload),
  getRecentActivities: ({ schoolId, limit = 10 }) =>
    ActivityLog.find({ schoolId }).sort({ createdAt: -1 }).limit(limit),
  createNotification: (payload) => Notification.create(payload),
};
