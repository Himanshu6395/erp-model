import PDFDocument from "pdfkit";
import AppError from "../../common/errors/AppError.js";
import { studentRepository } from "./repository.js";
import { randomUUID } from "crypto";
import { LEAVE_TYPES } from "../../models/StudentLeave.js";
import { adminRepository } from "../admin/repository.js";
import * as feeDomain from "../admin/feeDomain.js";
import School from "../../models/School.js";
import { noticeRepository } from "../notices/notice.repository.js";
import { MATERIAL_TYPES } from "../../models/StudyMaterial.js";
import { examStudentService } from "../exams/examStudent.service.js";

const leaveTypeSet = new Set(LEAVE_TYPES);

const formatStudentLeave = (doc) => {
  const o = doc?.toObject ? doc.toObject() : { ...doc };
  return {
    ...o,
    leaveDisplayId: o._id ? `LV-${String(o._id).slice(-8).toUpperCase()}` : "",
  };
};

const inclusiveDayCount = (from, to) => {
  const a = new Date(from);
  const b = new Date(to);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = Math.round((b - a) / 86400000) + 1;
  return diff > 0 ? diff : 0;
};

const getLoggedInStudent = async (user) => {
  const student = await studentRepository.findStudentByUser({
    schoolId: user.schoolId,
    userId: user.userId,
  });
  if (!student) throw new AppError("Student profile not found", 404);
  return student;
};

/** Hide draft rows and exams not yet published to students. */
const isResultRowVisibleToStudent = (item) => {
  if (item.resultStatus && item.resultStatus !== "PUBLISHED") return false;
  const ex = item.examId;
  if (ex && typeof ex === "object" && !Array.isArray(ex) && ex.status) {
    if (ex.status !== "PUBLISHED") return false;
    if (ex.resultPublishDate) {
      const d = new Date(ex.resultPublishDate);
      if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) return false;
    }
  }
  return true;
};

const calcAttendanceSummary = (attendanceList) => {
  const totalDays = attendanceList.length;
  const presentDays = attendanceList.filter((item) => item.status === "PRESENT").length;
  const percentage = totalDays ? Number(((presentDays / totalDays) * 100).toFixed(2)) : 0;
  return { totalDays, presentDays, percentage };
};

const computeFeeSummaryForStudent = async (schoolId, studentId) => {
  const rows = await studentRepository.findFeeAssignmentsByStudent({ schoolId, studentId });
  let total = 0;
  let paid = 0;
  let fine = 0;
  for (const a of rows) {
    const plain = typeof a.toObject === "function" ? a.toObject() : a;
    const st = a.feeStructureId;
    const { fineAmount } = feeDomain.mergeFineAndStatus(plain, st);
    total += Number(plain.finalAmount || plain.amount || 0) + Number(fineAmount || 0);
    paid += Number(plain.paidAmount || 0);
    fine += Number(fineAmount || 0);
  }
  return { total, paid, pending: Math.max(total - paid, 0), fine };
};

