import axios from "axios";
import { BASE_URL } from "../config/api";

const publicApi = axios.create({ baseURL: `${BASE_URL}/api` });

export const platformSettingsApi = {
  getSettings: async () => {
    const res = await publicApi.get("/platform/settings");
    return res.data?.data;
  },
};
