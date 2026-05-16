import { createSlice } from "@reduxjs/toolkit";
import { readSchoolAdminProfileCache, writeSchoolAdminProfileCache } from "../utils/schoolAdminProfileCache";
import { fetchSchoolAdminSettings } from "./schoolAdminSettingsSlice";

const cached = readSchoolAdminProfileCache();

const schoolAdminProfileSlice = createSlice({
  name: "schoolAdminProfile",
  initialState: {
    avatarUrl: cached?.avatarUrl || "",
    name: cached?.name || "",
    designation: cached?.designation || "",
    email: cached?.email || "",
  },
  reducers: {
    setSchoolAdminProfile(state, action) {
      Object.assign(state, action.payload);
      writeSchoolAdminProfileCache(state);
    },
    setSchoolAdminAvatar(state, action) {
      state.avatarUrl = action.payload;
      writeSchoolAdminProfileCache(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSchoolAdminSettings.fulfilled, (state, action) => {
      const user = action.payload?.user;
      const profile = action.payload?.profile;
      if (!user) return;
      state.name = user.name || "";
      state.email = user.email || "";
      state.designation = profile?.designation || "";
      state.avatarUrl = profile?.avatarUrl || "";
      writeSchoolAdminProfileCache(state);
    });
  },
});

export const { setSchoolAdminProfile, setSchoolAdminAvatar } = schoolAdminProfileSlice.actions;
export default schoolAdminProfileSlice.reducer;
