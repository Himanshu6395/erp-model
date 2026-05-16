import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { applyPlatformSettings } from "../theme/applyPlatformSettings";
import {
  DEFAULT_PLATFORM_SETTINGS,
  normalizePlatformSettings,
} from "../theme/platformSettingsConstants";
import { readPlatformSettingsCache } from "../utils/platformSettingsCache";
import { platformSettingsApi } from "../services/platformSettingsService";
import { superAdminSettingsService } from "../services/superAdminSettingsService";
import { fetchSuperAdminSettings } from "./superAdminSettingsSlice";
import { patchLocalSettings } from "./superAdminSettingsSlice";

export const loadPlatformSettings = createAsyncThunk("platformSettings/load", async () => {
  const cached = readPlatformSettingsCache();
  if (cached) applyPlatformSettings(cached);
  try {
    const remote = await platformSettingsApi.getSettings();
    if (remote) {
      const merged = normalizePlatformSettings(remote);
      applyPlatformSettings(merged);
      return merged;
    }
  } catch {
    /* use cache */
  }
  const fallback = normalizePlatformSettings(cached || DEFAULT_PLATFORM_SETTINGS);
  applyPlatformSettings(fallback);
  return fallback;
});

export const savePlatformSettings = createAsyncThunk(
  "platformSettings/save",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const normalized = normalizePlatformSettings(payload);
      await superAdminSettingsService.updatePlatform(normalized);
      applyPlatformSettings(normalized);
      dispatch(patchLocalSettings({ platform: normalized }));
      await dispatch(fetchSuperAdminSettings());
      return normalized;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to save");
    }
  }
);

const initialState = {
  settings: readPlatformSettingsCache() || DEFAULT_PLATFORM_SETTINGS,
  loading: false,
  saving: false,
  error: null,
};

const platformSettingsSlice = createSlice({
  name: "platformSettings",
  initialState,
  reducers: {
    setPlatformSettingsPreview(state, action) {
      state.settings = normalizePlatformSettings(action.payload);
      applyPlatformSettings(state.settings);
    },
    resetPlatformSettingsPreview(state) {
      const cached = readPlatformSettingsCache();
      if (cached) {
        state.settings = cached;
        applyPlatformSettings(cached);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPlatformSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPlatformSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(loadPlatformSettings.rejected, (state) => {
        state.loading = false;
      })
      .addCase(savePlatformSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(savePlatformSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.settings = action.payload;
      })
      .addCase(savePlatformSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to save";
      });
  },
});

export const { setPlatformSettingsPreview, resetPlatformSettingsPreview } = platformSettingsSlice.actions;
export default platformSettingsSlice.reducer;
