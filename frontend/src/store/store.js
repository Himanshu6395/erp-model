import { configureStore } from "@reduxjs/toolkit";
import inquiriesReducer from "./inquiriesSlice.js";
import superAdminSettingsReducer from "./superAdminSettingsSlice.js";
import erpThemeReducer from "./erpThemeSlice.js";
import superAdminProfileReducer from "./superAdminProfileSlice.js";
import platformSettingsReducer from "./platformSettingsSlice.js";
import schoolAdminSettingsReducer from "./schoolAdminSettingsSlice.js";
import schoolAdminProfileReducer from "./schoolAdminProfileSlice.js";
import teacherProfileReducer from "./teacherProfileSlice.js";

export const store = configureStore({
  reducer: {
    inquiries: inquiriesReducer,
    superAdminSettings: superAdminSettingsReducer,
    erpTheme: erpThemeReducer,
    superAdminProfile: superAdminProfileReducer,
    platformSettings: platformSettingsReducer,
    schoolAdminSettings: schoolAdminSettingsReducer,
    schoolAdminProfile: schoolAdminProfileReducer,
    teacherProfile: teacherProfileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
