import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaChalkboardTeacher, FaGraduationCap, FaSchool } from "react-icons/fa";
import {
  MdDashboard,
  MdNotifications,
  MdClass,
  MdPeople,
  MdAssignment,
  MdReceipt,
  MdMenuBook,
  MdDirectionsBus,
  MdAssessment,
  MdSettings,
  MdSecurity,
  MdSchedule,
  MdBook,
  MdQuestionAnswer,
  MdFeedback,
  MdOutlineReportProblem,
  MdCalendarMonth,
  MdWork,
  MdLink,
  MdEventBusy,
  MdCampaign,
} from "react-icons/md";
import SettingsNavGroup from "../components/layout/SettingsNavGroup";
import SuperAdminSidebarProfile from "../components/layout/SuperAdminSidebarProfile";
import TeacherSidebarProfile from "../components/layout/TeacherSidebarProfile";
import BrandingLogo from "../components/common/BrandingLogo";
import PlatformLogo from "../components/common/PlatformLogo";
import { usePlatformSettings } from "../hooks/usePlatformSettings";
import { useSchoolBranding } from "../hooks/useSchoolBranding";
import { roles } from "../utils/roleUtils";

const menuByRole = {
  SUPER_ADMIN: [
    { to: "/super-admin", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/super-admin/create-school", label: "Create School", icon: <FaSchool /> },
    { to: "/super-admin/schools", label: "Schools List", icon: <MdClass /> },
    { to: "/super-admin/plans", label: "Plans", icon: <MdAssignment /> },
    { to: "/super-admin/subscriptions", label: "Subscriptions", icon: <MdSchedule /> },
    { to: "/super-admin/payments", label: "Payments", icon: <MdReceipt /> },
    { to: "/super-admin/security-dashboard", label: "Security Dashboard", icon: <MdSecurity /> },
    { to: "/super-admin/login-activity", label: "Login Activity", icon: <MdAssessment /> },
    { to: "/super-admin/blocked-schools", label: "Blocked Schools", icon: <MdOutlineReportProblem /> },
    { to: "/super-admin/global-announcement", label: "Global announcement", icon: <MdCampaign /> },
    {
      to: "/super-admin/settings",
      label: "Settings",
      icon: <MdSettings />,
      children: [
        { to: "/super-admin/settings/profile", label: "Profile" },
        { to: "/super-admin/settings/security", label: "Security" },
        { to: "/super-admin/settings/platform", label: "Platform Settings" },
        { to: "/super-admin/settings/email", label: "Email / SMTP" },
        { to: "/super-admin/settings/notifications", label: "Notifications" },
        { to: "/super-admin/settings/billing", label: "Billing & Subscription" },
        { to: "/super-admin/settings/permissions", label: "Roles & Permissions" },
        { to: "/super-admin/settings/theme", label: "Theme & Appearance" },
      ],
    },
  ],
  SCHOOL_ADMIN: [
    { to: "/admin", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/admin/students", label: "Student Management", icon: <FaGraduationCap /> },
    { to: "/admin/teachers", label: "Teacher Management", icon: <FaChalkboardTeacher /> },
    { to: "/admin/classes", label: "Class & Section", icon: <MdClass /> },
    { to: "/admin/subjects", label: "Subjects", icon: <MdMenuBook /> },
    { to: "/admin/attendance", label: "Attendance", icon: <MdPeople /> },
    { to: "/admin/teacher-leaves", label: "Teacher Leave Requests", icon: <MdEventBusy /> },
    { to: "/admin/fees", label: "Fees", icon: <MdReceipt /> },
    { to: "/admin/exams-results", label: "Exams & Results", icon: <MdAssessment /> },
    { to: "/admin/timetable", label: "Timetable", icon: <MdSchedule /> },
    { to: "/admin/transport", label: "Transport", icon: <MdDirectionsBus /> },
    { to: "/admin/notices", label: "Notices", icon: <MdNotifications /> },
    { to: "/admin/inquiries", label: "Inquiry", icon: <MdQuestionAnswer /> },
    {
      to: "/admin/library",
      label: "Library Management",
      icon: <MdBook />,
      children: [
        { to: "/admin/library/dashboard", label: "Dashboard" },
        { to: "/admin/library/books", label: "Books" },
        { to: "/admin/library/categories", label: "Categories" },
        { to: "/admin/library/issued", label: "Issued Books" },
        { to: "/admin/library/returns", label: "Return Books" },
        { to: "/admin/library/fines", label: "Fine Management" },
        { to: "/admin/library/requests", label: "Student Requests" },
        { to: "/admin/library/reports", label: "Reports" },
        { to: "/admin/library/settings", label: "Library Settings" },
      ],
    },
    {
      to: "/admin/settings",
      label: "Settings",
      icon: <MdSettings />,
      children: [
        { to: "/admin/settings/profile", label: "Profile" },
        { to: "/admin/settings/security", label: "Security" },
        { to: "/admin/settings/school", label: "School Settings" },
        { to: "/admin/settings/email", label: "Email / SMTP" },
        { to: "/admin/settings/notifications", label: "Notifications" },
        { to: "/admin/settings/theme", label: "Theme & Appearance" },
      ],
    },
  ],
  STUDENT: [
    { to: "/student", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/student/profile", label: "Student Details", icon: <MdPeople /> },
    { to: "/student/alerts", label: "Alerts / Notifications", icon: <MdNotifications /> },
    { to: "/student/attendance", label: "Attendance", icon: <MdPeople /> },
    { to: "/student/assignments", label: "Assignments / Course Plan", icon: <MdAssignment /> },
    { to: "/student/library", label: "Library", icon: <MdBook /> },
    { to: "/student/links-registration", label: "Links / Registration", icon: <MdLink /> },
    { to: "/student/feedback", label: "Feedback", icon: <MdFeedback /> },
    { to: "/student/placement", label: "Placement", icon: <MdWork /> },
    { to: "/student/complaints", label: "Complaint / Grievances", icon: <MdOutlineReportProblem /> },
    { to: "/student/result", label: "Result", icon: <MdDashboard /> },
    { to: "/student/fees", label: "Fees", icon: <MdReceipt /> },
    { to: "/student/notices", label: "Notices", icon: <MdNotifications /> },
    { to: "/student/admit-card", label: "Admit Card", icon: <FaSchool /> },
    { to: "/student/timetable", label: "Timetable", icon: <MdCalendarMonth /> },
    { to: "/student/study-materials", label: "Study materials", icon: <MdBook /> },
    { to: "/student/leaves", label: "Leave requests", icon: <MdEventBusy /> },
  ],
  TEACHER: [
    { to: "/teacher", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/teacher/inquiries", label: "Inquiry", icon: <MdQuestionAnswer /> },
    { to: "/teacher/students", label: "Students", icon: <FaGraduationCap /> },
    { to: "/teacher/attendance", label: "Attendance", icon: <MdPeople /> },
    { to: "/teacher/homework", label: "Homework", icon: <MdAssignment /> },
    { to: "/teacher/exams-marks", label: "Exams & Marks", icon: <MdAssessment /> },
    { to: "/teacher/timetable", label: "Timetable", icon: <MdSchedule /> },
    { to: "/teacher/communication", label: "Communication", icon: <MdNotifications /> },
    { to: "/teacher/announcements", label: "Announcements", icon: <MdNotifications /> },
    { to: "/teacher/study-material", label: "Study Material", icon: <MdBook /> },
    { to: "/teacher/performance", label: "Performance", icon: <MdAssessment /> },
    { to: "/teacher/leaves", label: "Leave Management", icon: <MdEventBusy /> },
    { to: "/teacher/student-leaves", label: "Student leaves", icon: <MdEventBusy /> },
    { to: "/teacher/diary", label: "Diary", icon: <MdBook /> },
    { to: "/teacher/online-classes", label: "Online Classes", icon: <MdSchedule /> },
    { to: "/teacher/doubts", label: "Doubts", icon: <MdQuestionAnswer /> },
    { to: "/teacher/notifications", label: "Notifications", icon: <MdNotifications /> },
    { to: "/teacher/settings/profile", label: "Settings", icon: <MdSettings /> },
    { to: "/teacher/salary", label: "Salary & Payslip", icon: <MdReceipt /> },
    { to: "/teacher/activities", label: "Activity Logs", icon: <MdAssessment /> },
  ],
};

function Sidebar({ role, mobileOpen, onClose }) {
  const menu = menuByRole[role] || [];
  const location = useLocation();
  const isSuperAdmin = role === roles.SUPER_ADMIN;
  const isSchoolAdmin = role === roles.SCHOOL_ADMIN;
  const isTeacher = role === roles.TEACHER;
  const isStudent = role === roles.STUDENT;
  const compactNav = isTeacher || isStudent;
  const { displayName } = useSchoolBranding();
  const { settings: platform } = usePlatformSettings();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-[55] bg-black/50 transition-opacity duration-200 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="Close menu"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={onClose}
      />

      <aside
        id="dashboard-sidebar"
        style={{ backgroundColor: "var(--erp-sidebar-bg, #111827)" }}
        className={`${isSuperAdmin || compactNav ? "sidebar-thin-scrollbar" : "hide-scrollbar"} fixed left-0 top-0 z-[60] flex h-screen ${
          compactNav ? "w-52" : "w-64"
        } flex-col overflow-hidden border-r border-gray-800 text-gray-200 transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:shadow-none"
        }`}
      >
        {!isSuperAdmin ? (
          <div className={`flex shrink-0 items-center justify-between gap-2 border-b border-gray-800 ${compactNav ? "px-3 py-3" : "px-4 py-4"}`}>
            <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={onClose}>
              <BrandingLogo size={36} className="shrink-0" />
              <span className="truncate text-lg font-bold tracking-wide text-white">
                {displayName}
              </span>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
              aria-label="Close sidebar"
              onClick={onClose}
            >
              <span className="text-xl leading-none" aria-hidden>
                ×
              </span>
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 justify-end px-3 pt-3 md:hidden">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              aria-label="Close sidebar"
              onClick={onClose}
            >
              <span className="text-xl leading-none" aria-hidden>
                ×
              </span>
            </button>
          </div>
        )}

        {isSuperAdmin ? (
          <div className="shrink-0 space-y-3 px-3 pt-1 md:pt-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-700/80 bg-gray-800/40 px-3 py-2.5">
              <PlatformLogo size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{platform.platformName}</p>
                <p className="truncate text-[0.65rem] uppercase tracking-wider text-gray-500">Platform</p>
              </div>
            </div>
            <SuperAdminSidebarProfile onClose={onClose} />
          </div>
        ) : null}

        {isTeacher ? (
          <div className="shrink-0 px-2.5 pt-2">
            <TeacherSidebarProfile onClose={onClose} />
          </div>
        ) : null}

        <nav
          className={`min-h-0 flex-1 space-y-0.5 overflow-y-auto py-2 ${
            compactNav ? "sidebar-thin-scrollbar px-2" : "px-3 py-3"
          } ${isSuperAdmin ? "sidebar-thin-scrollbar" : ""}`}
        >
          {menu.map((item) => {
            if (item.children?.length) {
              if (isSuperAdmin || isSchoolAdmin) {
                return <SettingsNavGroup key={item.to} item={item} onClose={onClose} parentIcon={item.icon} />;
              }
              const sectionActive = location.pathname.startsWith(item.to);
              return (
                <div key={item.to} className="space-y-1">
                  <NavLink
                    to={item.children[0].to}
                    onClick={onClose}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                      sectionActive ? "bg-brand-600 text-white" : "hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                  {sectionActive ? (
                    <div className="ml-3 space-y-0.5 border-l border-gray-700 pl-2">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `block rounded-lg px-3 py-1.5 text-xs transition ${
                              isActive ? "bg-brand-600/90 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={
                  item.to === "/super-admin" ||
                  item.to === "/admin" ||
                  item.to === "/student" ||
                  item.to === "/teacher"
                }
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl font-medium transition ${
                    compactNav ? "px-2.5 py-2 text-[0.8125rem]" : "px-3 py-2.5 text-sm"
                  } ${isActive ? "bg-brand-600 text-white shadow-md" : "hover:bg-gray-800"}`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
