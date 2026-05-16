import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { TEACHER_SETTINGS_TABS, getTeacherSettingsTab } from "./teacherSettingsConstants";

export default function TeacherSettingsLayout() {
  const { pathname } = useLocation();
  const current = getTeacherSettingsTab(pathname);

  if (pathname === "/teacher/settings" || pathname === "/teacher/settings/") {
    return <Navigate to="/teacher/settings/profile" replace />;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Teacher portal</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <Settings className="h-7 w-7 text-brand-600" strokeWidth={1.75} />
            Settings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{current.description}</p>
        </div>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm ring-1 ring-slate-100 backdrop-blur-md"
        aria-label="Settings sections"
      >
        {TEACHER_SETTINGS_TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              `shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </NavLink>
        ))}
      </nav>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
