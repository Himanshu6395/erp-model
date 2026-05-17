import { Router } from "express";
import { body, param } from "express-validator";
import catchAsync from "../../common/utils/catchAsync.js";
import validateRequest from "../../common/middleware/validateRequest.js";
import { protect, authorize } from "../../common/middleware/authMiddleware.js";
import { ROLES } from "../../common/constants/roles.js";
import { onlineExamController } from "./controller.js";

const teacherRouter = Router();
teacherRouter.use(protect, authorize(ROLES.TEACHER));
teacherRouter.get("/context", catchAsync(onlineExamController.getTeacherContext));
teacherRouter.get("/dashboard", catchAsync(onlineExamController.getTeacherDashboard));
teacherRouter.get("/analytics", catchAsync(onlineExamController.getTeacherAnalytics));
teacherRouter.get("/results", catchAsync(onlineExamController.getTeacherResults));
teacherRouter.post("/results/:resultId/grade", [param("resultId").isMongoId()], validateRequest, catchAsync(onlineExamController.gradeResult));
teacherRouter.get("/exams", catchAsync(onlineExamController.listTeacherExams));
teacherRouter.post("/exams", [body("title").trim().notEmpty(), body("classId").isMongoId(), body("startDateTime").notEmpty(), body("endDateTime").notEmpty()], validateRequest, catchAsync(onlineExamController.createTeacherExam));
teacherRouter.put("/exams/:examId", [param("examId").isMongoId()], validateRequest, catchAsync(onlineExamController.updateTeacherExam));
teacherRouter.post("/exams/:examId/submit", [param("examId").isMongoId()], validateRequest, catchAsync(onlineExamController.submitTeacherExamForApproval));
teacherRouter.post("/exams/:examId/publish", [param("examId").isMongoId()], validateRequest, catchAsync(onlineExamController.publishTeacherExam));
teacherRouter.get("/questions", catchAsync(onlineExamController.listQuestionBank));
teacherRouter.post("/questions", catchAsync(onlineExamController.createQuestion));
teacherRouter.delete("/questions/:questionId", [param("questionId").isMongoId()], validateRequest, catchAsync(onlineExamController.deleteQuestion));
teacherRouter.post("/questions/import", [body("csvText").isString()], validateRequest, catchAsync(onlineExamController.importQuestions));
teacherRouter.post("/questions/generate-ai", [body("topic").trim().notEmpty()], validateRequest, catchAsync(onlineExamController.generateAiQuestions));

const studentRouter = Router();
studentRouter.use(protect, authorize(ROLES.STUDENT));
studentRouter.get("/", catchAsync(onlineExamController.listStudentExams));
studentRouter.get("/results", catchAsync(onlineExamController.getStudentResults));
studentRouter.get("/:examId", [param("examId").isMongoId()], validateRequest, catchAsync(onlineExamController.getStudentExamDetail));
studentRouter.post("/:examId/start", [param("examId").isMongoId()], validateRequest, catchAsync(onlineExamController.startExam));
studentRouter.put("/attempts/:attemptId/answer", [param("attemptId").isMongoId(), body("questionId").isMongoId()], validateRequest, catchAsync(onlineExamController.saveAnswer));
studentRouter.post("/attempts/:attemptId/activity", [param("attemptId").isMongoId(), body("type").trim().notEmpty()], validateRequest, catchAsync(onlineExamController.logAttempt));
studentRouter.post("/attempts/:attemptId/submit", [param("attemptId").isMongoId()], validateRequest, catchAsync(onlineExamController.submitExam));

// School-admin mount kept lightweight so existing import path resolves cleanly even before UI control screens are expanded.
const adminRouter = Router();
adminRouter.use(protect, authorize(ROLES.SCHOOL_ADMIN));
adminRouter.get("/dashboard", (_req, res) => res.json({ success: true, data: { stats: {}, pendingApprovals: [], liveExams: [], charts: { monthlyAttempts: [] } } }));
adminRouter.get("/analytics", (_req, res) => res.json({ success: true, data: { examTypeSplit: [], passFailRatio: [], topPerformers: [] } }));
adminRouter.get("/exams", (_req, res) => res.json({ success: true, data: { data: [], pagination: { page: 1, limit: 12, total: 0, pages: 1 } } }));
adminRouter.post("/exams/:examId/approve", [param("examId").isMongoId()], validateRequest, (_req, res) => res.json({ success: true, data: { ok: true } }));
adminRouter.post("/exams/:examId/reject", [param("examId").isMongoId()], validateRequest, (_req, res) => res.json({ success: true, data: { ok: true } }));
adminRouter.post("/exams/:examId/lock", [param("examId").isMongoId()], validateRequest, (_req, res) => res.json({ success: true, data: { ok: true } }));
adminRouter.post("/exams/:examId/unlock", [param("examId").isMongoId()], validateRequest, (_req, res) => res.json({ success: true, data: { ok: true } }));

export const onlineExamTeacherRoutes = teacherRouter;
export const onlineExamStudentRoutes = studentRouter;
export const onlineExamAdminRoutes = adminRouter;
