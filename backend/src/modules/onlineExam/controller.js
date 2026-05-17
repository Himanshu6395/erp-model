import { onlineExamService } from "./service.js";

const respond = async (res, promise, status = 200) => res.status(status).json({ success: true, data: await promise });

export const onlineExamController = {
  getTeacherContext: async (req, res) => respond(res, onlineExamService.getTeacherContext(req.user)),
  getTeacherDashboard: async (req, res) => respond(res, onlineExamService.getTeacherDashboard(req.user)),
  listTeacherExams: async (req, res) => respond(res, onlineExamService.listTeacherExams(req.user, req.query)),
  createTeacherExam: async (req, res) => respond(res, onlineExamService.createTeacherExam(req.user, req.body), 201),
  updateTeacherExam: async (req, res) => respond(res, onlineExamService.updateTeacherExam(req.user, req.params.examId, req.body)),
  submitTeacherExamForApproval: async (req, res) => respond(res, onlineExamService.submitExamForApproval(req.user, req.params.examId)),
  publishTeacherExam: async (req, res) => respond(res, onlineExamService.publishTeacherExam(req.user, req.params.examId)),
  listQuestionBank: async (req, res) => respond(res, onlineExamService.listQuestionBank(req.user, req.query)),
  createQuestion: async (req, res) => respond(res, onlineExamService.createQuestion(req.user, req.body), 201),
  deleteQuestion: async (req, res) => respond(res, onlineExamService.deleteQuestion(req.user, req.params.questionId)),
  importQuestions: async (req, res) => respond(res, onlineExamService.importQuestions(req.user, req.body), 201),
  generateAiQuestions: async (req, res) => respond(res, onlineExamService.generateAiQuestions(req.user, req.body), 201),
  getTeacherResults: async (req, res) => respond(res, onlineExamService.teacherResults(req.user)),
  gradeResult: async (req, res) => respond(res, onlineExamService.gradeResult(req.user, req.params.resultId, req.body)),
  getTeacherAnalytics: async (req, res) => respond(res, onlineExamService.teacherAnalytics(req.user)),
  listStudentExams: async (req, res) => respond(res, onlineExamService.listStudentExams(req.user)),
  getStudentExamDetail: async (req, res) => respond(res, onlineExamService.studentExamDetail(req.user, req.params.examId)),
  startExam: async (req, res) => respond(res, onlineExamService.startExam(req.user, req.params.examId), 201),
  saveAnswer: async (req, res) => respond(res, onlineExamService.saveAnswer(req.user, req.params.attemptId, req.body)),
  logAttempt: async (req, res) => respond(res, onlineExamService.logAttempt(req.user, req.params.attemptId, req.body), 201),
  submitExam: async (req, res) => respond(res, onlineExamService.submitExam(req.user, req.params.attemptId, req.body), 201),
  getStudentResults: async (req, res) => respond(res, onlineExamService.studentResults(req.user)),
};
