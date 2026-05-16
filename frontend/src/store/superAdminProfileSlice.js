import { createSlice } from "@reduxjs/toolkit";
import { fetchSuperAdminSettings } from "./superAdminSettingsSlice";
import {
  readSuperAdminAvatar,
  readSuperAdminProfileMeta,
  syncSuperAdminProfileCache,
} from "../utils/superAdminProfileCache";

const cachedMeta = readSuperAdminProfileMeta();

const initialState = {
  avatarUrl: readSuperAdminAvatar(),
  name: cachedMeta?.name || "",
  designation: cachedMeta?.designation || "",
  email: cachedMeta?.email || "",
};

const superAdminProfileSlice = createSlice({
  name: "superAdminProfile",
  initialState,
  reducers: {
    setSuperAdminProfile(state, action) {
      const { avatarUrl, name, designation, email } = action.payload;
      if (avatarUrl !== undefined) state.avatarUrl = avatarUrl;
      if (name !== undefined) state.name = name;
      if (designation !== undefined) state.designation = designation;
      if (email !== undefined) state.email = email;
      syncSuperAdminProfileCache({
        avatarUrl: state.avatarUrl,
        name: state.name,
        designation: state.designation,
        email: state.email,
      });
    },
    setSuperAdminAvatar(state, action) {
      state.avatarUrl = action.payload || "";
      writeSuperAdminAvatarOnly(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSuperAdminSettings.fulfilled, (state, action) => {
      const payload = action.payload;
      if (!payload) return;
      state.avatarUrl = payload.profile?.avatarUrl || "";
      state.name = payload.user?.name || state.name;
      state.email = payload.user?.email || state.email;
      state.designation = payload.profile?.designation || "";
      syncSuperAdminProfileCache({
        avatarUrl: state.avatarUrl,
        name: state.name,
        designation: state.designation,
        email: state.email,
      });
    });
  },
});

function writeSuperAdminAvatarOnly(state) {
  syncSuperAdminProfileCache({
    avatarUrl: state.avatarUrl,
    name: state.name,
    designation: state.designation,
    email: state.email,
  });
}

export const { setSuperAdminProfile, setSuperAdminAvatar } = superAdminProfileSlice.actions;
export default superAdminProfileSlice.reducer;
