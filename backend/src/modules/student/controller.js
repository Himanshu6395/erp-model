import { studentService } from "./service.js";

const getDashboard = async (req, res) => {
  const data = await studentService.getDashboard(req.user);
  return res.json({ success: true, data });
};

const getProfile = async (req, res) => {
  const data = await studentService.getStudentProfile(req.user);
  return res.json({ success: true, data });
};

const updateProfile = async (req, res) => {
  const data = await studentService.updateStudentProfile(req.user, req.body);
  return res.json({ success: true, data });
};

const getAttendance = async (req, res) => {
  const data = await studentService.getAttendance(req.user);
  return res.json({ success: true, data });
};

const getResult = async (req, res) => {
  const data = await studentService.getResult(req.user);
  return res.json({ success: true, data });
};

const getExamReportCard = async (req, res) => {
  const data = await studentService.getExamReportCard(req.user);
  return res.json({ success: true, data });
};

const getFees = async (req, res) => {
  const data = await studentService.getFees(req.user);
  return res.json({ success: true, data });
};

const getAssignments = async (req, res) => {
  const data = await studentService.getAssignments(req.user);
  return res.json({ success: true, data });
};

const submitAssignment = async (req, res) => {
  const data = await studentService.submitAssignment(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const getNotices = async (req, res) => {
  const data = await studentService.getNotices(req.user);
  return res.json({ success: true, data });
};

const getNoticesStudent = async (req, res) => {
  const data = await studentService.getNoticesStudent(req.user);
  return res.json({ success: true, data });
};

const getLibrary = async (req, res) => {
  const data = await studentService.getLibrary(req.user);
  return res.json({ success: true, data });
};

const getLinksRegistration = async (req, res) => {
  const data = await studentService.getLinksRegistration(req.user);
  return res.json({ success: true, data });
};

const submitFeedback = async (req, res) => {
  const data = await studentService.submitFeedback(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const getFeedbackHistory = async (req, res) => {
  const data = await studentService.getFeedbackHistory(req.user);
  return res.json({ success: true, data });
};

const getPlacementJobs = async (req, res) => {
  const data = await studentService.getPlacementJobs(req.user);
  return res.json({ success: true, data });
};

const applyPlacement = async (req, res) => {
  const data = await studentService.applyPlacement(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const getPlacementHistory = async (req, res) => {
  const data = await studentService.getPlacementHistory(req.user);
  return res.json({ success: true, data });
};

const createComplaint = async (req, res) => {
  const data = await studentService.createComplaint(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const getComplaints = async (req, res) => {
  const data = await studentService.getComplaints(req.user);
  return res.json({ success: true, data });
};

const getFeesDetails = async (req, res) => {
  const data = await studentService.getFeesDetails(req.user);
  return res.json({ success: true, data });
};

const payFees = async (req, res) => {
  const data = await studentService.payFees(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const downloadFeeReceipt = async (req, res) => {
  const pdfBuffer = await studentService.downloadFeeReceiptPDF(req.user, req.params.paymentId);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=fee-receipt.pdf");
  return res.send(pdfBuffer);
};

const getTimetable = async (req, res) => {
  const data = await studentService.getTimetable(req.user, req.query);
  return res.json({ success: true, data });
};

const getTimetableStudent = async (req, res) => {
  const data = await studentService.getTimetableStudent(req.user, req.query);
  return res.json({ success: true, data });
};

const getAlertsNotifications = async (req, res) => {
  const data = await studentService.getAlertsNotifications(req.user);
  return res.json({ success: true, data });
};

const markAlertRead = async (req, res) => {
  const data = await studentService.markAlertRead(req.user, req.params.notificationId);
  return res.json({ success: true, data });
};

const getNoticeBoard = async (req, res) => {
  const data = await studentService.getNoticeBoard(req.user);
  return res.json({ success: true, data });
};

const getAdmitCard = async (req, res) => {
  const pdfBuffer = await studentService.getAdmitCardPDF(req.user);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=admit-card.pdf");
  return res.send(pdfBuffer);
};

const applyStudentLeave = async (req, res) => {
  const data = await studentService.applyStudentLeave(req.user, req.body, req.file);
  return res.status(201).json({ success: true, data });
};

const listStudentLeaves = async (req, res) => {
  const data = await studentService.listStudentLeaves(req.user);
  return res.json({ success: true, data });
};

const getStudyMaterialsStudent = async (req, res) => {
  const data = await studentService.getStudyMaterialsStudent(req.user, req.query);
  return res.json({ success: true, data });
};

const registerStudyMaterialDownload = async (req, res) => {
  const data = await studentService.registerStudyMaterialDownload(req.user, req.params.materialId);
  return res.json({ success: true, data });
};

export const studentController = {
  getDashboard,
  getProfile,
  updateProfile,
  getAttendance,
  getResult,
  getExamReportCard,
  getFeesDetails,
  payFees,
  downloadFeeReceipt,
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
  getAlertsNotifications,
  markAlertRead,
  getNoticeBoard,
  getNotices,
  getNoticesStudent,
  getAdmitCard,
  applyStudentLeave,
  listStudentLeaves,
  getStudyMaterialsStudent,
  registerStudyMaterialDownload,
};
