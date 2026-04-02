import { Router } from "express";
import { body, param, query } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { teacherController } from "./controller.js";
import AppError from "../../common/errors/AppError.js";
import { uploadStudyMaterialFiles } from "../../common/middleware/uploadStudyMaterial.js";

const router = Router();
router.use(protect, authorize(ROLES.TEACHER));

const studyMaterialUpload = (req, res, next) => {
  uploadStudyMaterialFiles.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err instanceof AppError ? err : new AppError(err.message || "File upload failed", 400));
    next();
  });
};

router.get("/dashboard", catchAsync(teacherController.getDashboard));

router.get("/assigned-classes", catchAsync(teacherController.listAssignedClassesWithSubjects));

router.get("/student-leaves/stats", catchAsync(teacherController.getStudentLeaveStats));
router.get("/student-leaves", catchAsync(teacherController.listStudentLeavesForClassTeacher));
router.put(
  "/student-leaves/:leaveId",
  [
    param("leaveId").isMongoId(),
    body("decision").isIn(["APPROVE", "REJECT"]),
    body("teacherRemarks").optional().isString(),
  ],
  validateRequest,
  catchAsync(teacherController.decideStudentLeave)
);

router.get("/students", catchAsync(teacherController.listStudents));
router.get("/students/:studentId", [param("studentId").isMongoId()], validateRequest, catchAsync(teacherController.getStudentProfile));

