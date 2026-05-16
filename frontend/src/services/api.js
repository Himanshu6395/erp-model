import axios from "axios";
import { BASE_URL } from "../config/api";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const fieldErrors = Array.isArray(data?.errors)
      ? data.errors.map((e) => e.msg || e.message).filter(Boolean)
      : [];
    const message =
      fieldErrors.length > 0
        ? fieldErrors.join(". ")
        : data?.message || data?.error || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
