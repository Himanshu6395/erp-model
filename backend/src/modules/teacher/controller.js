import { teacherService } from "./service.js";
import { examTeacherService } from "../exams/examTeacher.service.js";

const getDashboard = async (req, res) => res.json({ success: true, data: await teacherService.getDashboard(req.user) });
const listStudents = async (req, res) => res.json({ success: true, data: await teacherService.listAssignedStudents(req.user, req.query) });
const getStudentProfile = async (req, res) =>
  res.json({ success: true, data: await teacherService.getStudentProfile(req.user, req.params.studentId) });

const markAttendance = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.markAttendance(req.user, req.body, req.ip) });
const getDailyAttendanceRoster = async (req, res) =>
  res.json({ success: true, data: await teacherService.getDailyAttendanceRoster(req.user, req.query) });
const saveDailyAttendanceBatch = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.saveDailyAttendanceBatch(req.user, req.body, req.ip) });
const bulkMarkAttendance = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.bulkMarkAttendance(req.user, req.body, req.ip) });
const attendanceReports = async (req, res) =>
  res.json({ success: true, data: await teacherService.attendanceReports(req.user, req.query) });
const getMonthlyAttendanceGrid = async (req, res) =>
  res.json({ success: true, data: await teacherService.getMonthlyAttendanceGrid(req.user, req.query) });

const createHomework = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.createHomework(req.user, req.body, req.ip) });
const getHomeworkScope = async (req, res) =>
  res.json({ success: true, data: await teacherService.getHomeworkScope(req.user) });
const updateHomework = async (req, res) =>
  res.json({ success: true, data: await teacherService.updateHomework(req.user, req.params.assignmentId, req.body, req.ip) });
const deleteHomework = async (req, res) =>
  res.json({ success: true, data: await teacherService.deleteHomework(req.user, req.params.assignmentId, req.ip) });
const listHomework = async (req, res) => res.json({ success: true, data: await teacherService.listHomework(req.user) });

const createExam = async (req, res) => res.status(201).json({ success: true, data: await teacherService.createExam(req.user, req.body) });
const listExams = async (req, res) => res.json({ success: true, data: await teacherService.listExams(req.user) });
const upsertMarks = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.upsertMarks(req.user, req.body, req.ip) });
const getStudentResults = async (req, res) =>
  res.json({ success: true, data: await teacherService.getStudentResults(req.user, req.params.studentId) });

const getExamMarksGrid = async (req, res) =>
  res.json({ success: true, data: await examTeacherService.getMarksTeacher(req.user, req.query) });

const saveExamMarksBulk = async (req, res) =>
  res.status(201).json({ success: true, data: await examTeacherService.saveMarksBulk(req.user, req.body, req.ip) });

const getTimetable = async (req, res) => res.json({ success: true, data: await teacherService.getTimetable(req.user, req.query) });
const getTodayTimetable = async (req, res) =>
  res.json({ success: true, data: await teacherService.getTodayTimetable(req.user, req.query) });

const sendCommunication = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.sendCommunication(req.user, req.body, req.ip) });
const communicationHistory = async (req, res) =>
  res.json({ success: true, data: await teacherService.communicationHistory(req.user) });

const listTeacherNotices = async (req, res) =>
  res.json({ success: true, data: await teacherService.listTeacherNotices(req.user) });
const listAnnouncements = async (req, res) =>
  res.json({ success: true, data: await teacherService.listAnnouncements(req.user) });

const createStudyMaterial = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.createStudyMaterial(req.user, req.body) });
const createStudyMaterialMultipart = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.createStudyMaterialMultipart(req.user, req.body, req.files) });
const listStudyMaterial = async (req, res) =>
  res.json({ success: true, data: await teacherService.listStudyMaterial(req.user) });
const listMaterialsTeacher = async (req, res) =>
  res.json({ success: true, data: await teacherService.listStudyMaterialsTeacher(req.user, req.query) });
const updateStudyMaterial = async (req, res) =>
  res.json({ success: true, data: await teacherService.updateStudyMaterial(req.user, req.params.materialId, req.body, req.files) });
