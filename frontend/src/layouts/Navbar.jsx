import { FaSignOutAlt } from "react-icons/fa";
import { Menu, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { roles } from "../utils/roleUtils";
import { fetchInquiryBadge } from "../store/inquiriesSlice";
import { adminService } from "../services/adminService";
import { teacherService } from "../services/teacherService";
import ErpUserAvatar from "../components/common/ErpUserAvatar";
import SuperAdminAccountMenu from "../components/common/SuperAdminAccountMenu";
import BrandingLogo from "../components/common/BrandingLogo";
import { useSchoolBranding } from "../hooks/useSchoolBranding";
import SchoolAdminAccountMenu from "../components/common/SchoolAdminAccountMenu";
import TeacherAccountMenu from "../components/common/TeacherAccountMenu";
import { useTeacherProfile } from "../hooks/useTeacherProfile";

function formatRole(role) {
  if (!role) return "User";
  return String(role)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Navbar({ onOpenMobileNav, mobileNavOpen }) {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const inquiryFollowDue = useSelector((s) => s.inquiries.badge);
  const [teacherLeavePending, setTeacherLeavePending] = useState(0);
  const [teacherUnreadAlerts, setTeacherUnreadAlerts] = useState(0);
  const superAdminProfile = useSelector((s) => s.superAdminProfile);
  const { displayName: brandingName } = useSchoolBranding();
  const isSuperAdmin = user?.role === roles.SUPER_ADMIN;
  const isSchoolAdmin = user?.role === roles.SCHOOL_ADMIN;
  const isTeacher = user?.role === roles.TEACHER;
  const teacherProfile = useTeacherProfile();

  const displayName = isTeacher
    ? teacherProfile.displayName
    : superAdminProfile?.name || user?.name || "User";
  const avatarUrl = isTeacher
    ? teacherProfile.avatarUrl
    : superAdminProfile?.avatarUrl || user?.avatarUrl || "";

  useEffect(() => {
    if (user?.role === roles.SCHOOL_ADMIN) {
      dispatch(fetchInquiryBadge());
      adminService
        .getTeacherLeaveBadgeCount()
        .then((r) => setTeacherLeavePending(r?.count ?? 0))
        .catch(() => setTeacherLeavePending(0));
    }
    if (user?.role === roles.TEACHER) {
      teacherService
        .getUnreadNotificationCount()
        .then((r) => setTeacherUnreadAlerts(r?.count ?? 0))
        .catch(() => setTeacherUnreadAlerts(0));
    }
  }, [dispatch, user?.role]);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 border-b border-white/70 px-4 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl md:px-6 ${
        isTeacher ? "md:left-52" : "md:left-64"
      }`}
      style={{ backgroundColor: "var(--erp-header-bg, rgba(255,255,255,0.8))" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/70 to-transparent" />

      <div className="relative flex h-[4.25rem] items-center justify-between gap-3 md:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={Boolean(mobileNavOpen)}
            aria-controls="dashboard-sidebar"
            onClick={() => onOpenMobileNav?.()}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-600/90">
              <BrandingLogo size={18} className="shrink-0 md:hidden" />
              <Sparkles className="hidden h-3 w-3 shrink-0 md:block" aria-hidden />
              <span className="truncate">{brandingName}</span>
            </p>
            <h1 className="mt-0.5 flex min-w-0 items-center gap-2 truncate text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
              {isSuperAdmin ? (
                <ErpUserAvatar
                  src={avatarUrl}
                  name={displayName}
                  email={user?.email}
                  size={32}
                  className="shrink-0 md:hidden"
                />
              ) : null}
              <span className="truncate">
                Welcome,{" "}
                <span className="bg-gradient-to-r from-slate-950 to-brand-700 bg-clip-text text-transparent">
                  {displayName}
                </span>
              </span>
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user?.role === roles.SCHOOL_ADMIN && inquiryFollowDue > 0 ? (
            <Link
              to="/admin/inquiries/all"
              className="rounded-full bg-orange-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-orange-600"
              title="Follow-ups due"
            >
              {inquiryFollowDue} inquiry follow-up{inquiryFollowDue === 1 ? "" : "s"}
            </Link>
          ) : null}
          {user?.role === roles.SCHOOL_ADMIN && teacherLeavePending > 0 ? (
            <Link
              to="/admin/teacher-leaves"
              className="rounded-full bg-violet-600/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-violet-700"
              title="Pending teacher leave requests"
            >
              {teacherLeavePending} leave request{teacherLeavePending === 1 ? "" : "s"}
            </Link>
          ) : null}
          {user?.role === roles.TEACHER && teacherUnreadAlerts > 0 ? (
            <Link
              to="/teacher/notifications"
              className="rounded-full bg-brand-600/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-brand-700"
              title="Unread notifications"
            >
              {teacherUnreadAlerts} alert{teacherUnreadAlerts === 1 ? "" : "s"}
            </Link>
          ) : null}

          {isSuperAdmin ? (
            <SuperAdminAccountMenu />
          ) : isSchoolAdmin ? (
            <SchoolAdminAccountMenu />
          ) : isTeacher ? (
            <TeacherAccountMenu />
          ) : (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm sm:flex">
                <span className="text-xs font-semibold text-slate-700">{formatRole(user?.role)}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:bg-brand-700 hover:shadow-lg"
              >
                <FaSignOutAlt className="text-sm opacity-90" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
