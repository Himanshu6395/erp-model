import { Router } from "express";
import { body, param, query } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { studentController } from "./controller.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { uploadStudentLeaveFile } from "../../common/middleware/uploadStudentLeave.js";
import AppError from "../../common/errors/AppError.js";

const router = Router();

router.use(protect, authorize(ROLES.STUDENT));

const studentLeaveUpload = (req, res, next) => {
  uploadStudentLeaveFile.single("attachment")(req, res, (err) => {
    if (err) return next(err instanceof AppError ? err : new AppError(err.message || "File upload failed", 400));
    next();
  });
};

router.get("/dashboard", catchAsync(studentController.getDashboard));
router.get("/profile", catchAsync(studentController.getProfile));
router.put("/profile", catchAsync(studentController.updateProfile));
router.get("/attendance", catchAsync(studentController.getAttendance));
router.get("/result", catchAsync(studentController.getResult));
router.get("/exam-report", catchAsync(studentController.getExamReportCard));
router.get("/fees/details", catchAsync(studentController.getFeesDetails));
router.post(
  "/fees/pay",
  [
    body("studentFeeId").isMongoId(),
    body("amount").isFloat({ min: 0.01 }),
    body("paymentMode").optional().isString(),
    body("transactionId").optional().isString(),
  ],
  validateRequest,
  catchAsync(studentController.payFees)
);
router.get("/fees", catchAsync(studentController.getFees));
router.get(
  "/fees/receipt/:paymentId",
  [param("paymentId").isMongoId()],
  validateRequest,
  catchAsync(studentController.downloadFeeReceipt)
);
router.get("/assignments", catchAsync(studentController.getAssignments));
router.post(
  "/assignments/submit",
  [body("assignmentId").isMongoId(), body("submissionText").optional().isString(), body("attachments").optional().isArray()],
  validateRequest,
  catchAsync(studentController.submitAssignment)
);
router.get("/library", catchAsync(studentController.getLibrary));
router.get("/links-registration", catchAsync(studentController.getLinksRegistration));
router.post(
  "/feedback",
  [body("message").trim().notEmpty(), body("rating").isInt({ min: 1, max: 5 })],
  validateRequest,
  catchAsync(studentController.submitFeedback)
);
router.get("/feedback", catchAsync(studentController.getFeedbackHistory));
router.get("/placement/jobs", catchAsync(studentController.getPlacementJobs));
router.post("/placement/apply", [body("jobId").isMongoId()], validateRequest, catchAsync(studentController.applyPlacement));
router.get("/placement/history", catchAsync(studentController.getPlacementHistory));
router.post(
  "/complaints",
  [body("title").trim().notEmpty(), body("description").trim().notEmpty()],
  validateRequest,
  catchAsync(studentController.createComplaint)
);
router.get("/complaints", catchAsync(studentController.getComplaints));
router.get(
  "/timetable/student",
  [query("day").optional().isString(), query("academicYear").optional().isString()],
  validateRequest,
  catchAsync(studentController.getTimetableStudent)
);
router.get(
  "/timetable",
  [query("day").optional().isString(), query("academicYear").optional().isString()],
  validateRequest,
  catchAsync(studentController.getTimetable)
);
router.get("/alerts", catchAsync(studentController.getAlertsNotifications));
router.put(
  "/alerts/:notificationId/read",
  [param("notificationId").isMongoId()],
  validateRequest,
  catchAsync(studentController.markAlertRead)
);
router.get("/notice-board", catchAsync(studentController.getNoticeBoard));
router.get("/notices/student", catchAsync(studentController.getNoticesStudent));
router.get("/notices", catchAsync(studentController.getNotices));
router.get("/admit-card", catchAsync(studentController.getAdmitCard));

router.post("/leaves", studentLeaveUpload, catchAsync(studentController.applyStudentLeave));
router.get("/leaves", catchAsync(studentController.listStudentLeaves));

router.get(
  "/materials/student",
  [
    query("subjectId").optional().isMongoId(),
    query("materialType").optional().isString(),
    query("search").optional().isString(),
  ],
  validateRequest,
  catchAsync(studentController.getStudyMaterialsStudent)
);
router.post(
  "/materials/:materialId/download",
  [param("materialId").isMongoId()],
  validateRequest,
  catchAsync(studentController.registerStudyMaterialDownload)
);

export default router;
