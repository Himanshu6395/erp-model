import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { superAdminSettingsService } from "../services/superAdminSettingsService";

export const fetchSuperAdminSettings = createAsyncThunk("superAdminSettings/fetch", async (_, { rejectWithValue }) => {
  try {
    return await superAdminSettingsService.getSettings();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
};

const superAdminSettingsSlice = createSlice({
  name: "superAdminSettings",
  initialState,
  reducers: {
    patchLocalSettings(state, action) {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    clearSettingsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperAdminSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuperAdminSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSuperAdminSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load settings";
      });
  },
});

export const { patchLocalSettings, clearSettingsError } = superAdminSettingsSlice.actions;
export default superAdminSettingsSlice.reducer;
