import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { applySchoolBranding } from "../theme/applySchoolBranding";
import { applyErpTheme } from "../theme/applyErpTheme";
import { DEFAULT_ERP_THEME } from "../theme/erpThemeConstants";
import { schoolAdminSettingsService } from "../services/schoolAdminSettingsService";

export const fetchSchoolAdminSettings = createAsyncThunk(
  "schoolAdminSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await schoolAdminSettingsService.getSettings();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const schoolAdminSettingsSlice = createSlice({
  name: "schoolAdminSettings",
  initialState: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    patchSchoolAdminSettings(state, action) {
      if (state.data) state.data = { ...state.data, ...action.payload };
    },
    clearSchoolSettingsError(state) {
      state.error = null;
    },
    applySchoolBrandingPreview(state, action) {
      if (state.data) {
        state.data = { ...state.data, school: { ...state.data.school, ...action.payload } };
      }
      applySchoolBranding(action.payload);
    },
    applySchoolThemePreview(_state, action) {
      applyErpTheme({ ...DEFAULT_ERP_THEME, ...action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchoolAdminSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolAdminSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        if (action.payload?.school) applySchoolBranding(action.payload.school);
        if (action.payload?.theme) applyErpTheme({ ...DEFAULT_ERP_THEME, ...action.payload.theme });
      })
      .addCase(fetchSchoolAdminSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load settings";
      });
  },
});

export const {
  patchSchoolAdminSettings,
  clearSchoolSettingsError,
  applySchoolBrandingPreview,
  applySchoolThemePreview,
} = schoolAdminSettingsSlice.actions;
export default schoolAdminSettingsSlice.reducer;
