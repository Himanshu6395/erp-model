import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErpThemeProvider from "./providers/ErpThemeProvider.jsx";
import PlatformSettingsProvider from "./providers/PlatformSettingsProvider.jsx";
import SuperAdminProfileHydrator from "./providers/SuperAdminProfileHydrator.jsx";
import SchoolAdminSettingsHydrator from "./providers/SchoolAdminSettingsHydrator.jsx";
import TeacherProfileHydrator from "./providers/TeacherProfileHydrator.jsx";
import { readPlatformSettingsCache } from "./utils/platformSettingsCache.js";
import { applyPlatformSettings } from "./theme/applyPlatformSettings.js";
import { store } from "./store/store.js";
import { readStoredErpTheme, applyErpTheme } from "./theme/applyErpTheme.js";
import "./index.css";

const storedTheme = readStoredErpTheme();
if (storedTheme) applyErpTheme(storedTheme);

const storedPlatform = readPlatformSettingsCache();
if (storedPlatform) applyPlatformSettings(storedPlatform);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <ErpThemeProvider>
            <PlatformSettingsProvider>
            <SuperAdminProfileHydrator>
              <SchoolAdminSettingsHydrator>
                <TeacherProfileHydrator>
                  <App />
                  <Toaster position="top-right" />
                </TeacherProfileHydrator>
              </SchoolAdminSettingsHydrator>
            </SuperAdminProfileHydrator>
            </PlatformSettingsProvider>
          </ErpThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
