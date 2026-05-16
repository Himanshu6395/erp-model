import api from "./api";

const base = "/school-admin/inquiries";

export const inquiryAdminApi = {
  list: async (params) => (await api.get(base, { params })).data.data,
  getOne: async (id) => (await api.get(`${base}/${id}`)).data.data,
  create: async (payload) => (await api.post(base, payload)).data.data,
  update: async (id, payload) => (await api.put(`${base}/${id}`, payload)).data.data,
  remove: async (id) => (await api.delete(`${base}/${id}`)).data,
  patchStatus: async (id, body) => (await api.patch(`${base}/${id}/status`, body)).data.data,
  assignTeacher: async (id, teacherId) =>
    (await api.patch(`${base}/${id}/assign-teacher`, { teacherId })).data.data,
  convert: async (id, body) => (await api.patch(`${base}/${id}/convert`, body)).data.data,
  followUp: async (id, body) => (await api.post(`${base}/${id}/follow-up`, body)).data.data,
  comment: async (id, text) => (await api.post(`${base}/${id}/comments`, { text })).data.data,
  analytics: async () => (await api.get(`${base}/analytics`)).data.data,
  badge: async () => (await api.get(`${base}/badge-count`)).data.data,
  exportCsv: async (params) =>
    (
      await api.get(`${base}/export`, {
        params,
        responseType: "blob",
      })
    ).data,
};

const tBase = "/teacher/inquiries";

export const inquiryTeacherApi = {
  list: async (params) => (await api.get(tBase, { params })).data.data,
  getOne: async (id) => (await api.get(`${tBase}/${id}`)).data.data,
  patchStatus: async (id, body) => (await api.patch(`${tBase}/${id}/status`, body)).data.data,
  followUp: async (id, body) => (await api.post(`${tBase}/${id}/follow-up`, body)).data.data,
  comment: async (id, text) => (await api.post(`${tBase}/${id}/comments`, { text })).data.data,
};
