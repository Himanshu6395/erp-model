import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import { inquiryTheme } from "../theme/inquiryMuiTheme";

export default function AdminInquiryLayout() {
  const { pathname } = useLocation();
  const tab = pathname.includes("/analytics")
    ? "/admin/inquiries/analytics"
    : pathname.includes("/create")
      ? "/admin/inquiries/create"
      : "/admin/inquiries/all";

  return (
    <ThemeProvider theme={inquiryTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: "background.default", minHeight: "100%", pb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            px: { xs: 2, md: 3 },
            pt: 2.5,
            pb: 0,
            mb: 2,
            borderBottom: "1px solid rgba(15,23,42,0.08)",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #1e40af, #2563eb, #38bdf8)",
            },
          }}
        >
          <Box sx={{ pt: 0.5 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Inquiry Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 560 }}>
              Track leads, follow-ups, assignments, and conversions in one workspace.
            </Typography>
          </Box>
          <Tabs value={tab} variant="scrollable" scrollButtons="auto">
            <Tab
              label="All Inquiries"
              value="/admin/inquiries/all"
              component={NavLink}
              to="/admin/inquiries/all"
            />
            <Tab
              label="Create Inquiry"
              value="/admin/inquiries/create"
              component={NavLink}
              to="/admin/inquiries/create"
            />
            <Tab
              label="Analytics"
              value="/admin/inquiries/analytics"
              component={NavLink}
              to="/admin/inquiries/analytics"
            />
          </Tabs>
        </Paper>
        <Box sx={{ px: { xs: 2, md: 3 }, maxWidth: 1320, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
