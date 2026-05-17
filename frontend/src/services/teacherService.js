import api from "./api";

export const teacherService = {
  getDashboard: async () => (await api.get("/teacher/dashboard")).data.data,

  getStudents: async (params) => (await api.get("/teacher/students", { params })).data.data,
  getStudentProfile: async (studentId) => (await api.get(`/teacher/students/${studentId}`)).data.data,

  markAttendance: async (payload) => (await api.post("/teacher/attendance/mark", payload)).data.data,
  getDailyAttendanceRoster: async (params) => (await api.get("/teacher/attendance/daily-roster", { params })).data.data,
  saveDailyAttendanceBatch: async (payload) => (await api.post("/teacher/attendance/daily-batch", payload)).data.data,
  bulkMarkAttendance: async (entries) => (await api.post("/teacher/attendance/bulk", { entries })).data.data,
  getAttendanceReports: async (params) => (await api.get("/teacher/attendance/reports", { params })).data.data,
  getMonthlyAttendanceGrid: async (params) => (await api.get("/teacher/attendance/monthly-grid", { params })).data.data,

  getHomeworkScope: async () => (await api.get("/teacher/homework/scope")).data.data,
  createHomework: async (payload) => (await api.post("/teacher/homework", payload)).data.data,
  getHomework: async () => (await api.get("/teacher/homework")).data.data,
  updateHomework: async (assignmentId, payload) => (await api.put(`/teacher/homework/${assignmentId}`, payload)).data.data,
  deleteHomework: async (assignmentId) => (await api.delete(`/teacher/homework/${assignmentId}`)).data.data,

  createExam: async (payload) => (await api.post("/teacher/exams", payload)).data.data,
  getExams: async () => (await api.get("/teacher/exams")).data.data,
  upsertMarks: async (payload) => (await api.post("/teacher/marks", payload)).data.data,
  getExamMarksGrid: async (params) => (await api.get("/teacher/exam-marks/grid", { params })).data.data,
  saveExamMarksBulk: async (payload) => (await api.post("/teacher/exam-marks/bulk", payload)).data.data,
  getStudentResults: async (studentId) => (await api.get(`/teacher/results/students/${studentId}`)).data.data,

  getTimetable: async (params) => (await api.get("/teacher/timetable", { params })).data.data,
  getTeacherTimetable: async (params) => (await api.get("/teacher/timetable/teacher", { params })).data.data,
  getTodayTimetable: async (params) => (await api.get("/teacher/timetable/today", { params })).data.data,

  sendCommunication: async (payload) => (await api.post("/teacher/communications", payload)).data.data,
  getCommunicationHistory: async () => (await api.get("/teacher/communications")).data.data,

  getTeacherNotices: async () => (await api.get("/teacher/notices/teacher")).data.data,
  getAnnouncements: async () => (await api.get("/teacher/announcements")).data.data,

  createStudyMaterial: async (payload) => (await api.post("/teacher/study-material", payload)).data.data,
  getStudyMaterial: async () => (await api.get("/teacher/study-material")).data.data,

  getAssignedClassesWithSubjects: async () => (await api.get("/teacher/assigned-classes")).data.data,
  listMaterialsTeacher: async (params) => (await api.get("/teacher/materials/teacher", { params })).data.data,
  createStudyMaterialMultipart: async (formData) => (await api.post("/teacher/materials", formData)).data.data,
  updateStudyMaterial: async (materialId, formData) => (await api.put(`/teacher/materials/${materialId}`, formData)).data.data,
  deleteStudyMaterial: async (materialId) => (await api.delete(`/teacher/materials/${materialId}`)).data.data,

  getPerformanceInsights: async () => (await api.get("/teacher/performance/insights")).data.data,

  applyLeave: async (formData) => (await api.post("/teacher/leaves", formData)).data.data,
  updateLeave: async (leaveId, formData) => (await api.put(`/teacher/leaves/${leaveId}`, formData)).data.data,
  deleteLeave: async (leaveId) => (await api.delete(`/teacher/leaves/${leaveId}`)).data.data,
  getLeaves: async (params) => (await api.get("/teacher/leaves", { params })).data.data,
  getLeaveStats: async () => (await api.get("/teacher/leaves/stats")).data.data,
  getLeaveById: async (leaveId) => (await api.get(`/teacher/leaves/${leaveId}`)).data.data,
  cancelLeave: async (leaveId) => (await api.put(`/teacher/leaves/${leaveId}/cancel`)).data.data,
  getUnreadNotificationCount: async () => (await api.get("/teacher/notifications/unread-count")).data.data,

  createDiary: async (payload) => (await api.post("/teacher/diary", payload)).data.data,
  getDiary: async () => (await api.get("/teacher/diary")).data.data,

  scheduleOnlineClass: async (payload) => (await api.post("/teacher/online-classes", payload)).data.data,
  getOnlineClasses: async () => (await api.get("/teacher/online-classes")).data.data,

  getDoubts: async () => (await api.get("/teacher/doubts")).data.data,
  answerDoubt: async (doubtId, answer) => (await api.put(`/teacher/doubts/${doubtId}/answer`, { answer })).data.data,

  getOnlineExamContext: async () => (await api.get("/teacher/online-exams/context")).data.data,
  getOnlineExamDashboard: async () => (await api.get("/teacher/online-exams/dashboard")).data.data,
  getOnlineExamAnalytics: async () => (await api.get("/teacher/online-exams/analytics")).data.data,
  getOnlineExamResults: async () => (await api.get("/teacher/online-exams/results")).data.data,
  gradeOnlineExamResult: async (resultId, payload) => (await api.post(`/teacher/online-exams/results/${resultId}/grade`, payload)).data.data,
  getOnlineExams: async (params) => (await api.get("/teacher/online-exams/exams", { params })).data.data,
  createOnlineExam: async (payload) => (await api.post("/teacher/online-exams/exams", payload)).data.data,
  updateOnlineExam: async (examId, payload) => (await api.put(`/teacher/online-exams/exams/${examId}`, payload)).data.data,
  submitOnlineExamForApproval: async (examId) => (await api.post(`/teacher/online-exams/exams/${examId}/submit`)).data.data,
  publishOnlineExam: async (examId) => (await api.post(`/teacher/online-exams/exams/${examId}/publish`)).data.data,
  getOnlineQuestionBank: async (params) => (await api.get("/teacher/online-exams/questions", { params })).data.data,
  createOnlineQuestion: async (payload) => (await api.post("/teacher/online-exams/questions", payload)).data.data,
  deleteOnlineQuestion: async (questionId) => (await api.delete(`/teacher/online-exams/questions/${questionId}`)).data.data,
  importOnlineQuestions: async (payload) => (await api.post("/teacher/online-exams/questions/import", payload)).data.data,
  generateAiOnlineQuestions: async (payload) => (await api.post("/teacher/online-exams/questions/generate-ai", payload)).data.data,

  getNotifications: async () => (await api.get("/teacher/notifications")).data.data,
  markNotificationRead: async (notificationId) => (await api.put(`/teacher/notifications/${notificationId}/read`)).data.data,

  getProfileSettings: async () => (await api.get("/teacher/settings/profile")).data.data,
  updateProfileSettings: async (formData) =>
    (await api.post("/teacher/settings/profile", formData)).data.data,
  uploadProfilePhoto: async (file) => {
    const fd = new FormData();
    fd.append("profileImage", file);
    return (await api.post("/teacher/settings/profile/photo", fd)).data.data;
  },
  getSecurityInfo: async () => (await api.get("/teacher/settings/security")).data.data,
  updatePreferences: async (payload) => (await api.put("/teacher/settings/preferences", payload)).data.data,
  updateNotificationPrefs: async (payload) => (await api.put("/teacher/settings/notifications", payload)).data.data,
  updateProfile: async (payload) => (await api.put("/teacher/profile", payload)).data.data,
  changePassword: async (payload) => (await api.put("/teacher/change-password", payload)).data.data,

  getSalaryPayslip: async () => (await api.get("/teacher/salary-payslip")).data.data,
  getActivities: async () => (await api.get("/teacher/activities")).data.data,

  getStudentLeaveStats: async () => (await api.get("/teacher/student-leaves/stats")).data.data,
  getStudentLeaves: async (params) => (await api.get("/teacher/student-leaves", { params })).data.data,
  decideStudentLeave: async (leaveId, payload) =>
    (await api.put(`/teacher/student-leaves/${leaveId}`, payload)).data.data,
};
