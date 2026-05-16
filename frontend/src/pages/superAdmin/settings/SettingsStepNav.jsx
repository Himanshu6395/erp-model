import { NavLink } from "react-router-dom";
import { Box, List, ListItemButton, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  CreditCard,
  KeyRound,
  Mail,
  Palette,
  Shield,
  User,
} from "lucide-react";
import { SETTINGS_TABS, getSettingsStepIndex } from "./settingsConstants";

const DEFAULT_GET_INDEX = getSettingsStepIndex;

const ICONS = {
  user: User,
  shield: Shield,
  building: Building2,
  mail: Mail,
  bell: Bell,
  creditCard: CreditCard,
  key: KeyRound,
  palette: Palette,
};

const SIDEBAR_WIDTH = 232;

export function SettingsStepNav({ pathname, tabs = SETTINGS_TABS, getStepIndex = DEFAULT_GET_INDEX }) {
  const activeIndex = getStepIndex(pathname);

  return (
    <Paper
      component="nav"
      aria-label="Settings navigation"
      elevation={0}
      sx={{
        display: { xs: "none", md: "block" },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Sections
        </Typography>
      </Box>
      <List disablePadding sx={{ py: 1, px: 1 }}>
        {tabs.map((tab, index) => {
          const active = index === activeIndex;
          const Icon = ICONS[tab.icon] || User;

          return (
            <ListItemButton
              key={tab.path}
              component={NavLink}
              to={tab.path}
              sx={{
                position: "relative",
                mb: 0.25,
                py: 1,
                px: 1.25,
                borderRadius: 2,
                overflow: "hidden",
                color: active ? "primary.main" : "text.secondary",
                bgcolor: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
                transition: "background-color 0.2s ease, color 0.2s ease",
                "&:hover": {
                  bgcolor: active ? "rgba(37, 99, 235, 0.1)" : "rgba(15,23,42,0.04)",
                  color: active ? "primary.main" : "text.primary",
                },
              }}
            >
              {active ? (
                <Box
                  component={motion.span}
                  layoutId="settings-nav-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "rgba(37, 99, 235, 0.25)",
                    bgcolor: "rgba(37, 99, 235, 0.06)",
                    pointerEvents: "none",
                  }}
                />
              ) : null}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    bgcolor: active ? "primary.main" : "grey.100",
                    color: active ? "#fff" : "text.secondary",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon size={16} strokeWidth={2} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={active ? 600 : 500} noWrap>
                    {tab.shortLabel}
                  </Typography>
                </Box>
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

export function SettingsMobileSteps({ pathname, tabs = SETTINGS_TABS, getStepIndex = DEFAULT_GET_INDEX }) {
  const activeIndex = getStepIndex(pathname);

  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: "block", md: "none" },
        mb: 2,
        p: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 0.75,
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {tabs.map((tab, index) => {
          const active = index === activeIndex;
          const Icon = ICONS[tab.icon] || User;
          return (
            <Box
              key={tab.path}
              component={NavLink}
              to={tab.path}
              sx={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.875,
                borderRadius: 1.5,
                textDecoration: "none",
                fontSize: "0.8125rem",
                fontWeight: active ? 600 : 500,
                color: active ? "primary.main" : "text.secondary",
                bgcolor: active ? "rgba(37, 99, 235, 0.08)" : "transparent",
                border: "1px solid",
                borderColor: active ? "primary.main" : "transparent",
                transition: "all 0.2s ease",
              }}
            >
              <Icon size={14} />
              {tab.shortLabel}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

export { SIDEBAR_WIDTH };