const getDashboard = async (user) => {
  const student = await getLoggedInStudent(user);
  const studentId = student._id;
  const classId = student.classId?._id || student.classId;
  const schoolId = user.schoolId;

  const [attendanceList, noticesAll, assignments, feeSummary, library, links, notifications, placementJobs, complaints, studentLeaves] =
    await Promise.all([
      studentRepository.findAttendanceByStudent({ schoolId, studentId }),
      noticeRepository.findPublishedForStudent({ schoolId, student }),
      studentRepository.findAssignmentsForStudent({ schoolId, classId, studentSection: student.section }),
      computeFeeSummaryForStudent(schoolId, studentId),
      studentRepository.findLibraryIssuesByStudent({ schoolId, studentId }),
      studentRepository.findRegistrationLinks({ schoolId }),
      studentRepository.findNotificationsByUser({ schoolId, userId: user.userId }),
      studentRepository.findPlacementJobs({ schoolId }),
      studentRepository.findComplaintsByStudent({ schoolId, studentId }),
      studentRepository.findStudentLeavesByStudent({ schoolId, studentId }),
    ]);

  const attendanceSummary = calcAttendanceSummary(attendanceList);
  const notices = (noticesAll || []).slice(0, 5);

  const school = await studentRepository.findSchoolById(schoolId);

  return {
    schoolInfo: {
      name: school?.name || "",
      code: school?.code || "",
      address: school?.address || "",
    },
    student: {
      id: student._id,
      name: student.userId?.name,
      email: student.userId?.email,
      rollNumber: student.rollNumber,
      section: student.section,
      class: student.classId,
    },
    attendanceSummary,
    latestNotices: notices,
    assignments,
    feeSummary,
    librarySummary: {
      issuedBooks: library.length,
      pendingReturn: library.filter((item) => !item.returnDate).length,
    },
    linksCount: links.length,
    alertsCount: notifications.length,
    placementCount: placementJobs.length,
    complaintCount: complaints.length,
    leaveSummary: {
      pending: studentLeaves.filter((l) => l.status === "PENDING").length,
      approved: studentLeaves.filter((l) => l.status === "APPROVED").length,
      rejected: studentLeaves.filter((l) => l.status === "REJECTED").length,
      recent: studentLeaves.slice(0, 5).map(formatStudentLeave),
    },
  };
};

const getAttendance = async (user) => {
  const student = await getLoggedInStudent(user);
  const attendance = await studentRepository.findAttendanceByStudent({
    schoolId: user.schoolId,
    studentId: student._id,
  });
  return { attendance, summary: calcAttendanceSummary(attendance) };
};

const getResult = async (user) => {
  const student = await getLoggedInStudent(user);
  const subjects = await studentRepository.findResultByStudent({
    schoolId: user.schoolId,
    studentId: student._id,
  });
  const visible = subjects.filter(isResultRowVisibleToStudent);
  const totalMarks = visible.reduce((sum, item) => sum + (Number(item.marks) || 0), 0);
  const percentage = visible.length ? Number((totalMarks / visible.length).toFixed(2)) : 0;
  return { subjects: visible, totalMarks, percentage };
};

const getExamReportCard = async (user) => examStudentService.getExamReportCard(user);

const getFees = async (user) => {
  const student = await getLoggedInStudent(user);
  return computeFeeSummaryForStudent(user.schoolId, student._id);
};

const getAssignments = async (user) => {
  const student = await getLoggedInStudent(user);
  const [assignments, submissions] = await Promise.all([
    studentRepository.findAssignmentsForStudent({
      schoolId: user.schoolId,
      classId: student.classId,
      studentSection: student.section,
    }),
    studentRepository.findHomeworkSubmissionsByStudent({ schoolId: user.schoolId, studentId: student._id }),
  ]);
  const submittedSet = new Set(submissions.map((item) => String(item.assignmentId)));
  return assignments.map((item) => ({
    ...item.toObject(),
    submissionStatus: submittedSet.has(String(item._id)) ? "SUBMITTED" : "PENDING",
  }));
};

const submitAssignment = async (user, payload) => {
  const student = await getLoggedInStudent(user);
  const assignments = await studentRepository.findAssignmentsForStudent({
    schoolId: user.schoolId,
    classId: student.classId,
    studentSection: student.section,
  });
  const assignment = assignments.find((item) => String(item._id) === String(payload.assignmentId));
  if (!assignment) throw new AppError("Assignment not found for your class", 404);
  const submittedAt = new Date();
  const isLate = submittedAt > new Date(assignment.dueDate);
  return studentRepository.upsertHomeworkSubmission({
    schoolId: user.schoolId,
    assignmentId: payload.assignmentId,
    studentId: student._id,
    payload: {
      submissionText: payload.submissionText || "",
      attachments: payload.attachments || [],
      submittedAt,
      isLate,
    },
  });
};

const getNotices = async (user) => {
  const student = await getLoggedInStudent(user);
  return noticeRepository.findPublishedForStudent({ schoolId: user.schoolId, student });
};

