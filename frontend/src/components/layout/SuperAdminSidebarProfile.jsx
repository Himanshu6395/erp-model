import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/useAuth";
import ErpUserAvatar from "../common/ErpUserAvatar";

export default function SuperAdminSidebarProfile({ onClose }) {
  const { user } = useAuth();
  const profile = useSelector((s) => s.superAdminProfile);

  const name = profile.name || user?.name || "Super Admin";
  const avatarUrl = profile.avatarUrl || "";
  const designation = profile.designation || "Platform administrator";

  return (
    <Link
      to="/super-admin/settings/profile"
      onClick={onClose}
      className="mb-4 flex items-center gap-3 rounded-xl border border-gray-700/80 bg-gray-800/50 p-3 transition hover:border-gray-600 hover:bg-gray-800"
    >
      <ErpUserAvatar src={avatarUrl} name={name} email={user?.email} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-gray-400">{designation}</p>
      </div>
    </Link>
  );
}
