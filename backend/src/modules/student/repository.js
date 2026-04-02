import Student from "../../models/Student.js";
import Attendance from "../../models/Attendance.js";
import Result from "../../models/Result.js";
import Assignment from "../../models/Assignment.js";
import HomeworkSubmission from "../../models/HomeworkSubmission.js";
import LibraryIssue from "../../models/LibraryIssue.js";
import RegistrationLink from "../../models/RegistrationLink.js";
import StudentFeedback from "../../models/StudentFeedback.js";
import StudentComplaint from "../../models/StudentComplaint.js";
import PlacementJob from "../../models/PlacementJob.js";
import PlacementApplication from "../../models/PlacementApplication.js";
import Timetable from "../../models/Timetable.js";
import Notification from "../../models/Notification.js";
import FeeAssignment from "../../models/FeeAssignment.js";
import FeePayment from "../../models/FeePayment.js";
import School from "../../models/School.js";
import User from "../../models/User.js";
import Teacher from "../../models/Teacher.js";
import ClassModel from "../../models/Class.js";
import StudentLeave from "../../models/StudentLeave.js";
import StudyMaterial from "../../models/StudyMaterial.js";

const findStudentByUser = ({ schoolId, userId }) =>
  Student.findOne({ schoolId, userId }).populate("userId classId");

const findAttendanceByStudent = ({ schoolId, studentId }) =>
  Attendance.find({ schoolId, studentId })
    .populate({ path: "markedBy", populate: { path: "userId" } })
    .sort({ date: -1 });

const findResultByStudent = ({ schoolId, studentId }) =>
  Result.find({ schoolId, studentId })
    .populate({ path: "examId", populate: { path: "classId", select: "name section" } })
    .populate("subjectId")
    .sort({ subject: 1 });

const findAssignmentsByClass = ({ schoolId, classId }) =>
  Assignment.find({ schoolId, classId }).sort({ dueDate: 1 });

/** Homework visible to a student: same classId and section matches (or assignment has no section = legacy / whole class doc). */
const findAssignmentsForStudent = ({ schoolId, classId, studentSection }) => {
  const sec = String(studentSection ?? "").trim();
  return Assignment.find({
    schoolId,
    classId,
    $or: [{ section: { $exists: false } }, { section: null }, { section: "" }, { section: sec }],
  }).sort({ dueDate: 1 });
};

const upsertHomeworkSubmission = ({ schoolId, assignmentId, studentId, payload }) =>
  HomeworkSubmission.findOneAndUpdate({ schoolId, assignmentId, studentId }, payload, { new: true, upsert: true });

const findHomeworkSubmissionsByStudent = ({ schoolId, studentId }) =>
  HomeworkSubmission.find({ schoolId, studentId }).sort({ createdAt: -1 });

const findLibraryIssuesByStudent = ({ schoolId, studentId }) =>
  LibraryIssue.find({ schoolId, studentId }).populate("bookId").sort({ issueDate: -1 });

const findRegistrationLinks = ({ schoolId }) =>
  RegistrationLink.find({ schoolId, isActive: true }).sort({ createdAt: -1 });

const createFeedback = (payload) => StudentFeedback.create(payload);
const findFeedbackByStudent = ({ schoolId, studentId }) =>
  StudentFeedback.find({ schoolId, studentId }).sort({ createdAt: -1 });

const createComplaint = (payload) => StudentComplaint.create(payload);
const findComplaintsByStudent = ({ schoolId, studentId }) =>
  StudentComplaint.find({ schoolId, studentId }).sort({ createdAt: -1 });

const findPlacementJobs = ({ schoolId }) =>
  PlacementJob.find({ schoolId, isActive: true }).sort({ createdAt: -1 });

const createPlacementApplication = (payload) => PlacementApplication.create(payload);
const findPlacementHistoryByStudent = ({ schoolId, studentId }) =>
  PlacementApplication.find({ schoolId, studentId }).populate("jobId").sort({ createdAt: -1 });

const academicYearOrLegacy = (academicYear) => {
  const y = academicYear || "2025-2026";
  return { $or: [{ academicYear: y }, { academicYear: { $exists: false } }, { academicYear: null }, { academicYear: "" }] };
};

const findTimetableByClassSection = ({ schoolId, classId, section, day, academicYear }) => {
  const sec = String(section || "").trim();
  const q = { schoolId, classId, section: sec, ...academicYearOrLegacy(academicYear) };
  if (day) q.day = day;
  return Timetable.find(q)
    .populate({ path: "teacherId", populate: { path: "userId", select: "name email" } })
    .populate({ path: "subjectId", select: "name" })
    .populate({ path: "classId", select: "name section" })
    .sort({ day: 1, periodNumber: 1, period: 1 });
};

const findNotificationsByUser = ({ schoolId, userId }) =>
  Notification.find({ schoolId, userId }).sort({ createdAt: -1 });

const markNotificationRead = ({ schoolId, userId, notificationId }) =>
  Notification.findOneAndUpdate({ schoolId, userId, _id: notificationId }, { isRead: true }, { new: true });

const findFeeAssignmentsByStudent = ({ schoolId, studentId }) =>
  FeeAssignment.find({ schoolId, studentId }).populate("feeStructureId").sort({ createdAt: -1 });

const findFeePaymentsByStudent = ({ schoolId, studentId }) =>
  FeePayment.find({ schoolId, studentId })
    .populate({ path: "studentFeeId", populate: { path: "feeStructureId" } })
    .sort({ paymentDate: -1 });

