import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { motion } from "framer-motion";
import { useAuth } from "../../context/useAuth";
import { useTeacherProfile } from "../../hooks/useTeacherProfile";
import ErpUserAvatar from "./ErpUserAvatar";

export default function TeacherAccountMenu() {
  const { user, logout } = useAuth();
  const { displayName, avatarUrl, designation } = useTeacherProfile();
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => setAnchor(e.currentTarget)}
        className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-brand-200 hover:shadow-md"
        aria-label="Account menu"
      >
        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Online" />
        <ErpUserAvatar src={avatarUrl} name={displayName} email={user?.email} size={38} />
        <span className="hidden max-w-[110px] truncate text-left sm:block">
          <span className="block text-sm font-semibold text-slate-900">{displayName}</span>
          <span className="block truncate text-[0.65rem] font-medium text-slate-500">{designation}</span>
        </span>
      </motion.button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { minWidth: 220, borderRadius: 2 } } }}
      >
        <MenuItem component={Link} to="/teacher/settings/profile" onClick={() => setAnchor(null)}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/teacher/settings/profile" onClick={() => setAnchor(null)}>
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/teacher/notifications" onClick={() => setAnchor(null)}>
          <ListItemIcon>
            <NotificationsNoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Notifications</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            logout();
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
