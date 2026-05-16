import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { applyErpTheme, persistErpTheme, readStoredErpTheme, resetErpTheme } from "../theme/applyErpTheme";
import { DEFAULT_ERP_THEME, normalizeErpTheme } from "../theme/erpThemeConstants";
import { platformThemeService } from "../services/platformThemeService";
import { superAdminSettingsService } from "../services/superAdminSettingsService";
import { patchLocalSettings } from "./superAdminSettingsSlice";

export const loadErpTheme = createAsyncThunk("erpTheme/load", async () => {
  const stored = readStoredErpTheme();
  if (stored) applyErpTheme(stored);

  try {
    const remote = await platformThemeService.getTheme();
    if (remote) {
      const merged = normalizeErpTheme(remote);
      persistErpTheme(merged);
      applyErpTheme(merged);
      return merged;
    }
  } catch {
    /* use stored/default when API unavailable */
  }

  const fallback = normalizeErpTheme(stored || DEFAULT_ERP_THEME);
  applyErpTheme(fallback);
  return fallback;
});

export const saveErpTheme = createAsyncThunk(
  "erpTheme/save",
  async (themePayload, { dispatch, rejectWithValue }) => {
    try {
      const normalized = normalizeErpTheme(themePayload);
      await superAdminSettingsService.updateTheme(normalized);
      persistErpTheme(normalized);
      applyErpTheme(normalized);
      dispatch(patchLocalSettings({ theme: normalized }));
      return normalized;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  theme: readStoredErpTheme() || DEFAULT_ERP_THEME,
  loading: false,
  saving: false,
  error: null,
  hydrated: Boolean(readStoredErpTheme()),
};

const erpThemeSlice = createSlice({
  name: "erpTheme",
  initialState,
  reducers: {
    applyThemePreview(state, action) {
      state.theme = normalizeErpTheme(action.payload);
      applyErpTheme(state.theme);
    },
    setThemeFromRemote(state, action) {
      if (!action.payload) return;
      const next = normalizeErpTheme(action.payload);
      state.theme = next;
      persistErpTheme(next);
      applyErpTheme(next);
    },
    resetThemeLocal(state) {
      const next = resetErpTheme();
      state.theme = next;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadErpTheme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadErpTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.theme = action.payload;
        state.hydrated = true;
      })
      .addCase(loadErpTheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
        state.hydrated = true;
      })
      .addCase(saveErpTheme.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveErpTheme.fulfilled, (state, action) => {
        state.saving = false;
        state.theme = action.payload;
      })
      .addCase(saveErpTheme.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to save theme";
      });
  },
});

export const { applyThemePreview, setThemeFromRemote, resetThemeLocal } = erpThemeSlice.actions;
export default erpThemeSlice.reducer;
