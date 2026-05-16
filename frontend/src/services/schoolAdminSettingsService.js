import api from "./api";

export const schoolAdminSettingsService = {
  getSettings: async () => (await api.get("/school-admin/settings")).data.data,
  updateProfile: async (payload) => (await api.put("/school-admin/settings/profile", payload)).data.data,
  changePassword: async (payload) => (await api.put("/school-admin/settings/security", payload)).data,
  logoutAllDevices: async () => (await api.post("/school-admin/settings/security/logout-all")).data,
  updateSchoolSettings: async (payload) => (await api.put("/school-admin/settings/school-settings", payload)).data.data,
  updateSmtp: async (payload) => (await api.put("/school-admin/settings/smtp", payload)).data.data,
  sendTestEmail: async () => (await api.post("/school-admin/settings/smtp/test")).data,
  updateNotifications: async (payload) => (await api.put("/school-admin/settings/notifications", payload)).data.data,
  updateTheme: async (payload) => (await api.put("/school-admin/settings/theme", payload)).data.data,
};
