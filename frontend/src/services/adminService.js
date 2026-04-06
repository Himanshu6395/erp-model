import api from "./api";

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
  addExamSubject: async (examId, payload) => (await api.post(`/school-admin/exams/${examId}/subjects`, payload)).data.data,
  getExamDashboard: async (examId) => (await api.get(`/school-admin/exams/${examId}/dashboard`)).data.data,
};