const getStudentProfile = async (user) => {
  const student = await getLoggedInStudent(user);
  const attendance = await studentRepository.findAttendanceByStudent({ schoolId: user.schoolId, studentId: student._id });
  const results = await studentRepository.findResultByStudent({ schoolId: user.schoolId, studentId: student._id });
  const attendanceSummary = calcAttendanceSummary(attendance);
  const performanceSummary = {
    examsCount: results.length,
    averageMarks: results.length
      ? Number((results.reduce((sum, row) => sum + row.marks, 0) / results.length).toFixed(2))
      : 0,
  };
  const feeSummary = await computeFeeSummaryForStudent(user.schoolId, student._id);
  return { ...student.toObject(), attendanceSummary, performanceSummary, feeSummary };
};

const updateStudentProfile = async (user, payload) => {
  const student = await getLoggedInStudent(user);
  const phoneVal =
    payload.phone !== undefined || payload.mobileNumber !== undefined
      ? String(payload.phone ?? payload.mobileNumber ?? "").trim()
      : undefined;

  await studentRepository.updateUserById({
    userId: student.userId?._id || user.userId,
    payload: {
      ...(payload.name ? { name: payload.name } : {}),
      ...(phoneVal !== undefined ? { phone: phoneVal } : {}),
    },
  });

  return studentRepository.updateStudentById({
    schoolId: user.schoolId,
    studentId: student._id,
    payload: {
      ...(phoneVal !== undefined ? { phone: phoneVal } : {}),
      ...(payload.address !== undefined ? { address: payload.address } : {}),
      ...(payload.parentPhone !== undefined ? { parentPhone: payload.parentPhone } : {}),
      ...(payload.profileImage !== undefined ? { profileImage: payload.profileImage } : {}),
      ...(payload.alternatePhone !== undefined || payload.alternateMobile !== undefined
        ? { alternatePhone: payload.alternatePhone ?? payload.alternateMobile ?? "" }
        : {}),
      ...(payload.city !== undefined ? { city: payload.city } : {}),
      ...(payload.state !== undefined ? { state: payload.state } : {}),
      ...(payload.pincode !== undefined ? { pincode: payload.pincode } : {}),
    },
  });
};

const getLibrary = async (user) => {
  const student = await getLoggedInStudent(user);
  const issues = await studentRepository.findLibraryIssuesByStudent({ schoolId: user.schoolId, studentId: student._id });
  return {
    issuedBooks: issues.filter((item) => !item.returnDate),
    history: issues,
    totalFine: issues.reduce((sum, item) => sum + (item.fine || 0), 0),
  };
};

const getLinksRegistration = async (user) => studentRepository.findRegistrationLinks({ schoolId: user.schoolId });

const submitFeedback = async (user, payload) => {
  const student = await getLoggedInStudent(user);
  return studentRepository.createFeedback({
    schoolId: user.schoolId,
    studentId: student._id,
    message: payload.message,
    rating: Number(payload.rating || 5),
  });
};

const getFeedbackHistory = async (user) => {
  const student = await getLoggedInStudent(user);
  return studentRepository.findFeedbackByStudent({ schoolId: user.schoolId, studentId: student._id });
};

const getPlacementJobs = async (user) => studentRepository.findPlacementJobs({ schoolId: user.schoolId });

const applyPlacement = async (user, payload) => {
  const student = await getLoggedInStudent(user);
  return studentRepository.createPlacementApplication({
    schoolId: user.schoolId,
    studentId: student._id,
    jobId: payload.jobId,
    status: "APPLIED",
  });
};

const getPlacementHistory = async (user) => {
  const student = await getLoggedInStudent(user);
  return studentRepository.findPlacementHistoryByStudent({ schoolId: user.schoolId, studentId: student._id });
};

const createComplaint = async (user, payload) => {
  const student = await getLoggedInStudent(user);
  return studentRepository.createComplaint({
    schoolId: user.schoolId,
    studentId: student._id,
    title: payload.title,
    description: payload.description,
    status: "OPEN",
  });
};

