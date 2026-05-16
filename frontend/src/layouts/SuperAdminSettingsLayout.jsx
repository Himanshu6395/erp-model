import { useEffect } from "react";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { superAdminSettingsTheme } from "../theme/superAdminSettingsTheme";
import { getSettingsTab } from "../pages/superAdmin/settings/settingsConstants";
import { fetchSuperAdminSettings } from "../store/superAdminSettingsSlice";
import { setThemeFromRemote } from "../store/erpThemeSlice";
import { SettingsStepNav, SettingsMobileSteps } from "../pages/superAdmin/settings/SettingsStepNav";
import SettingsStepFooter from "../pages/superAdmin/settings/SettingsStepFooter";
import SettingsContentTransition from "../pages/superAdmin/settings/SettingsContentTransition";

export default function SuperAdminSettingsLayout() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((s) => s.superAdminSettings);
  const current = getSettingsTab(pathname);

  useEffect(() => {
    dispatch(fetchSuperAdminSettings());
  }, [dispatch]);

  useEffect(() => {
    if (data?.theme) dispatch(setThemeFromRemote(data.theme));
  }, [data?.theme, dispatch]);

  return (
    <ThemeProvider theme={superAdminSettingsTheme}>
      <CssBaseline />
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", lg: 1320 },
          mx: "auto",
          pt: 0,
          pb: 2,
        }}
      >
        {/* Header — compact, top-aligned */}
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs
            aria-label="settings breadcrumb"
            sx={{ mb: 1, "& .MuiBreadcrumbs-li": { fontSize: "0.8125rem" } }}
          >
            <Link component={RouterLink} to="/super-admin" underline="hover" color="text.secondary">
              Super Admin
            </Link>
            <Typography color="text.primary" fontWeight={600} fontSize="0.8125rem">
              Settings
            </Typography>
            <Typography color="primary.main" fontWeight={600} fontSize="0.8125rem">
              {current.shortLabel}
            </Typography>
          </Breadcrumbs>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.25,
                  fontSize: { xs: "1.35rem", sm: "1.5rem" },
                }}
              >
                Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 520 }}>
                Manage your platform configuration and preferences.
              </Typography>
            </Box>
            <Chip
              label={`Step ${current.step} of 8 · ${current.label}`}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: "rgba(37, 99, 235, 0.08)",
                color: "primary.dark",
                border: "1px solid",
                borderColor: "rgba(37, 99, 235, 0.2)",
              }}
            />
          </Box>
        </Box>

        <SettingsMobileSteps pathname={pathname} />

        {loading && !data ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : null}

        {(!loading || data) && !error ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: { xs: 0, md: 3 },
            }}
          >
            <SettingsStepNav pathname={pathname} />

            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1.5, display: { xs: "none", md: "block" }, fontWeight: 500 }}
              >
                {current.description}
              </Typography>

              <SettingsContentTransition>
                <Outlet />
              </SettingsContentTransition>

              <SettingsStepFooter pathname={pathname} />
            </Box>
          </Box>
        ) : null}

        {loading && data ? (
          <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 40 }}>
            <CircularProgress size={24} />
          </Box>
        ) : null}
      </Box>
    </ThemeProvider>
  );
}
