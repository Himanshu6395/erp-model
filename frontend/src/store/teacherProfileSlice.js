import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { teacherService } from "../services/teacherService";
import { readTeacherProfileCache, writeTeacherProfileCache, clearTeacherProfileCache } from "../utils/teacherProfileCache";
import { applyTeacherPreferences, readTeacherPreferencesCache } from "../utils/applyTeacherPreferences";
import { resolveUploadUrl } from "../utils/apiOrigin";

export const fetchTeacherProfile = createAsyncThunk(
  "teacherProfile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await teacherService.getProfileSettings();
    } catch (e) {
      return rejectWithValue(e.message || "Failed to load profile");
    }
  }
);

function mapDtoToState(dto) {
  if (!dto) return null;
  const designation = dto.department || dto.subject || "Teacher";
  return {
    teacherId: dto.teacherId || "",
    userId: dto.userId || "",
    name: dto.name || "",
    email: dto.email || "",
    phone: dto.phone || "",
    profileImage: dto.profileImage || "",
    coverImage: dto.coverImage || "",
    designation,
    department: dto.department || "",
    subject: dto.subject || "",
    employeeId: dto.employeeId || "",
    role: dto.role || "Teacher",
    completionPercent: dto.completionPercent ?? 0,
    preferences: dto.preferences || {},
    notificationPrefs: dto.notificationPrefs || {},
    bio: dto.bio || "",
    socialLinks: dto.socialLinks || {},
    classAssigned: dto.classAssigned || "",
    sectionAssigned: dto.sectionAssigned || "",
    avatarVersion: dto.avatarVersion ?? (dto.profileImage ? Date.now() : 0),
    full: dto,
  };
}

const cached = readTeacherProfileCache();
const cachedPrefs = readTeacherPreferencesCache();
if (cachedPrefs) applyTeacherPreferences(cachedPrefs);
else if (cached?.preferences) applyTeacherPreferences(cached.preferences);

const mappedCache = mapDtoToState(cached);
const defaultState = {
  loaded: false,
  loading: false,
  error: null,
  name: "",
  email: "",
  profileImage: "",
  coverImage: "",
  designation: "Teacher",
  department: "",
  subject: "",
  employeeId: "",
  role: "Teacher",
  completionPercent: 0,
  preferences: {},
  notificationPrefs: {},
  bio: "",
  socialLinks: {},
  avatarPreview: "",
  full: null,
};

const initialState = mappedCache
  ? { ...defaultState, ...mappedCache, loaded: true, loading: false, error: null, avatarPreview: "" }
  : defaultState;

const teacherProfileSlice = createSlice({
  name: "teacherProfile",
  initialState,
  reducers: {
    setTeacherProfile(state, action) {
      const next = mapDtoToState(action.payload);
      if (!next) return;
      const keepBlobPreview = Boolean(state.avatarPreview?.startsWith("blob:"));
      const blobPreview = keepBlobPreview ? state.avatarPreview : "";
      Object.assign(state, next, {
        loaded: true,
        loading: false,
        error: null,
        avatarPreview: keepBlobPreview ? blobPreview : "",
      });
      writeTeacherProfileCache({ ...next.full, completionPercent: next.completionPercent });
      if (next.preferences) applyTeacherPreferences(next.preferences);
    },
    setTeacherAvatarPreview(state, action) {
      state.avatarPreview = action.payload || "";
    },
    patchTeacherProfile(state, action) {
      Object.assign(state, action.payload);
      writeTeacherProfileCache(state.full || state);
    },
    clearTeacherProfile(state) {
      clearTeacherProfileCache();
      state.loaded = false;
      state.name = "";
      state.email = "";
      state.profileImage = "";
      state.coverImage = "";
      state.avatarPreview = "";
      state.completionPercent = 0;
      state.full = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherProfile.fulfilled, (state, action) => {
        const next = mapDtoToState(action.payload);
        Object.assign(state, next, { loaded: true, loading: false, error: null, avatarPreview: "" });
        writeTeacherProfileCache(action.payload);
        if (next?.preferences) applyTeacherPreferences(next.preferences);
      })
      .addCase(fetchTeacherProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load profile";
      });
  },
});

export const { setTeacherProfile, setTeacherAvatarPreview, patchTeacherProfile, clearTeacherProfile } =
  teacherProfileSlice.actions;

export function selectTeacherDisplayName(state) {
  return state.teacherProfile?.name || "";
}

export function selectTeacherAvatarUrl(state) {
  const p = state.teacherProfile;
  if (!p) return "";
  const src = p.avatarPreview || p.profileImage;
  if (!src) return "";
  if (src.startsWith("blob:")) return src;
  const base = resolveUploadUrl(src);
  const version = p.avatarVersion || 0;
  return version ? `${base}${base.includes("?") ? "&" : "?"}v=${version}` : base;
}

export function selectTeacherCoverUrl(state) {
  const src = state.teacherProfile?.coverImage;
  return resolveUploadUrl(src);
}

export default teacherProfileSlice.reducer;
