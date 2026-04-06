import { adminService } from "./service.js";
import { timetableAdminService } from "../timetable/timetableAdmin.service.js";
import { examAdminService } from "../exams/examAdmin.service.js";

const getDashboard = async (req, res) => {
  const data = await adminService.getDashboard(req.user);
  return res.json({ success: true, data });
};

const createStudent = async (req, res) => {
  const data = await adminService.createStudent(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const listStudents = async (req, res) => {
  const data = await adminService.listStudents(req.user, req.query);
  return res.json({ success: true, data });
};

const getStudentById = async (req, res) => {
  const data = await adminService.getStudentById(req.user, req.params.studentId);
  return res.json({ success: true, data });
};

const updateStudent = async (req, res) => {
  const data = await adminService.updateStudent(req.user, req.params.studentId, req.body);
  return res.json({ success: true, data });
};

const deleteStudent = async (req, res) => {
  const data = await adminService.deleteStudent(req.user, req.params.studentId);
  return res.json({ success: true, data });
};

const bulkImportStudents = async (req, res) => {
  const data = await adminService.bulkImportStudents(req.user, req.body.csvText || "");
  return res.status(201).json({ success: true, data });
};

const generateStudentIdCard = async (req, res) => {
  const pdfBuffer = await adminService.generateStudentIdCardPDF(req.user, req.params.studentId);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=student-id-card.pdf");
  return res.send(pdfBuffer);
};

const createTeacher = async (req, res) => {
  const data = await adminService.createTeacher(req.user, req.body, req.files || {});
  return res.status(201).json({ success: true, data });
};

const listTeachers = async (req, res) => {
  const data = await adminService.listTeachers(req.user, req.query);
  return res.json({ success: true, data });
};

const getTeacherById = async (req, res) => {
  const data = await adminService.getTeacherById(req.user, req.params.teacherId);
  return res.json({ success: true, data });
};

const updateTeacher = async (req, res) => {
  const data = await adminService.updateTeacher(req.user, req.params.teacherId, req.body, req.files || {});
  return res.json({ success: true, data });
};

const deleteTeacher = async (req, res) => {
  const data = await adminService.deleteTeacher(req.user, req.params.teacherId);
  return res.json({ success: true, data });
};

const createClass = async (req, res) => {
  const data = await adminService.createClass(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const listClasses = async (req, res) => {
  const data = await adminService.listClasses(req.user);
  return res.json({ success: true, data });
};

const updateClass = async (req, res) => {
  const data = await adminService.updateClass(req.user, req.params.classId, req.body);
  return res.json({ success: true, data });
};

const deleteClass = async (req, res) => {
  const data = await adminService.deleteClass(req.user, req.params.classId);
  return res.json({ success: true, data });
};

const createSubject = async (req, res) => {
  const data = await adminService.createSubject(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const listSubjects = async (req, res) => {
  const data = await adminService.listSubjects(req.user);
  return res.json({ success: true, data });
};

const updateSubject = async (req, res) => {
  const data = await adminService.updateSubject(req.user, req.params.subjectId, req.body);
  return res.json({ success: true, data });
};

const deleteSubject = async (req, res) => {
  const data = await adminService.deleteSubject(req.user, req.params.subjectId);
  return res.json({ success: true, data });
};

const markStudentAttendance = async (req, res) => {
  const data = await adminService.markStudentAttendance(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const studentAttendanceReport = async (req, res) => {
  const data = await adminService.studentAttendanceReport(req.user, req.query);
  return res.json({ success: true, data });
};

const markTeacherAttendance = async (req, res) => {
  const data = await adminService.markTeacherAttendance(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const teacherAttendanceReport = async (req, res) => {
  const data = await adminService.teacherAttendanceReport(req.user, req.query);
  return res.json({ success: true, data });
};

const monthlyAttendanceSummary = async (req, res) => {
  const data = await adminService.monthlyAttendanceSummary(req.user, req.query);
  return res.json({ success: true, data });
};

const createFeeStructure = async (req, res) => {
  const data = await adminService.createFeeStructure(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const getFeeStructures = async (req, res) => {
  const data = await adminService.getFeeStructures(req.user);
  return res.json({ success: true, data });
};

const assignFees = async (req, res) => {
  const data = await adminService.assignFees(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const collectFeePayment = async (req, res) => {
  const data = await adminService.collectFeePayment(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const generateFeeReceipt = async (req, res) => {
  const pdfBuffer = await adminService.generateFeeReceiptPDF(req.user, req.params.paymentId);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=fee-receipt.pdf");
  return res.send(pdfBuffer);
};

const getPendingDues = async (req, res) => {
  const data = await adminService.getPendingDues(req.user);
  return res.json({ success: true, data });
};

const listStudentFeesAdmin = async (req, res) => {
  const data = await adminService.listStudentFeesAdmin(req.user, req.query);
  return res.json({ success: true, data });
};

const exportStudentFeesCsv = async (req, res) => {
  const csv = await adminService.exportStudentFeesCsv(req.user, req.query);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=student-fees.csv");
  return res.send(csv);
};

const getStudentFeeOne = async (req, res) => {
  const data = await adminService.getStudentFeeOne(req.user, req.params.assignmentId);
  return res.json({ success: true, data });
};

const patchStudentFee = async (req, res) => {
  const data = await adminService.patchStudentFee(req.user, req.params.assignmentId, req.body);
  return res.json({ success: true, data });
};

const assignFeesBulk = async (req, res) => {
  const data = await adminService.assignFeesBulk(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const sendFeeReminder = async (req, res) => {
  const data = await adminService.sendFeeReminder(req.user, req.params.assignmentId);
  return res.json({ success: true, data });
};

const getAnalyticsReport = async (req, res) => {
  const data = await adminService.getAnalyticsReport(req.user);
  return res.json({ success: true, data });
};

const createNotice = async (req, res) => {
  const data = await adminService.createNotice(req.user, req.body, req.file);
  return res.status(201).json({ success: true, data });
};

const listNotices = async (req, res) => {
  const data = await adminService.listNotices(req.user, req.query);
  return res.json({ success: true, data });
};

const updateNotice = async (req, res) => {
  const data = await adminService.updateNotice(req.user, req.params.noticeId, req.body, req.file);
  return res.json({ success: true, data });
};

const deleteNotice = async (req, res) => {
  const data = await adminService.deleteNotice(req.user, req.params.noticeId);
  return res.json({ success: true, data });
};

const updateSchoolProfile = async (req, res) => {
  const data = await adminService.updateSchoolProfile(req.user, req.body);
  return res.json({ success: true, data });
};

const changePassword = async (req, res) => {
  const data = await adminService.changePassword(req.user, req.body);
  return res.json({ success: true, data });
};

const createTimetableEntry = async (req, res) => {
  const data = await timetableAdminService.create(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const bulkTimetable = async (req, res) => {
  const data = await timetableAdminService.bulkCreate(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const listTimetableAdmin = async (req, res) => {
  const data = await timetableAdminService.list(req.user, req.query);
  return res.json({ success: true, data });
};

const timetableDashboard = async (req, res) => {
  const data = await timetableAdminService.dashboard(req.user, req.query);
  return res.json({ success: true, data });
};

const updateTimetableEntry = async (req, res) => {
  const data = await timetableAdminService.update(req.user, req.params.timetableId, req.body);
  return res.json({ success: true, data });
};

const deleteTimetableEntry = async (req, res) => {
  const data = await timetableAdminService.remove(req.user, req.params.timetableId);
  return res.json({ success: true, data });
};

const createExamSession = async (req, res) => {
  const data = await examAdminService.createExamSession(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const listExamSessions = async (req, res) => {
  const data = await examAdminService.listExamSessions(req.user, req.query);
  return res.json({ success: true, data });
};

const getExamSession = async (req, res) => {
  const data = await examAdminService.getExamSession(req.user, req.params.examId);
  return res.json({ success: true, data });
};

const updateExamSession = async (req, res) => {
  const data = await examAdminService.updateExamSession(req.user, req.params.examId, req.body);
  return res.json({ success: true, data });
};

const addExamSubject = async (req, res) => {
  const data = await examAdminService.addExamSubject(req.user, req.params.examId, req.body);
  return res.status(201).json({ success: true, data });
};

const getExamDashboard = async (req, res) => {
  const data = await examAdminService.getExamDashboard(req.user, req.params.examId);
  return res.json({ success: true, data });
};

export const adminController = {
  getDashboard,
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
  generateStudentIdCard,
  createTeacher,
  listTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  createClass,
  listClasses,
  updateClass,
  deleteClass,
  createSubject,
  listSubjects,
  updateSubject,
  deleteSubject,
  markStudentAttendance,
  studentAttendanceReport,
  markTeacherAttendance,
  teacherAttendanceReport,
  monthlyAttendanceSummary,
  createFeeStructure,
  getFeeStructures,
  assignFees,
  assignFeesBulk,
  listStudentFeesAdmin,
  exportStudentFeesCsv,
  getStudentFeeOne,
  patchStudentFee,
  sendFeeReminder,
  collectFeePayment,
  generateFeeReceipt,
  getPendingDues,
  getAnalyticsReport,
  createNotice,
  listNotices,
  updateNotice,
  deleteNotice,
  updateSchoolProfile,
  changePassword,
  createTimetableEntry,
  bulkTimetable,
  listTimetableAdmin,
  timetableDashboard,
  updateTimetableEntry,
  deleteTimetableEntry,
  createExamSession,
  listExamSessions,
  getExamSession,
  updateExamSession,
  addExamSubject,
  getExamDashboard,
};
