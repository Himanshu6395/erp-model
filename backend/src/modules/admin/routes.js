import { Router } from "express";
import { body, param, query } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { adminController } from "./controller.js";
import { uploadNoticeFile } from "../../common/middleware/uploadNotice.js";
import { uploadTeacherFiles } from "../../common/middleware/uploadTeacherFiles.js";
import AppError from "../../common/errors/AppError.js";

const router = Router();

const uploadNoticeMw = (req, res, next) => {
  uploadNoticeFile.single("attachment")(req, res, (err) => {
    if (err) return next(err instanceof AppError ? err : new AppError(err.message || "Upload failed", 400));
    next();
  });
};

const uploadTeacherMw = (req, res, next) => {
  uploadTeacherFiles.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
    { name: "idProof", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err instanceof AppError ? err : new AppError(err.message || "Teacher upload failed", 400));
    next();
  });
};

router.use(protect, authorize(ROLES.SCHOOL_ADMIN));

router.get("/dashboard", catchAsync(adminController.getDashboard));
router.get("/reports/analytics", catchAsync(adminController.getAnalyticsReport));

router.post(
  "/students",
  [
    body("name").optional().trim().notEmpty(),
    body("fullName").optional().trim().notEmpty(),
    body().custom((_, { req }) => {
      const n = String(req.body.name || req.body.fullName || "").trim();
      if (!n) throw new Error("name or fullName is required");
      return true;
    }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("classId").notEmpty().withMessage("classId is required").bail().isMongoId(),
    body("section").trim().notEmpty(),
    body("rollNumber").trim().notEmpty(),
    body("feeStructureId").optional().isMongoId(),
    body("feeAssignManualDiscount").optional().isFloat({ min: 0 }),
    body("feeAssignDueDate").optional().isISO8601(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE", "PASSED", "TRANSFERRED"]),
    body("gender").optional().isIn(["MALE", "FEMALE", "OTHER"]),
    body("category").optional().isString(),
  ],
  validateRequest,
  catchAsync(adminController.createStudent)
);
router.post("/students/bulk-import", [body("csvText").isString()], validateRequest, catchAsync(adminController.bulkImportStudents));
router.get("/students", catchAsync(adminController.listStudents));
router.get(
  "/students/:studentId",
  [param("studentId").isMongoId()],
  validateRequest,
  catchAsync(adminController.getStudentById)
);
router.put(
  "/students/:studentId",
  [param("studentId").isMongoId()],
  validateRequest,
  catchAsync(adminController.updateStudent)
);
router.delete(
  "/students/:studentId",
  [param("studentId").isMongoId()],
  validateRequest,
  catchAsync(adminController.deleteStudent)
);
router.get(
  "/students/:studentId/id-card",
  [param("studentId").isMongoId()],
  validateRequest,
  catchAsync(adminController.generateStudentIdCard)
);

router.post(
  "/teachers",
  uploadTeacherMw,
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim(),
    body("status").optional().isIn(["ACTIVE", "INACTIVE"]),
    body("isVerified").optional().isIn(["true", "false", true, false]),
  ],
  validateRequest,
  catchAsync(adminController.createTeacher)
);
router.get("/teachers", catchAsync(adminController.listTeachers));
router.get(
  "/teachers/:teacherId",
  [param("teacherId").isMongoId()],
  validateRequest,
  catchAsync(adminController.getTeacherById)
);
router.put(
  "/teachers/:teacherId",
  uploadTeacherMw,
  [param("teacherId").isMongoId(), body("email").optional().isEmail(), body("status").optional().isIn(["ACTIVE", "INACTIVE"])],
  validateRequest,
  catchAsync(adminController.updateTeacher)
);
router.delete(
  "/teachers/:teacherId",
  [param("teacherId").isMongoId()],
  validateRequest,
  catchAsync(adminController.deleteTeacher)
);

router.post(
  "/classes",
  [body("name").trim().notEmpty(), body("section").trim().notEmpty(), body("classTeacherId").optional().isMongoId()],
  validateRequest,
  catchAsync(adminController.createClass)
);
router.get("/classes", catchAsync(adminController.listClasses));
router.put(
  "/classes/:classId",
  [param("classId").isMongoId(), body("classTeacherId").optional().isMongoId()],
  validateRequest,
  catchAsync(adminController.updateClass)
);
router.delete(
  "/classes/:classId",
  [param("classId").isMongoId()],
  validateRequest,
  catchAsync(adminController.deleteClass)
);

router.post(
  "/subjects",
  [
    body("classId").notEmpty().withMessage("classId is required").bail().isMongoId(),
    body("name").trim().notEmpty(),
    body("teacherId").optional().isMongoId(),
  ],
  validateRequest,
  catchAsync(adminController.createSubject)
);
router.get("/subjects", catchAsync(adminController.listSubjects));
router.put(
  "/subjects/:subjectId",
  [param("subjectId").isMongoId(), body("classId").optional().isMongoId(), body("teacherId").optional().isMongoId()],
  validateRequest,
  catchAsync(adminController.updateSubject)
);
router.delete(
  "/subjects/:subjectId",
  [param("subjectId").isMongoId()],
  validateRequest,
  catchAsync(adminController.deleteSubject)
);

router.post(
  "/attendance/students/mark",
  [body("studentId").isMongoId(), body("date").isISO8601(), body("status").isIn(["PRESENT", "ABSENT"])],
  validateRequest,
  catchAsync(adminController.markStudentAttendance)
);
router.get(
  "/attendance/students/report",
  [query("studentId").isMongoId(), query("from").optional().isISO8601(), query("to").optional().isISO8601()],
  validateRequest,
  catchAsync(adminController.studentAttendanceReport)
);
router.post(
  "/attendance/teachers/mark",
  [body("teacherId").isMongoId(), body("date").isISO8601(), body("status").isIn(["PRESENT", "ABSENT"])],
  validateRequest,
  catchAsync(adminController.markTeacherAttendance)
);
router.get(
  "/attendance/teachers/report",
  [query("teacherId").isMongoId(), query("from").optional().isISO8601(), query("to").optional().isISO8601()],
  validateRequest,
  catchAsync(adminController.teacherAttendanceReport)
);
router.get(
  "/attendance/monthly-summary",
  [query("month").isInt({ min: 1, max: 12 }), query("year").isInt({ min: 2000 })],
  validateRequest,
  catchAsync(adminController.monthlyAttendanceSummary)
);

router.post(
  "/fees/structures",
  [
    body("title").trim().notEmpty(),
    body("academicYear").trim().notEmpty(),
    body("classId").notEmpty().withMessage("classId is required").bail().isMongoId(),
  ],
  validateRequest,
  catchAsync(adminController.createFeeStructure)
);
router.get("/fees/structures", catchAsync(adminController.getFeeStructures));
router.get("/fees/student-fees/export", catchAsync(adminController.exportStudentFeesCsv));
router.get("/fees/student-fees", catchAsync(adminController.listStudentFeesAdmin));
router.get(
  "/fees/student-fees/:assignmentId",
  [param("assignmentId").isMongoId()],
  validateRequest,
  catchAsync(adminController.getStudentFeeOne)
);
router.patch(
  "/fees/student-fees/:assignmentId",
  [param("assignmentId").isMongoId()],
  validateRequest,
  catchAsync(adminController.patchStudentFee)
);
router.post(
  "/fees/student-fees/:assignmentId/remind",
  [param("assignmentId").isMongoId()],
  validateRequest,
  catchAsync(adminController.sendFeeReminder)
);
router.post(
  "/fees/assign",
  [body("studentId").isMongoId(), body("feeStructureId").isMongoId()],
  validateRequest,
  catchAsync(adminController.assignFees)
);
router.post(
  "/fees/assign-bulk",
  [body("feeStructureId").isMongoId(), body("mode").optional().isIn(["class", "section", "students"])],
  validateRequest,
  catchAsync(adminController.assignFeesBulk)
);
router.post(
  "/fees/collect",
  [body("studentFeeId").isMongoId(), body("amount").isFloat({ gt: 0 })],
  validateRequest,
  catchAsync(adminController.collectFeePayment)
);
router.get(
  "/fees/receipt/:paymentId",
  [param("paymentId").isMongoId()],
  validateRequest,
  catchAsync(adminController.generateFeeReceipt)
);
router.get("/fees/pending-dues", catchAsync(adminController.getPendingDues));

router.post(
  "/notices",
  uploadNoticeMw,
  [
    body("title").trim().notEmpty(),
    body("description").optional().trim().isString(),
    body("message").optional().trim().isString(),
    body("noticeType").optional().isIn(["GENERAL", "URGENT", "EVENT", "HOLIDAY"]),
    body("targetAudience").optional().isIn(["STUDENTS", "TEACHERS", "BOTH"]),
    body("classId").optional({ values: "falsy" }).isMongoId(),
    body("section").optional().isString(),
    body("publishDate").optional().isISO8601(),
    body("expiryDate").optional().isISO8601(),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH"]),
    body("status").optional().isIn(["DRAFT", "PUBLISHED"]),
  ],
  validateRequest,
  catchAsync(adminController.createNotice)
);
router.get(
  "/notices",
  [
    query("targetAudience").optional().isIn(["STUDENTS", "TEACHERS", "BOTH", ""]),
    query("status").optional().isIn(["DRAFT", "PUBLISHED", ""]),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ],
  validateRequest,
  catchAsync(adminController.listNotices)
);
router.put(
  "/notices/:noticeId",
  uploadNoticeMw,
  [
    param("noticeId").isMongoId(),
    body("title").optional().trim().notEmpty(),
    body("description").optional().trim(),
    body("message").optional().trim(),
    body("noticeType").optional().isIn(["GENERAL", "URGENT", "EVENT", "HOLIDAY"]),
    body("targetAudience").optional().isIn(["STUDENTS", "TEACHERS", "BOTH"]),
    body("classId").optional().isString(),
    body("section").optional().isString(),
    body("publishDate").optional().isISO8601(),
    body("expiryDate").optional().isISO8601(),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH"]),
    body("status").optional().isIn(["DRAFT", "PUBLISHED"]),
  ],
  validateRequest,
  catchAsync(adminController.updateNotice)
);
router.delete(
  "/notices/:noticeId",
  [param("noticeId").isMongoId()],
  validateRequest,
  catchAsync(adminController.deleteNotice)
);

router.post(
  "/timetable",
  [
    body("classId").isMongoId(),
    body("section").optional().isString(),
    body("academicYear").optional().trim().isString(),
    body("day").trim().notEmpty(),
    body("periodNumber").optional().isInt({ min: 1 }),
    body("period").optional().isInt({ min: 1 }),
    body("startTime").trim().notEmpty(),
    body("endTime").trim().notEmpty(),
    body("subjectId").optional().isMongoId(),
    body("teacherId").optional().isMongoId(),
    body("isBreak").optional().isBoolean(),
    body("subjectLabel").optional().isString(),
    body("roomNumber").optional().isString(),
    body("notes").optional().isString(),
  ],
  validateRequest,
  catchAsync(adminController.createTimetableEntry)
);
router.post(
  "/timetable/bulk",
  [
    body("classId").isMongoId(),
    body("section").optional().isString(),
    body("academicYear").optional().trim().isString(),
    body("entries").optional().isArray(),
  ],
  validateRequest,
  catchAsync(adminController.bulkTimetable)
);
router.get(
  "/timetable",
  [
    query("academicYear").optional().isString(),
    query("classId").optional().isMongoId(),
    query("section").optional().isString(),
    query("teacherId").optional().isMongoId(),
    query("day").optional().isString(),
  ],
  validateRequest,
  catchAsync(adminController.listTimetableAdmin)
);
router.get("/timetable/dashboard", [query("academicYear").optional().isString()], validateRequest, catchAsync(adminController.timetableDashboard));
router.put(
  "/timetable/:timetableId",
  [
    param("timetableId").isMongoId(),
    body("section").optional().isString(),
    body("academicYear").optional().trim().isString(),
    body("day").optional().trim().notEmpty(),
    body("periodNumber").optional().isInt({ min: 1 }),
    body("startTime").optional().trim().notEmpty(),
    body("endTime").optional().trim().notEmpty(),
    body("subjectId").optional().isMongoId(),
    body("teacherId").optional().isMongoId(),
    body("isBreak").optional().isBoolean(),
    body("subjectLabel").optional().isString(),
    body("classId").optional().isMongoId(),
    body("roomNumber").optional().isString(),
    body("notes").optional().isString(),
  ],
  validateRequest,
  catchAsync(adminController.updateTimetableEntry)
);
router.delete(
  "/timetable/:timetableId",
  [param("timetableId").isMongoId()],
  validateRequest,
  catchAsync(adminController.deleteTimetableEntry)
);

router.post(
  "/exams",
  [
    body("name").trim().notEmpty(),
    body("academicYear").optional().trim().isString(),
    body("term").optional().trim().isString(),
    body("classId").notEmpty().withMessage("classId is required").bail().isMongoId(),
    body("section").optional().isString(),
    body("examType").optional().isIn(["THEORY", "PRACTICAL", "COMBINED"]),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    body("resultPublishDate").optional({ values: "falsy" }).isISO8601(),
    body("status").optional().isIn(["DRAFT", "ONGOING", "COMPLETED", "PUBLISHED"]),
  ],
  validateRequest,
  catchAsync(adminController.createExamSession)
);
router.get(
  "/exams",
  [query("classId").optional().isMongoId(), query("status").optional().isIn(["DRAFT", "ONGOING", "COMPLETED", "PUBLISHED", ""])],
  validateRequest,
  catchAsync(adminController.listExamSessions)
);
router.get("/exams/:examId", [param("examId").isMongoId()], validateRequest, catchAsync(adminController.getExamSession));
router.patch(
  "/exams/:examId",
  [
    param("examId").isMongoId(),
    body("status").optional().isIn(["DRAFT", "ONGOING", "COMPLETED", "PUBLISHED"]),
    body("name").optional().trim().notEmpty(),
    body("academicYear").optional().trim().isString(),
    body("term").optional().trim().isString(),
    body("examType").optional().isIn(["THEORY", "PRACTICAL", "COMBINED"]),
    body("startDate").optional().isISO8601(),
    body("endDate").optional().isISO8601(),
    body("resultPublishDate").optional().isISO8601(),
    body("gradingScale").optional().isArray(),
  ],
  validateRequest,
  catchAsync(adminController.updateExamSession)
);
router.post(
  "/exams/:examId/subjects",
  [
    param("examId").isMongoId(),
    body("subjectId").notEmpty().withMessage("subjectId is required").bail().isMongoId(),
    body("maxMarks").optional().isFloat({ gt: 0 }),
    body("passingMarks").optional().isFloat({ min: 0 }),
    body("subjectCode").optional().isString(),
    body("components").optional().isObject(),
    body("weightage").optional().isObject(),
  ],
  validateRequest,
  catchAsync(adminController.addExamSubject)
);
router.get("/exams/:examId/dashboard", [param("examId").isMongoId()], validateRequest, catchAsync(adminController.getExamDashboard));

router.put("/settings/profile", catchAsync(adminController.updateSchoolProfile));
router.put(
  "/settings/change-password",
  [body("currentPassword").isLength({ min: 6 }), body("newPassword").isLength({ min: 6 })],
  validateRequest,
  catchAsync(adminController.changePassword)
);

export default router;