router.post(
  "/attendance/mark",
  [
    body("studentId").isMongoId(),
    body("date").isISO8601(),
    body("status").isIn(["PRESENT", "ABSENT", "LEAVE", "LATE"]),
  ],
  validateRequest,
  catchAsync(teacherController.markAttendance)
);
router.get(
  "/attendance/daily-roster",
  [query("classId").isMongoId(), query("section").trim().notEmpty(), query("date").optional().isISO8601()],
  validateRequest,
  catchAsync(teacherController.getDailyAttendanceRoster)
);
router.post(
  "/attendance/daily-batch",
  [
    body("classId").isMongoId(),
    body("section").trim().notEmpty(),
    body("date").optional().isISO8601(),
    body("entries").isArray({ min: 1 }),
    body("entries.*.studentId").isMongoId(),
    body("entries.*.status").isIn(["PRESENT", "ABSENT", "LEAVE", "LATE"]),
    body("entries.*.remark").optional().isString(),
  ],
  validateRequest,
  catchAsync(teacherController.saveDailyAttendanceBatch)
);
router.post("/attendance/bulk", [body("entries").isArray({ min: 1 })], validateRequest, catchAsync(teacherController.bulkMarkAttendance));
router.get("/attendance/reports", catchAsync(teacherController.attendanceReports));
router.get(
  "/attendance/monthly-grid",
  [
    query("classId").isMongoId(),
    query("section").trim().notEmpty(),
    query("month").matches(/^\d{4}-\d{2}$/),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  catchAsync(teacherController.getMonthlyAttendanceGrid)
);

router.get("/homework/scope", catchAsync(teacherController.getHomeworkScope));
router.post(
  "/homework",
  [
    body("classId").optional().isMongoId(),
    body("title").trim().notEmpty(),
    body("dueDate").isISO8601(),
    body("section").not().exists(),
  ],
  validateRequest,
  catchAsync(teacherController.createHomework)
);
router.get("/homework", catchAsync(teacherController.listHomework));
router.put(
  "/homework/:assignmentId",
  [
    param("assignmentId").isMongoId(),
    body("classId").not().exists(),
    body("section").not().exists(),
  ],
  validateRequest,
  catchAsync(teacherController.updateHomework)
);
router.delete(
  "/homework/:assignmentId",
  [param("assignmentId").isMongoId()],
  validateRequest,
  catchAsync(teacherController.deleteHomework)
);

router.post("/exams", [body("classId").isMongoId(), body("title").trim().notEmpty(), body("examDate").isISO8601()], validateRequest, catchAsync(teacherController.createExam));
router.get("/exams", catchAsync(teacherController.listExams));
router.get(
  "/exam-marks/grid",
  [
    query("examId").isMongoId(),
    query("subjectId").isMongoId(),
    query("classId").isMongoId(),
    query("section").trim().notEmpty(),
  ],
  validateRequest,
  catchAsync(teacherController.getExamMarksGrid)
);
router.post(
  "/exam-marks/bulk",
  [
    body("examId").isMongoId(),
    body("subjectId").isMongoId(),
    body("classId").isMongoId(),
    body("section").trim().notEmpty(),
    body("entries").isArray({ min: 1 }),
    body("entries.*.studentId").isMongoId(),
    body("entries.*.theory").optional(),
    body("entries.*.practical").optional(),
    body("entries.*.internal").optional(),
    body("entries.*.remarks").optional().isString(),
    body("resultStatus").optional().isIn(["DRAFT", "PUBLISHED"]),
  ],
  validateRequest,
  catchAsync(teacherController.saveExamMarksBulk)
);
router.post(
  "/marks",
  [body("studentId").isMongoId(), body("examId").isMongoId(), body("subject").trim().notEmpty()],
  validateRequest,
  catchAsync(teacherController.upsertMarks)
);
router.get(
  "/results/students/:studentId",
  [param("studentId").isMongoId()],
  validateRequest,
  catchAsync(teacherController.getStudentResults)
);

router.get("/timetable/teacher", catchAsync(teacherController.getTimetable));
router.get("/timetable", catchAsync(teacherController.getTimetable));
router.get("/timetable/today", catchAsync(teacherController.getTodayTimetable));

router.post(
  "/communications",
  [body("title").trim().notEmpty(), body("message").trim().notEmpty(), body("receiverType").isIn(["student", "parent", "class"])],
  validateRequest,
  catchAsync(teacherController.sendCommunication)
);
router.get("/communications", catchAsync(teacherController.communicationHistory));

router.get("/notices/teacher", catchAsync(teacherController.listTeacherNotices));
router.get("/announcements", catchAsync(teacherController.listAnnouncements));

router.post(
  "/materials",
  studyMaterialUpload,
  [
    body("title").trim().notEmpty(),
    body("classId").isMongoId(),
    body("subjectId").optional().isMongoId(),
    body("subject").optional().isString(),
    body("section").optional().isString(),
    body("topic").optional().isString(),
    body("description").optional().isString(),
    body("materialType").optional().isString(),
    body("externalLink").optional().isString(),
    body("publishDate").optional().isISO8601(),
    body("expiryDate").optional({ values: "falsy" }).isISO8601(),
    body("visibility").optional().isIn(["PUBLIC", "RESTRICTED"]),
    body("restrictedStudentIds").optional().isString(),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH"]),
    body("status").optional().isIn(["DRAFT", "PUBLISHED"]),
    body("fileUrl").optional().isString(),
    body("thumbnail").optional().isString(),
  ],
  validateRequest,
  catchAsync(teacherController.createStudyMaterialMultipart)
);
router.get(
  "/materials/teacher",
  [
    query("classId").optional().isMongoId(),
    query("subjectId").optional().isMongoId(),
    query("section").optional().isString(),
    query("materialType").optional().isString(),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ],
  validateRequest,
  catchAsync(teacherController.listMaterialsTeacher)
);
router.put(
  "/materials/:materialId",
  studyMaterialUpload,
  [param("materialId").isMongoId()],
  validateRequest,
  catchAsync(teacherController.updateStudyMaterial)
);
router.delete(
  "/materials/:materialId",
  [param("materialId").isMongoId()],
  validateRequest,
  catchAsync(teacherController.deleteStudyMaterial)
);

router.post(
  "/study-material",
  [
    body("title").trim().notEmpty(),
    body("classId").isMongoId(),
    body("subjectId").optional().isMongoId(),
    body("subject").optional().isString(),
    body("fileUrl").optional().isString(),
    body("externalLink").optional().isString(),
    body("description").optional().isString(),
    body("section").optional().isString(),
    body("topic").optional().isString(),
    body("materialType").optional().isString(),
    body("publishDate").optional().isISO8601(),
    body("expiryDate").optional({ values: "falsy" }).isISO8601(),
    body("visibility").optional().isIn(["PUBLIC", "RESTRICTED"]),
    body("status").optional().isIn(["DRAFT", "PUBLISHED"]),
  ],
  validateRequest,
  catchAsync(teacherController.createStudyMaterial)
);
router.get("/study-material", catchAsync(teacherController.listStudyMaterial));

router.get("/performance/insights", catchAsync(teacherController.studentPerformanceInsights));

router.post(
  "/leaves",
  [body("leaveType").trim().notEmpty(), body("startDate").isISO8601(), body("endDate").isISO8601()],
  validateRequest,
  catchAsync(teacherController.applyLeave)
);
router.get("/leaves", catchAsync(teacherController.listLeaves));
router.put("/leaves/:leaveId/cancel", [param("leaveId").isMongoId()], validateRequest, catchAsync(teacherController.cancelLeave));

router.post(
  "/diary",
  [body("classId").isMongoId(), body("subject").trim().notEmpty(), body("date").isISO8601(), body("notes").trim().notEmpty()],
  validateRequest,
  catchAsync(teacherController.createDiary)
);
router.get("/diary", catchAsync(teacherController.listDiary));

router.post(
  "/online-classes",
  [body("classId").isMongoId(), body("subject").trim().notEmpty(), body("date").isISO8601(), body("meetingLink").trim().notEmpty()],
  validateRequest,
  catchAsync(teacherController.scheduleOnlineClass)
);
router.get("/online-classes", catchAsync(teacherController.listOnlineClasses));

router.get("/doubts", catchAsync(teacherController.listDoubts));
router.put("/doubts/:doubtId/answer", [param("doubtId").isMongoId(), body("answer").trim().notEmpty()], validateRequest, catchAsync(teacherController.answerDoubt));

router.get("/notifications", catchAsync(teacherController.listNotifications));
router.put(
  "/notifications/:notificationId/read",
  [param("notificationId").isMongoId()],
  validateRequest,
  catchAsync(teacherController.markNotificationRead)
);

router.put("/profile", catchAsync(teacherController.updateProfile));
router.put(
  "/change-password",
  [body("currentPassword").isLength({ min: 6 }), body("newPassword").isLength({ min: 6 })],
  validateRequest,
  catchAsync(teacherController.changePassword)
);

router.get("/salary-payslip", catchAsync(teacherController.salaryAndPayslip));
router.get("/activities", catchAsync(teacherController.activityLogs));
router.get("/reports/export", [query("format").isIn(["csv", "pdf"])], validateRequest, catchAsync(teacherController.activityLogs));

export default router;
