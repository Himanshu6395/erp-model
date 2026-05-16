import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/useAuth";
import { useTeacherProfile } from "../../hooks/useTeacherProfile";
import ErpUserAvatar from "../common/ErpUserAvatar";

export default function TeacherSidebarProfile({ onClose }) {
  const { user } = useAuth();
  const { displayName, avatarUrl, designation } = useTeacherProfile();

  return (
    <motion.div whileHover={{ scale: 1.01 }} className="mb-2">
      <Link
        to="/teacher/settings/profile"
        onClick={onClose}
        className="flex items-center gap-2.5 rounded-xl border border-gray-700/80 bg-gradient-to-br from-gray-800/80 to-gray-900/60 p-2.5 transition hover:border-brand-500/40 hover:from-brand-900/30"
      >
        <div className="relative shrink-0">
          <ErpUserAvatar src={avatarUrl} name={displayName} email={user?.email} size={40} />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-gray-900" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
          <p className="truncate text-xs text-gray-400">{designation}</p>
        </div>
      </Link>
    </motion.div>
  );
}