const getComplaints = async (user) => {
  const student = await getLoggedInStudent(user);
  return studentRepository.findComplaintsByStudent({ schoolId: user.schoolId, studentId: student._id });
};

const getFeesDetails = async (user) => {
  const student = await getLoggedInStudent(user);
  const [summary, assignments, payments] = await Promise.all([
    getFees(user),
    studentRepository.findFeeAssignmentsByStudent({ schoolId: user.schoolId, studentId: student._id }),
    studentRepository.findFeePaymentsByStudent({ schoolId: user.schoolId, studentId: student._id }),
  ]);
  const structure = assignments.map((a) => {
    const plain = typeof a.toObject === "function" ? a.toObject() : a;
    const fs = a.feeStructureId;
    const { fineAmount, status } = feeDomain.mergeFineAndStatus(plain, fs);
    const due = Number(plain.finalAmount || plain.amount || 0) + Number(fineAmount || 0);
    const paidAmt = Number(plain.paidAmount || 0);
    return {
      ...plain,
      computedFineAmount: fineAmount,
      computedStatus: status,
      remaining: Math.max(due - paidAmt, 0),
    };
  });
  return { summary, structure, paymentHistory: payments };
};

const payFees = async (user, payload) => {
  const student = await getLoggedInStudent(user);
  const studentFeeId = payload.studentFeeId;
  if (!studentFeeId) throw new AppError("studentFeeId is required", 400);
  const assignment = await adminRepository.findFeeAssignmentById({
    schoolId: user.schoolId,
    assignmentId: studentFeeId,
  });
  if (!assignment) throw new AppError("Fee record not found", 404);
  if (String(assignment.studentId?._id || assignment.studentId) !== String(student._id)) {
    throw new AppError("You cannot pay this fee record", 403);
  }
  const structure = assignment.feeStructureId;
  if (!structure) throw new AppError("Fee structure missing", 400);
  const payAmount = Number(payload.amount || 0);
  const receiptNumber = await feeDomain.generateReceiptNumber(user.schoolId);
  const payment = await feeDomain.applyPaymentToAssignment({
    assignment,
    structure,
    payAmount,
    adminRepo: adminRepository,
    paymentPayload: {
      schoolId: user.schoolId,
      studentId: student._id,
      studentFeeId: assignment._id,
      amount: payAmount,
      paymentDate: new Date(),
      paymentMode: payload.paymentMode || "UPI",
      paymentMethod: String(payload.paymentMode || "online").toLowerCase(),
      transactionId: String(payload.transactionId || "").trim(),
      collectedByUserId: null,
      receiptNumber,
      note: payload.note || "Student portal",
    },
  });
  await studentRepository.createNotification({
    schoolId: user.schoolId,
    userId: user.userId,
    title: "Payment recorded",
    message: `₹${payAmount.toFixed(2)} received for ${structure.title || "fees"}. Receipt ${receiptNumber}.`,
    type: "FEE_PAYMENT",
  });
  return payment;
};

