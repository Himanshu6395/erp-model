import { useNavigate } from "react-router-dom";
import { Box, Button, Paper, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SETTINGS_TABS, getSettingsStepIndex } from "./settingsConstants";

export default function SettingsStepFooter({
  pathname,
  tabs = SETTINGS_TABS,
  getStepIndex = getSettingsStepIndex,
}) {
  const navigate = useNavigate();
  const index = getStepIndex(pathname);
  const prev = tabs[index - 1];
  const next = tabs[index + 1];

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Button
        variant="outlined"
        color="inherit"
        disabled={!prev}
        startIcon={<ChevronLeft size={18} />}
        onClick={() => prev && navigate(prev.path)}
        sx={{
          borderRadius: "12px",
          minHeight: 44,
          textTransform: "none",
          fontWeight: 600,
          borderColor: "divider",
        }}
      >
        Previous
      </Button>

      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ flex: 1, textAlign: "center" }}>
        Step {index + 1} of {tabs.length}
      </Typography>

      <Button
        variant="contained"
        disabled={!next}
        endIcon={<ChevronRight size={18} />}
        onClick={() => next && navigate(next.path)}
        sx={{
          borderRadius: "12px",
          minHeight: 44,
          minWidth: { xs: "auto", sm: 120 },
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "0 4px 14px -4px rgba(37, 99, 235, 0.45)",
        }}
      >
        {next ? "Continue" : "Done"}
      </Button>
    </Paper>
  );
}
