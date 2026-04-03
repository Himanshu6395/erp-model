import { Link, NavLink } from "react-router-dom";
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
  MdHomeWork,
  MdAssessment,
  MdSettings,
  MdSecurity,
  MdCloudUpload,
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

const menuByRole = {
  SUPER_ADMIN: [
    { to: "/super-admin", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/super-admin/create-school", label: "Create School", icon: <FaSchool /> },
    // { to: "/super-admin/create-school-admin", label: "Create School Admin", icon: <MdPeople /> },
    { to: "/super-admin/schools", label: "Schools List", icon: <MdClass /> },
    { to: "/super-admin/plans", label: "Plans", icon: <MdAssignment /> },
    { to: "/super-admin/subscriptions", label: "Subscriptions", icon: <MdSchedule /> },
    { to: "/super-admin/payments", label: "Payments", icon: <MdReceipt /> },
    { to: "/super-admin/security-dashboard", label: "Security Dashboard", icon: <MdSecurity /> },
    { to: "/super-admin/login-activity", label: "Login Activity", icon: <MdAssessment /> },
    { to: "/super-admin/blocked-schools", label: "Blocked Schools", icon: <MdOutlineReportProblem /> },
    { to: "/super-admin/global-announcement", label: "Global announcement", icon: <MdCampaign /> },
  ],
  SCHOOL_ADMIN: [
    { to: "/admin", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/admin/students", label: "Student Management", icon: <FaGraduationCap /> },
    { to: "/admin/create-teacher", label: "Teacher Management", icon: <FaChalkboardTeacher /> },
    { to: "/admin/create-class", label: "Class & Section", icon: <MdClass /> },
    { to: "/admin/subjects", label: "Subjects", icon: <MdMenuBook /> },
    { to: "/admin/attendance", label: "Attendance", icon: <MdPeople /> },
    { to: "/admin/fees", label: "Fees", icon: <MdReceipt /> },
    { to: "/admin/exams-results", label: "Exams & Results", icon: <MdAssessment /> },
    { to: "/admin/timetable", label: "Timetable", icon: <MdSchedule /> },
    { to: "/admin/homework", label: "Homework", icon: <MdHomeWork /> },
    { to: "/admin/library", label: "Library", icon: <MdMenuBook /> },
    { to: "/admin/transport", label: "Transport", icon: <MdDirectionsBus /> },
    { to: "/admin/hostel", label: "Hostel", icon: <MdHomeWork /> },
    { to: "/admin/staff", label: "Staff", icon: <MdPeople /> },
    { to: "/admin/communication", label: "Communication", icon: <MdNotifications /> },
    { to: "/admin/reports", label: "Reports & Analytics", icon: <MdAssessment /> },
    { to: "/admin/settings", label: "Settings", icon: <MdSettings /> },
    { to: "/admin/roles", label: "Roles & Permissions", icon: <MdSecurity /> },
    { to: "/admin/notifications", label: "Notifications", icon: <MdNotifications /> },
    { to: "/admin/files", label: "File Management", icon: <MdCloudUpload /> },
    { to: "/admin/security", label: "Security", icon: <MdSecurity /> },
    { to: "/admin/notices", label: "Notices", icon: <MdNotifications /> },
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
    // { to: "/student/notice-board", label: "Notice Board", icon: <MdNotifications /> },
    { to: "/student/admit-card", label: "Admit Card", icon: <FaSchool /> },
    { to: "/student/timetable", label: "Timetable", icon: <MdCalendarMonth /> },
    { to: "/student/study-materials", label: "Study materials", icon: <MdBook /> },
    { to: "/student/leaves", label: "Leave requests", icon: <MdEventBusy /> },
  ],
  TEACHER: [
    { to: "/teacher", label: "Dashboard", icon: <MdDashboard /> },
    { to: "/teacher/students", label: "Students", icon: <FaGraduationCap /> },
    { to: "/teacher/attendance", label: "Attendance", icon: <MdPeople /> },
    { to: "/teacher/homework", label: "Homework", icon: <MdAssignment /> },
    { to: "/teacher/exams-marks", label: "Exams & Marks", icon: <MdAssessment /> },
    { to: "/teacher/timetable", label: "Timetable", icon: <MdSchedule /> },
    { to: "/teacher/communication", label: "Communication", icon: <MdNotifications /> },
    { to: "/teacher/announcements", label: "Announcements", icon: <MdNotifications /> },
    { to: "/teacher/study-material", label: "Study Material", icon: <MdBook /> },
    { to: "/teacher/performance", label: "Performance", icon: <MdAssessment /> },
    { to: "/teacher/leaves", label: "My leaves", icon: <MdPeople /> },
    { to: "/teacher/student-leaves", label: "Student leaves", icon: <MdEventBusy /> },
    { to: "/teacher/diary", label: "Diary", icon: <MdBook /> },
    { to: "/teacher/online-classes", label: "Online Classes", icon: <MdSchedule /> },
    { to: "/teacher/doubts", label: "Doubts", icon: <MdQuestionAnswer /> },
    { to: "/teacher/notifications", label: "Notifications", icon: <MdNotifications /> },
    { to: "/teacher/profile", label: "Profile", icon: <MdPeople /> },
    { to: "/teacher/salary", label: "Salary & Payslip", icon: <MdReceipt /> },
    { to: "/teacher/activities", label: "Activity Logs", icon: <MdAssessment /> },
  ],
};

function Sidebar({ role }) {
  const menu = menuByRole[role] || [];

  return (
    <aside className="hide-scrollbar hidden h-screen w-64 overflow-y-auto bg-gray-900 px-4 py-6 text-gray-200 md:fixed md:left-0 md:top-0 md:z-50 md:block">
      <Link to="/" className="mb-6 block text-lg font-bold tracking-wide text-white">
        School ERP
      </Link>
      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/super-admin" || item.to === "/admin" || item.to === "/student" || item.to === "/teacher"}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isActive ? "bg-brand-600 text-white" : "hover:bg-gray-800"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