const createFeePayment = (payload) => FeePayment.create(payload);

const findFeePaymentForStudent = ({ schoolId, studentId, paymentId }) =>
  FeePayment.findOne({ _id: paymentId, schoolId, studentId })
    .populate({
      path: "studentId",
      populate: [{ path: "userId" }, { path: "classId" }],
    })
    .populate({ path: "studentFeeId", populate: { path: "feeStructureId" } });

const findSchoolById = (schoolId) => School.findById(schoolId);

const updateStudentById = ({ schoolId, studentId, payload }) =>
  Student.findOneAndUpdate({ schoolId, _id: studentId }, payload, { new: true }).populate("userId classId");

const updateUserById = ({ userId, payload }) =>
  User.findByIdAndUpdate(userId, payload, { new: true });

const findClassByIdSchool = ({ schoolId, classId }) => ClassModel.findOne({ _id: classId, schoolId });

const createStudentLeave = (payload) => StudentLeave.create(payload);

const findStudentLeavesByStudent = ({ schoolId, studentId }) =>
  StudentLeave.find({ schoolId, studentId }).populate("classId").sort({ createdAt: -1 });

const findStudentLeaveByIdPopulated = (leaveId) => StudentLeave.findById(leaveId).populate("classId");

const findTeacherUserIdBySchool = ({ schoolId, teacherId }) =>
  Teacher.findOne({ schoolId, _id: teacherId }).select("userId").lean();

const createNotification = (payload) => Notification.create(payload);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findStudyMaterialsForStudent = ({ schoolId, classId, section, studentId, subjectId, materialType, search, now }) => {
  const sec = String(section || "").trim();
  const visibilityClause = {
    $or: [
      { visibility: "PUBLIC" },
      { visibility: { $exists: false } },
      { visibility: null },
      {
        $and: [{ visibility: "RESTRICTED" }, { restrictedStudentIds: studentId }],
      },
    ],
  };
  const sectionClause = {
    $or: [{ section: sec }, { section: { $exists: false } }, { section: "" }],
  };
  const q = {
    schoolId,
    classId,
    $or: [{ status: "PUBLISHED" }, { status: { $exists: false } }, { status: null }],
    $and: [
      {
        $or: [{ publishDate: { $lte: now } }, { publishDate: { $exists: false } }, { publishDate: null }],
      },
      {
        $or: [{ expiryDate: null }, { expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }],
      },
      visibilityClause,
      sectionClause,
    ],
  };
  if (subjectId) q.subjectId = subjectId;
  if (materialType) q.materialType = materialType;
  if (search?.trim()) q.title = new RegExp(escapeRegex(search.trim()), "i");

  return StudyMaterial.find(q)
    .populate({ path: "subjectId", select: "name" })
    .populate({ path: "teacherId", populate: { path: "userId", select: "name email" } })
    .populate({ path: "classId", select: "name" })
    .sort({ publishDate: -1, createdAt: -1 });
};

const findStudyMaterialForStudentDownload = ({ schoolId, classId, section, studentId, materialId, now }) => {
  const sec = String(section || "").trim();
  return StudyMaterial.findOne({
    _id: materialId,
    schoolId,
    classId,
    fileUrl: { $nin: [null, ""] },
    $and: [
      {
        $or: [{ status: "PUBLISHED" }, { status: { $exists: false } }, { status: null }],
      },
      {
        $or: [{ allowDownload: true }, { allowDownload: { $exists: false } }],
      },
      {
        $or: [{ publishDate: { $lte: now } }, { publishDate: { $exists: false } }, { publishDate: null }],
      },
      {
        $or: [{ expiryDate: null }, { expiryDate: { $exists: false } }, { expiryDate: { $gte: now } }],
      },
      {
        $or: [
          { visibility: "PUBLIC" },
          { visibility: { $exists: false } },
          { visibility: null },
          {
            $and: [{ visibility: "RESTRICTED" }, { restrictedStudentIds: studentId }],
          },
        ],
      },
      {
        $or: [{ section: sec }, { section: { $exists: false } }, { section: "" }],
      },
    ],
  }).lean();
};

const incrementStudyMaterialDownload = ({ schoolId, materialId }) =>
  StudyMaterial.findOneAndUpdate({ schoolId, _id: materialId }, { $inc: { downloadCount: 1 } }, { new: true }).select(
    "downloadCount fileUrl"
  );

export const studentRepository = {
  findStudentByUser,
  findAttendanceByStudent,
  findResultByStudent,
  findAssignmentsByClass,
  findAssignmentsForStudent,
  upsertHomeworkSubmission,
  findHomeworkSubmissionsByStudent,
  findLibraryIssuesByStudent,
  findRegistrationLinks,
  createFeedback,
  findFeedbackByStudent,
  createComplaint,
  findComplaintsByStudent,
  findPlacementJobs,
  createPlacementApplication,
  findPlacementHistoryByStudent,
  findTimetableByClassSection,
  findNotificationsByUser,
  markNotificationRead,
  findFeeAssignmentsByStudent,
  findFeePaymentsByStudent,
  createFeePayment,
  findFeePaymentForStudent,
  findSchoolById,
  updateStudentById,
  updateUserById,
  findClassByIdSchool,
  createStudentLeave,
  findStudentLeavesByStudent,
  findStudentLeaveByIdPopulated,
  findTeacherUserIdBySchool,
  createNotification,
  findStudyMaterialsForStudent,
  findStudyMaterialForStudentDownload,
  incrementStudyMaterialDownload,
};
