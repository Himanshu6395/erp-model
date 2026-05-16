import { createTheme } from "@mui/material/styles";

export const inquiryTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1d4ed8", dark: "#1e40af", light: "#3b82f6" },
    secondary: { main: "#0f172a" },
    background: { default: "#eef2f7", paper: "#ffffff" },
    grey: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h5: { fontWeight: 800, letterSpacing: "-0.02em" },
    h6: { fontWeight: 800, letterSpacing: "-0.01em" },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { scrollbarColor: "#cbd5e1 #f1f5f9" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px -8px rgba(15,23,42,0.1)",
          border: "1px solid rgba(15,23,42,0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          ...(theme.palette.mode === "light" && {
            "&.MuiPaper-outlined": { borderColor: "rgba(15,23,42,0.1)" },
          }),
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          backgroundColor: theme.palette.background.paper,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(29,78,216,0.35)",
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.045em",
          color: "#475569",
          backgroundImage: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
          borderBottom: "2px solid #e2e8f0",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { minHeight: 48, fontWeight: 700, textTransform: "none", fontSize: "0.9375rem" },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: "3px 3px 0 0" },
      },
    },
  },
});
