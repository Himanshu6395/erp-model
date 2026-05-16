import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/useAuth";
import ErpUserAvatar from "./ErpUserAvatar";

function formatRole(role) {
  if (!role) return "User";
  return String(role)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SuperAdminAccountMenu() {
  const { user, logout } = useAuth();
  const profile = useSelector((s) => s.superAdminProfile);
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  const displayName = profile.name || user?.name || "Super Admin";
  const avatarUrl = profile.avatarUrl || user?.avatarUrl || "";

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 py-1 pl-1 pr-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        aria-label="Account menu"
      >
        <ErpUserAvatar src={avatarUrl} name={displayName} email={user?.email} size={36} />
        <span className="hidden max-w-[120px] truncate text-xs font-semibold text-slate-800 sm:inline">
          {formatRole(user?.role)}
        </span>
      </button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { minWidth: 220, borderRadius: 2, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <ErpUserAvatar src={avatarUrl} name={displayName} email={user?.email} size={44} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem
          component={RouterLink}
          to="/super-admin/settings/profile"
          onClick={() => setAnchor(null)}
        >
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile settings</ListItemText>
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to="/super-admin/settings"
          onClick={() => setAnchor(null)}
        >
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>All settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            logout();
            navigate("/login");
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
