import { createTheme } from "@mui/material/styles";

export const superAdminSettingsTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb", dark: "#1d4ed8", light: "#3b82f6" },
    secondary: { main: "#0f172a" },
    background: { default: "transparent", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    divider: "rgba(15,23,42,0.08)",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: "0.8125rem" },
    body2: { fontSize: "0.875rem", lineHeight: 1.55 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 12 },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "0 4px 12px -4px rgba(37,99,235,0.4)" } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 1px 3px rgba(15,23,42,0.05), 0 8px 24px -12px rgba(15,23,42,0.1)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          minHeight: 56,
          backgroundColor: "#fff",
          transition: "box-shadow 0.2s ease",
          "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)" },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: { separator: { mx: 0.75 } },
    },
  },
});
