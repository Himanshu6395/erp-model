import api from "./api";

export const superAdminOpsService = {
  // Subscription module
  getPlans: async () => (await api.get("/super-admin/plans")).data.data,
  createPlan: async (payload) => (await api.post("/super-admin/plans", payload)).data.data,
  updatePlan: async (planId, payload) => (await api.put(`/super-admin/plans/${planId}`, payload)).data.data,
  deletePlan: async (planId) => (await api.delete(`/super-admin/plans/${planId}`)).data.data,

  getSubscriptions: async () => (await api.get("/super-admin/subscriptions")).data.data,
  changeSubscriptionPlan: async (subscriptionId, planId) =>
    (await api.put(`/super-admin/subscriptions/${subscriptionId}/change-plan`, { planId })).data.data,
  extendSubscription: async (subscriptionId, days) =>
    (await api.put(`/super-admin/subscriptions/${subscriptionId}/extend`, { days })).data.data,

  getPayments: async () => (await api.get("/super-admin/payments")).data.data,
  createPayment: async (payload) => (await api.post("/super-admin/payments", payload)).data.data,

  // Security module
  getSecurityDashboard: async () => (await api.get("/super-admin/security/dashboard")).data.data,
  getLoginActivity: async (params) => (await api.get("/super-admin/security/login-activity", { params })).data.data,
  getBlockedSchools: async () => (await api.get("/super-admin/security/blocked-schools")).data.data,
  blockSchool: async (schoolId, reason) =>
    (await api.put(`/super-admin/security/schools/${schoolId}/block`, { reason })).data.data,
  unblockSchool: async (schoolId) => (await api.put(`/super-admin/security/schools/${schoolId}/unblock`)).data.data,
  setSchoolLoginAccess: async (schoolId, loginAccess) =>
    (await api.put(`/super-admin/security/schools/${schoolId}/login-access`, { loginAccess })).data.data,
  forceLogoutSchoolUsers: async (schoolId) =>
    (await api.post(`/super-admin/security/schools/${schoolId}/force-logout`)).data.data,
};
