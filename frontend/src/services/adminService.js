import api from "./api";

const transportEndpointMap = {
  vehicles: "vehicles",
  drivers: "drivers",
  conductors: "conductors",
  routes: "routes",
  stops: "stops",
  assignments: "assignments",
  studentAssignments: "student-assignments",
  fees: "fees",
  attendance: "attendance",
  maintenance: "maintenance",
  tracking: "tracking",
  notifications: "notifications",
};

const getTransportEndpoint = (moduleKey) => transportEndpointMap[moduleKey] || moduleKey;

export const adminService = {
  getDashboard: async () => (await api.get("/school-admin/dashboard")).data.data,

  createStudent: async (payload) => (await api.post("/school-admin/students", payload)).data.data,
  getStudents: async (params) => (await api.get("/school-admin/students", { params })).data.data,
  getStudentById: async (studentId) => (await api.get(`/school-admin/students/${studentId}`)).data.data,
  updateStudent: async (studentId, payload) => (await api.put(`/school-admin/students/${studentId}`, payload)).data.data,
  deleteStudent: async (studentId) => (await api.delete(`/school-admin/students/${studentId}`)).data.data,
  bulkImportStudents: async (csvText) => (await api.post("/school-admin/students/bulk-import", { csvText })).data.data,
  downloadStudentIdCard: async (studentId) =>
    (
      await api.get(`/school-admin/students/${studentId}/id-card`, {
        responseType: "blob",
      })
    ).data,

  createTeacher: async (payload) => (await api.post("/school-admin/teachers", payload)).data.data,
  getTeachers: async (params) => (await api.get("/school-admin/teachers", { params })).data.data,
  getTeacherById: async (teacherId) => (await api.get(`/school-admin/teachers/${teacherId}`)).data.data,
  updateTeacher: async (teacherId, payload) => (await api.put(`/school-admin/teachers/${teacherId}`, payload)).data.data,
  deleteTeacher: async (teacherId) => (await api.delete(`/school-admin/teachers/${teacherId}`)).data.data,

  createClass: async (payload) => (await api.post("/school-admin/classes", payload)).data.data,
  getClasses: async () => (await api.get("/school-admin/classes")).data.data,
  updateClass: async (classId, payload) => (await api.put(`/school-admin/classes/${classId}`, payload)).data.data,
  deleteClass: async (classId) => (await api.delete(`/school-admin/classes/${classId}`)).data.data,

  createSubject: async (payload) => (await api.post("/school-admin/subjects", payload)).data.data,
  getSubjects: async () => (await api.get("/school-admin/subjects")).data.data,
  updateSubject: async (subjectId, payload) => (await api.put(`/school-admin/subjects/${subjectId}`, payload)).data.data,
  deleteSubject: async (subjectId) => (await api.delete(`/school-admin/subjects/${subjectId}`)).data.data,

  markStudentAttendance: async (payload) => (await api.post("/school-admin/attendance/students/mark", payload)).data.data,
  getStudentAttendanceReport: async (params) => (await api.get("/school-admin/attendance/students/report", { params })).data.data,
  markTeacherAttendance: async (payload) => (await api.post("/school-admin/attendance/teachers/mark", payload)).data.data,
  getTeacherAttendanceReport: async (params) => (await api.get("/school-admin/attendance/teachers/report", { params })).data.data,
  getMonthlyAttendanceSummary: async (params) => (await api.get("/school-admin/attendance/monthly-summary", { params })).data.data,

  listTeacherLeaves: async (params) => (await api.get("/school-admin/teacher-leaves", { params })).data.data,
  getTeacherLeaveStats: async () => (await api.get("/school-admin/teacher-leaves/stats")).data.data,
  getTeacherLeaveCharts: async () => (await api.get("/school-admin/teacher-leaves/charts")).data.data,
  getTeacherLeaveById: async (leaveId) => (await api.get(`/school-admin/teacher-leaves/${leaveId}`)).data.data,
  decideTeacherLeave: async (leaveId, payload) =>
    (await api.put(`/school-admin/teacher-leaves/${leaveId}/decide`, payload)).data.data,
  deleteTeacherLeave: async (leaveId) => (await api.delete(`/school-admin/teacher-leaves/${leaveId}`)).data.data,
  getTeacherLeaveBadgeCount: async () => (await api.get("/school-admin/teacher-leaves/badge-count")).data.data,

  createFeeStructure: async (payload) => (await api.post("/school-admin/fees/structures", payload)).data.data,
  getFeeStructures: async () => (await api.get("/school-admin/fees/structures")).data.data,
  assignFees: async (payload) => (await api.post("/school-admin/fees/assign", payload)).data.data,
  assignFeesBulk: async (payload) => (await api.post("/school-admin/fees/assign-bulk", payload)).data.data,
  getStudentFeesList: async (params) => (await api.get("/school-admin/fees/student-fees", { params })).data.data,
  exportStudentFeesCsv: async (params) =>
    (
      await api.get("/school-admin/fees/student-fees/export", {
        params,
        responseType: "blob",
      })
    ).data,
  getStudentFee: async (assignmentId) => (await api.get(`/school-admin/fees/student-fees/${assignmentId}`)).data.data,
  patchStudentFee: async (assignmentId, payload) =>
    (await api.patch(`/school-admin/fees/student-fees/${assignmentId}`, payload)).data.data,
  sendFeeReminder: async (assignmentId) =>
    (await api.post(`/school-admin/fees/student-fees/${assignmentId}/remind`)).data.data,
  collectFee: async (payload) => (await api.post("/school-admin/fees/collect", payload)).data.data,
  downloadFeeReceipt: async (paymentId) =>
    (
      await api.get(`/school-admin/fees/receipt/${paymentId}`, {
        responseType: "blob",
      })
    ).data,
  getPendingDues: async () => (await api.get("/school-admin/fees/pending-dues")).data.data,

  getLibraryDashboard: async () => (await api.get("/school-admin/library/dashboard")).data.data,
  getLibraryReports: async () => (await api.get("/school-admin/library/reports")).data.data,
  getLibrarySettings: async () => (await api.get("/school-admin/library/settings")).data.data,
  updateLibrarySettings: async (payload) => (await api.put("/school-admin/library/settings", payload)).data.data,
  getLibraryStudents: async (params) => (await api.get("/school-admin/library/students", { params })).data.data,
  getLibraryCategories: async () => (await api.get("/school-admin/library/categories")).data.data,
  createLibraryCategory: async (payload) => (await api.post("/school-admin/library/categories", payload)).data.data,
  updateLibraryCategory: async (categoryId, payload) => (await api.put(`/school-admin/library/categories/${categoryId}`, payload)).data.data,
  deleteLibraryCategory: async (categoryId) => (await api.delete(`/school-admin/library/categories/${categoryId}`)).data.data,
  getLibraryBooks: async (params) => (await api.get("/school-admin/library/books", { params })).data.data,
  createLibraryBook: async (payload) => (await api.post("/school-admin/library/books", payload)).data.data,
  updateLibraryBook: async (bookId, payload) => (await api.put(`/school-admin/library/books/${bookId}`, payload)).data.data,
  deleteLibraryBook: async (bookId) => (await api.delete(`/school-admin/library/books/${bookId}`)).data.data,
  getLibraryIssues: async (params) => (await api.get("/school-admin/library/issues", { params })).data.data,
  issueLibraryBook: async (payload) => (await api.post("/school-admin/library/issues", payload)).data.data,
  approveLibraryRequest: async (issueId, payload) => (await api.post(`/school-admin/library/issues/${issueId}/approve`, payload || {})).data.data,
  rejectLibraryRequest: async (issueId, payload) => (await api.post(`/school-admin/library/issues/${issueId}/reject`, payload || {})).data.data,
  returnLibraryBook: async (issueId, payload) => (await api.post(`/school-admin/library/issues/${issueId}/return`, payload || {})).data.data,
  getLibraryFines: async (params) => (await api.get("/school-admin/library/fines", { params })).data.data,
  payLibraryFine: async (fineId, payload) => (await api.post(`/school-admin/library/fines/${fineId}/pay`, payload || {})).data.data,
  waiveLibraryFine: async (fineId, payload) => (await api.post(`/school-admin/library/fines/${fineId}/waive`, payload || {})).data.data,

  getAnalyticsReport: async () => (await api.get("/school-admin/reports/analytics")).data.data,

  createTimetableEntry: async (payload) => (await api.post("/school-admin/timetable", payload)).data.data,
  bulkTimetable: async (payload) => (await api.post("/school-admin/timetable/bulk", payload)).data.data,
  listTimetable: async (params) => (await api.get("/school-admin/timetable", { params })).data.data,
  timetableDashboard: async (params) => (await api.get("/school-admin/timetable/dashboard", { params })).data.data,
  updateTimetableEntry: async (timetableId, payload) => (await api.put(`/school-admin/timetable/${timetableId}`, payload)).data.data,
  deleteTimetableEntry: async (timetableId) => (await api.delete(`/school-admin/timetable/${timetableId}`)).data.data,

  listNotices: async (params) => (await api.get("/school-admin/notices", { params })).data.data,
  createNotice: async (formData) => (await api.post("/school-admin/notices", formData)).data.data,
  updateNotice: async (noticeId, formData) => (await api.put(`/school-admin/notices/${noticeId}`, formData)).data.data,
  deleteNotice: async (noticeId) => (await api.delete(`/school-admin/notices/${noticeId}`)).data.data,

  createExamSession: async (payload) => (await api.post("/school-admin/exams", payload)).data.data,
  listExamSessions: async (params) => (await api.get("/school-admin/exams", { params })).data.data,
  getExamSession: async (examId) => (await api.get(`/school-admin/exams/${examId}`)).data.data,
  updateExamSession: async (examId, payload) => (await api.patch(`/school-admin/exams/${examId}`, payload)).data.data,
  deleteExamSession: async (examId) => (await api.delete(`/school-admin/exams/${examId}`)).data.data,
  addExamSubject: async (examId, payload) => (await api.post(`/school-admin/exams/${examId}/subjects`, payload)).data.data,
  updateExamSubject: async (examSubjectId, payload) => (await api.put(`/school-admin/exam-subjects/${examSubjectId}`, payload)).data.data,
  deleteExamSubject: async (examSubjectId) => (await api.delete(`/school-admin/exam-subjects/${examSubjectId}`)).data.data,
  createExamSchedule: async (examId, payload) => (await api.post(`/school-admin/exams/${examId}/schedules`, payload)).data.data,
  updateExamSchedule: async (scheduleId, payload) => (await api.put(`/school-admin/exam-schedules/${scheduleId}`, payload)).data.data,
  deleteExamSchedule: async (scheduleId) => (await api.delete(`/school-admin/exam-schedules/${scheduleId}`)).data.data,
  listExamResults: async (examId) => (await api.get(`/school-admin/exams/${examId}/results`)).data.data,
  saveExamResults: async (examId, payload) => (await api.post(`/school-admin/exams/${examId}/results`, payload)).data.data,
  deleteExamResult: async (resultId) => (await api.delete(`/school-admin/exam-results/${resultId}`)).data.data,
  publishExamResults: async (examId, payload) => (await api.patch(`/school-admin/exams/${examId}/publish`, payload)).data.data,
  generateReportCards: async (examId, payload) => (await api.post(`/school-admin/exams/${examId}/report-cards`, payload || {})).data.data,
  listReportCards: async (examId) => (await api.get(`/school-admin/exams/${examId}/report-cards`)).data.data,
  deleteReportCard: async (reportCardId) => (await api.delete(`/school-admin/report-cards/${reportCardId}`)).data.data,
  getExamMeritList: async (examId) => (await api.get(`/school-admin/exams/${examId}/merit-list`)).data.data,
  getExamDashboard: async (examId) => (await api.get(`/school-admin/exams/${examId}/dashboard`)).data.data,

  listTransportModule: async (moduleKey, params) => (await api.get(`/school-admin/transport/${getTransportEndpoint(moduleKey)}`, { params })).data.data,
  getTransportModule: async (moduleKey, id) => (await api.get(`/school-admin/transport/${getTransportEndpoint(moduleKey)}/${id}`)).data.data,
  createTransportModule: async (moduleKey, payload) => (await api.post(`/school-admin/transport/${getTransportEndpoint(moduleKey)}`, payload)).data.data,
  updateTransportModule: async (moduleKey, id, payload) => (await api.put(`/school-admin/transport/${getTransportEndpoint(moduleKey)}/${id}`, payload)).data.data,
  deleteTransportModule: async (moduleKey, id) => (await api.delete(`/school-admin/transport/${getTransportEndpoint(moduleKey)}/${id}`)).data.data,
};
