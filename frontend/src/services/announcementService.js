import api from "./api";

export const announcementService = {
  getSchoolGlobal: async () => (await api.get("/announcements/global")).data.data,
  getSuperAdminGlobal: async () => (await api.get("/super-admin/global-announcement")).data.data,
  setSuperAdminGlobal: async (payload) =>
    (await api.put("/super-admin/global-announcement", payload)).data.data,
};
