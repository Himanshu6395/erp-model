import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MdExpandMore, MdSettings } from "react-icons/md";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SecurityIcon from "@mui/icons-material/Security";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AssignmentReturnedOutlinedIcon from "@mui/icons-material/AssignmentReturnedOutlined";
import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsApplicationsOutlinedIcon from "@mui/icons-material/SettingsApplicationsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";

const CHILD_ICONS = {
  Profile: PersonOutlineIcon,
  Security: SecurityIcon,
  "Platform Settings": ApartmentIcon,
  "School Settings": ApartmentIcon,
  "Email / SMTP": MailOutlineIcon,
  Notifications: NotificationsNoneIcon,
  "Billing & Subscription": CreditCardIcon,
  "Roles & Permissions": AdminPanelSettingsIcon,
  "Theme & Appearance": PaletteOutlinedIcon,
  Dashboard: BarChartOutlinedIcon,
  Books: MenuBookOutlinedIcon,
  Categories: CategoryOutlinedIcon,
  "Issued Books": MenuBookOutlinedIcon,
  "Return Books": AssignmentReturnedOutlinedIcon,
  "Fine Management": RuleFolderOutlinedIcon,
  "Student Requests": PendingActionsOutlinedIcon,
  Reports: BarChartOutlinedIcon,
  "Library Settings": SettingsApplicationsOutlinedIcon,
  "Upcoming Exams": RocketLaunchOutlinedIcon,
  "Live Exams": PlayCircleOutlineOutlinedIcon,
  "Completed Exams": AssignmentTurnedInOutlinedIcon,
  Performance: QueryStatsOutlinedIcon,
  "Create Exam": AddCircleOutlineOutlinedIcon,
  "My Exams": QuizOutlinedIcon,
  "Question Bank": MenuBookOutlinedIcon,
};

export default function SettingsNavGroup({ item, onClose, parentIcon }) {
  const location = useLocation();
  const sectionActive = location.pathname.startsWith(item.to);
  const [open, setOpen] = useState(sectionActive);

  useEffect(() => {
    if (sectionActive) setOpen(true);
  }, [sectionActive]);

  return (
    <motion.div layout className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          sectionActive ? "bg-brand-600 text-white shadow-md shadow-brand-900/20" : "text-gray-200 hover:bg-gray-800/90"
        }`}
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-base">
          {parentIcon || <MdSettings />}
        </span>
        <span className="flex-1 text-left">{item.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`shrink-0 opacity-80 ${sectionActive ? "text-white" : "text-gray-400"}`}
        >
          <MdExpandMore className="text-xl" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-2 space-y-0.5 border-l-2 border-gray-700/80 py-1 pl-2">
              {item.children.map((child) => {
                const Icon = CHILD_ICONS[child.label] || PersonOutlineIcon;
                return (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition ${
                        isActive
                          ? "bg-brand-600/95 text-white shadow-sm"
                          : "text-gray-400 hover:bg-gray-800/80 hover:text-gray-100"
                      }`
                    }
                  >
                    <Icon
                      sx={{
                        fontSize: 18,
                        opacity: 0.9,
                        flexShrink: 0,
                      }}
                    />
                    <span className="truncate">{child.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
