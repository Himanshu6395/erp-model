import axios from "axios";
import { BASE_URL } from "../config/api";

const publicApi = axios.create({ baseURL: `${BASE_URL}/api` });

export const platformThemeService = {
  getTheme: async () => {
    const res = await publicApi.get("/platform/theme");
    return res.data?.data;
  },
};