const downloadFeeReceiptPDF = async (user, paymentId) => {
  const student = await getLoggedInStudent(user);
  const payment = await studentRepository.findFeePaymentForStudent({
    schoolId: user.schoolId,
    studentId: student._id,
    paymentId,
  });
  if (!payment) throw new AppError("Receipt not found", 404);
  const school = await School.findById(user.schoolId).lean();
  const assign = payment.studentFeeId;
  const feeSt = assign?.feeStructureId;
  const breakdown = feeSt?.feesBreakdown || assign?.feesBreakdownSnapshot;

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(18).text(school?.name || "School", { align: "center" });
    doc.fontSize(14).text("Fee Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Receipt No: ${payment.receiptNumber || payment._id}`);
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleString()}`);
    doc.text(`Student: ${payment.studentId?.userId?.name || "-"}`);
    doc.moveDown();
    if (breakdown) {
      doc.text("Fee breakdown:");
      doc.text(`  Tuition: ₹${breakdown.tuitionFee ?? 0}`);
      doc.text(`  Transport: ₹${breakdown.transportFee ?? 0}`);
      doc.text(`  Exam: ₹${breakdown.examFee ?? 0}`);
    }
    doc.moveDown();
    doc.text(`Amount paid: ₹${payment.amount}`);
    doc.text(`Mode: ${payment.paymentMode || payment.paymentMethod}`);
    if (payment.transactionId) doc.text(`Txn: ${payment.transactionId}`);
    doc.end();
  });
};

const getTimetable = async (user, params = {}) => {
  const student = await getLoggedInStudent(user);
  const classId = student.classId?._id || student.classId;
  return studentRepository.findTimetableByClassSection({
    schoolId: user.schoolId,
    classId,
    section: student.section,
    day: params.day || undefined,
    academicYear: params.academicYear || "2025-2026",
  });
};

const getTimetableStudent = async (user, params = {}) => getTimetable(user, params);

const materialTypeSet = new Set(MATERIAL_TYPES);

const formatStudentMaterial = (doc) => {
  const o = doc.toObject ? doc.toObject() : doc;
  const subj = o.subjectId && typeof o.subjectId === "object" ? o.subjectId.name : "";
  return {
    _id: o._id,
    title: o.title,
    description: o.description,
    topic: o.topic,
    materialType: o.materialType,
    subjectName: subj || o.subject || "",
    subjectId: o.subjectId?._id || o.subjectId,
    teacherName: o.teacherId?.userId?.name || "",
    uploadDate: o.createdAt,
    publishDate: o.publishDate,
    priority: o.priority,
    allowDownload: o.allowDownload,
    externalLink: o.externalLink,
    fileUrl: o.fileUrl,
    thumbnail: o.thumbnail,
    allowComments: o.allowComments,
  };
};

const getStudyMaterialsStudent = async (user, query = {}) => {
  const student = await getLoggedInStudent(user);
  const classId = student.classId?._id || student.classId;
  const now = new Date();
  const materialType = query.materialType;
  if (materialType && !materialTypeSet.has(materialType)) throw new AppError("Invalid material type", 400);

  const rows = await studentRepository.findStudyMaterialsForStudent({
    schoolId: user.schoolId,
    classId,
    section: student.section,
    studentId: student._id,
    subjectId: query.subjectId || undefined,
    materialType: materialType && materialTypeSet.has(materialType) ? materialType : undefined,
    search: query.search,
    now,
  });
  const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const sorted = [...rows].sort((a, b) => {
    const pa = rank[a.priority] ?? 1;
    const pb = rank[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    return new Date(b.publishDate) - new Date(a.publishDate);
  });
  return sorted.map(formatStudentMaterial);
};

const registerStudyMaterialDownload = async (user, materialId) => {
  const student = await getLoggedInStudent(user);
  const classId = student.classId?._id || student.classId;
  const now = new Date();
  const doc = await studentRepository.findStudyMaterialForStudentDownload({
    schoolId: user.schoolId,
    classId,
    section: student.section,
    studentId: student._id,
    materialId,
    now,
  });
  if (!doc) throw new AppError("Material not available for download", 404);
  const updated = await studentRepository.incrementStudyMaterialDownload({ schoolId: user.schoolId, materialId });
  return { fileUrl: doc.fileUrl, downloadCount: updated?.downloadCount ?? (doc.downloadCount || 0) + 1 };
};

const getAlertsNotifications = async (user) =>
  studentRepository.findNotificationsByUser({ schoolId: user.schoolId, userId: user.userId });

const markAlertRead = async (user, notificationId) => {
  const row = await studentRepository.markNotificationRead({ schoolId: user.schoolId, userId: user.userId, notificationId });
  if (!row) throw new AppError("Notification not found", 404);
  return row;
};

const getNoticeBoard = async (user) => getNotices(user);

const applyStudentLeave = async (user, body, file) => {
  const student = await getLoggedInStudent(user);
  const classId = student.classId?._id || student.classId;
  const cls = await studentRepository.findClassByIdSchool({ schoolId: user.schoolId, classId });
  if (!cls) throw new AppError("Class not found", 404);
  if (!cls.classTeacherId) throw new AppError("No class teacher is assigned to your class. Contact the school office.", 400);

  const leaveType = String(body.leaveType || "").toUpperCase();
  if (!leaveTypeSet.has(leaveType)) throw new AppError("Invalid leave type", 400);

  const fromDate = new Date(body.fromDate);
  const toDate = new Date(body.toDate);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) throw new AppError("Invalid dates", 400);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  if (toDate < fromDate) throw new AppError("End date cannot be before start date", 400);

  const totalDays = inclusiveDayCount(fromDate, toDate);
  if (totalDays < 1) throw new AppError("Invalid leave duration", 400);

  const reason = String(body.reason || "").trim();
  if (!reason) throw new AppError("Reason is required", 400);

  const parentName = String(body.parentName || "").trim();
  if (!parentName) throw new AppError("Parent name is required", 400);

  const contactPhone = String(body.contactPhone || "").trim();
  if (!contactPhone) throw new AppError("Contact number is required", 400);

  const attachmentUrl = file ? `/uploads/student-leaves/${file.filename}` : "";

  const created = await studentRepository.createStudentLeave({
    schoolId: user.schoolId,
    studentId: student._id,
    classId,
    classTeacherId: cls.classTeacherId,
    leaveType,
    fromDate,
    toDate,
    totalDays,
    reason,
    attachmentUrl,
    contactPhone,
    parentName,
    status: "PENDING",
  });

  const row = await studentRepository.findStudentLeaveByIdPopulated(created._id);

  const teacherRef = await studentRepository.findTeacherUserIdBySchool({
    schoolId: user.schoolId,
    teacherId: cls.classTeacherId,
  });
  if (teacherRef?.userId) {
    await studentRepository.createNotification({
      schoolId: user.schoolId,
      userId: teacherRef.userId,
      title: "New student leave request",
      message: `${student.userId?.name || "A student"} submitted a ${leaveType} leave for ${totalDays} day(s). Review it under Student leaves.`,
      type: "STUDENT_LEAVE",
    });
  }

  return formatStudentLeave(row || created);
};

const listStudentLeaves = async (user) => {
  const student = await getLoggedInStudent(user);
  const rows = await studentRepository.findStudentLeavesByStudent({
    schoolId: user.schoolId,
    studentId: student._id,
  });
  return rows.map(formatStudentLeave);
};

const getAdmitCardPDF = async (user) => {
  const student = await getLoggedInStudent(user);
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("School ERP - Admit Card", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Student Name: ${student.userId?.name || ""}`);
    doc.text(`Email: ${student.userId?.email || ""}`);
    doc.text(`Roll Number: ${student.rollNumber}`);
    doc.text(`Section: ${student.section}`);
    doc.text(`Class: ${student.classId?.name || ""}`);
    doc.text(`School ID: ${user.schoolId}`);
    doc.moveDown();
    doc.text("This is a dummy admit card generated for demo/testing.");
    doc.end();
  });
};

export const studentService = {
  getDashboard,
  getStudentProfile,
  updateStudentProfile,
  getAttendance,
  getResult,
  getExamReportCard,
  getFeesDetails,
  payFees,
  downloadFeeReceiptPDF,
  getFees,
  getAssignments,
  submitAssignment,
  getLibrary,
  getLinksRegistration,
  submitFeedback,
  getFeedbackHistory,
  getPlacementJobs,
  applyPlacement,
  getPlacementHistory,
  createComplaint,
  getComplaints,
  getTimetable,
  getTimetableStudent,
  getStudyMaterialsStudent,
  registerStudyMaterialDownload,
  getAlertsNotifications,
  markAlertRead,
  getNoticeBoard,
  getNotices,
  getNoticesStudent: getNotices,
  getAdmitCardPDF,
  applyStudentLeave,
  listStudentLeaves,
};