const deleteStudyMaterial = async (req, res) =>
  res.json({ success: true, data: await teacherService.deleteStudyMaterial(req.user, req.params.materialId) });
const listAssignedClassesWithSubjects = async (req, res) =>
  res.json({ success: true, data: await teacherService.listAssignedClassesWithSubjects(req.user) });

const studentPerformanceInsights = async (req, res) =>
  res.json({ success: true, data: await teacherService.studentPerformanceInsights(req.user) });

const applyLeave = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.applyLeave(req.user, req.body) });
const cancelLeave = async (req, res) =>
  res.json({ success: true, data: await teacherService.cancelLeave(req.user, req.params.leaveId) });
const listLeaves = async (req, res) => res.json({ success: true, data: await teacherService.listLeaves(req.user) });

const listStudentLeavesForClassTeacher = async (req, res) =>
  res.json({ success: true, data: await teacherService.listStudentLeavesForClassTeacher(req.user, req.query) });

const getStudentLeaveStats = async (req, res) =>
  res.json({ success: true, data: await teacherService.getStudentLeaveStatsForClassTeacher(req.user) });

const decideStudentLeave = async (req, res) =>
  res.json({
    success: true,
    data: await teacherService.decideStudentLeave(req.user, req.params.leaveId, req.body, req.ip),
  });

const createDiary = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.createDiary(req.user, req.body) });
const listDiary = async (req, res) => res.json({ success: true, data: await teacherService.listDiary(req.user) });

const scheduleOnlineClass = async (req, res) =>
  res.status(201).json({ success: true, data: await teacherService.scheduleOnlineClass(req.user, req.body) });
const listOnlineClasses = async (req, res) =>
  res.json({ success: true, data: await teacherService.listOnlineClasses(req.user) });

const listDoubts = async (req, res) => res.json({ success: true, data: await teacherService.listDoubts(req.user) });
const answerDoubt = async (req, res) =>
  res.json({ success: true, data: await teacherService.answerDoubt(req.user, req.params.doubtId, req.body.answer) });

const listNotifications = async (req, res) =>
  res.json({ success: true, data: await teacherService.listNotifications(req.user) });
const markNotificationRead = async (req, res) =>
  res.json({ success: true, data: await teacherService.markNotificationRead(req.user, req.params.notificationId) });

const updateProfile = async (req, res) =>
  res.json({ success: true, data: await teacherService.updateProfile(req.user, req.body) });
const changePassword = async (req, res) =>
  res.json({ success: true, data: await teacherService.changePassword(req.user, req.body) });

const salaryAndPayslip = async (req, res) =>
  res.json({ success: true, data: await teacherService.salaryAndPayslip(req.user) });
const activityLogs = async (req, res) => res.json({ success: true, data: await teacherService.activityLogs(req.user) });

export const teacherController = {
  getDashboard,
  listStudents,
  getStudentProfile,
  markAttendance,
  getDailyAttendanceRoster,
  saveDailyAttendanceBatch,
  bulkMarkAttendance,
  attendanceReports,
  getMonthlyAttendanceGrid,
  createHomework,
  getHomeworkScope,
  updateHomework,
  deleteHomework,
  listHomework,
  createExam,
  listExams,
  upsertMarks,
  getStudentResults,
  getExamMarksGrid,
  saveExamMarksBulk,
  getTimetable,
  getTodayTimetable,
  sendCommunication,
  communicationHistory,
  listTeacherNotices,
  listAnnouncements,
  createStudyMaterial,
  createStudyMaterialMultipart,
  listStudyMaterial,
  listMaterialsTeacher,
  updateStudyMaterial,
  deleteStudyMaterial,
  listAssignedClassesWithSubjects,
  studentPerformanceInsights,
  applyLeave,
  cancelLeave,
  listLeaves,
  listStudentLeavesForClassTeacher,
  getStudentLeaveStats,
  decideStudentLeave,
  createDiary,
  listDiary,
  scheduleOnlineClass,
  listOnlineClasses,
  listDoubts,
  answerDoubt,
  listNotifications,
  markNotificationRead,
  updateProfile,
  changePassword,
  salaryAndPayslip,
  activityLogs,
};
