import api from "./api";

export const superAdminSettingsService = {
  getSettings: async () => (await api.get("/super-admin/settings")).data.data,
  updateProfile: async (payload) => (await api.put("/super-admin/settings/profile", payload)).data.data,
  changePassword: async (payload) => (await api.put("/super-admin/settings/security/password", payload)).data.data,
  logoutAllDevices: async () => (await api.post("/super-admin/settings/security/logout-all")).data.data,
  updatePlatform: async (payload) => (await api.put("/super-admin/settings/platform", payload)).data.data,
  updateSmtp: async (payload) => (await api.put("/super-admin/settings/smtp", payload)).data.data,
  sendTestEmail: async () => (await api.post("/super-admin/settings/smtp/test")).data.data,
  updateNotifications: async (payload) => (await api.put("/super-admin/settings/notifications", payload)).data.data,
  updateBilling: async (payload) => (await api.put("/super-admin/settings/billing", payload)).data.data,
  updatePermissions: async (payload) => (await api.put("/super-admin/settings/permissions", payload)).data.data,
  updateTheme: async (payload) => (await api.put("/super-admin/settings/theme", payload)).data.data,
};
