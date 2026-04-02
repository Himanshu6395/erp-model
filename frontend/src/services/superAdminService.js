import api from "./api";

export const superAdminService = {
  createSchool: async (payload) => (await api.post("/super-admin/schools", payload)).data.data,
  createSchoolAdmin: async (payload) => (await api.post("/super-admin/school-admins", payload)).data.data,
  getSchools: async (params) => (await api.get("/super-admin/schools", { params })).data.data,
  getSchoolById: async (schoolId) => (await api.get(`/super-admin/schools/${schoolId}`)).data.data,
  updateSchoolById: async (schoolId, payload) => (await api.put(`/super-admin/schools/${schoolId}`, payload)).data.data,
  deleteSchoolById: async (schoolId) => (await api.delete(`/super-admin/schools/${schoolId}`)).data.data,
};
