import api from "./api";

export const studentService = {
  getDashboard: async () => (await api.get("/student/dashboard")).data.data,
  getProfile: async () => (await api.get("/student/profile")).data.data,
  updateProfile: async (payload) => (await api.put("/student/profile", payload)).data.data,
  getAttendance: async () => (await api.get("/student/attendance")).data.data,
  getResult: async () => (await api.get("/student/result")).data.data,
  getExamReportCard: async () => (await api.get("/student/exam-report")).data.data,
  getFeesDetails: async () => (await api.get("/student/fees/details")).data.data,
  payFees: async (payload) => (await api.post("/student/fees/pay", payload)).data.data,
  downloadFeeReceipt: async (paymentId) =>
    (
      await api.get(`/student/fees/receipt/${paymentId}`, {
        responseType: "blob",
      })
    ).data,
  getFees: async () => (await api.get("/student/fees")).data.data,
  getAssignments: async () => (await api.get("/student/assignments")).data.data,
  submitAssignment: async (payload) => (await api.post("/student/assignments/submit", payload)).data.data,
  getLibrary: async () => (await api.get("/student/library")).data.data,
  getLinksRegistration: async () => (await api.get("/student/links-registration")).data.data,
  submitFeedback: async (payload) => (await api.post("/student/feedback", payload)).data.data,
  getFeedbackHistory: async () => (await api.get("/student/feedback")).data.data,
  getPlacementJobs: async () => (await api.get("/student/placement/jobs")).data.data,
  applyPlacement: async (payload) => (await api.post("/student/placement/apply", payload)).data.data,
  getPlacementHistory: async () => (await api.get("/student/placement/history")).data.data,
  createComplaint: async (payload) => (await api.post("/student/complaints", payload)).data.data,
  getComplaints: async () => (await api.get("/student/complaints")).data.data,
  getTimetable: async (params) => (await api.get("/student/timetable", { params })).data.data,
  getTimetableStudent: async (params) => (await api.get("/student/timetable/student", { params })).data.data,
  getAlerts: async () => (await api.get("/student/alerts")).data.data,
  markAlertRead: async (notificationId) => (await api.put(`/student/alerts/${notificationId}/read`)).data.data,
  getNoticeBoard: async () => (await api.get("/student/notice-board")).data.data,
  getNotices: async () => (await api.get("/student/notices")).data.data,
  getNoticesStudent: async () => (await api.get("/student/notices/student")).data.data,
  getAdmitCard: async () =>
    (
      await api.get("/student/admit-card", {
        responseType: "blob",
      })
    ).data,

  /** multipart FormData: leaveType, fromDate, toDate, reason, parentName, contactPhone, attachment (optional File) */
  applyLeave: async (formData) => (await api.post("/student/leaves", formData)).data.data,
  getLeaves: async () => (await api.get("/student/leaves")).data.data,

  getStudyMaterialsStudent: async (params) => (await api.get("/student/materials/student", { params })).data.data,
  registerStudyMaterialDownload: async (materialId) =>
    (await api.post(`/student/materials/${materialId}/download`)).data.data,
};
