import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useAuth } from "../../context/useAuth";
import ErpUserAvatar from "./ErpUserAvatar";

export default function SchoolAdminAccountMenu() {
  const { user, logout } = useAuth();
  const profile = useSelector((s) => s.schoolAdminProfile);
  const [anchor, setAnchor] = useState(null);

  const displayName = profile.name || user?.name || "Admin";
  const avatarUrl = profile.avatarUrl || user?.avatarUrl || "";

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 py-1.5 pl-1.5 pr-3 shadow-sm transition hover:bg-slate-50"
        aria-label="Account menu"
      >
        <ErpUserAvatar src={avatarUrl} name={displayName} email={user?.email} size={36} />
        <span className="hidden max-w-[120px] truncate text-sm font-semibold text-slate-800 sm:inline">{displayName}</span>
      </button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} transformOrigin={{ horizontal: "right", vertical: "top" }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <MenuItem component={Link} to="/admin/settings/profile" onClick={() => setAnchor(null)}>
          <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            logout();
          }}
        >
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
