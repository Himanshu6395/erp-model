import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/useAuth";
import { getRoleHome, roles } from "../utils/roleUtils";
import LoginPage from "../pages/auth/LoginPage";
import HomePage from "../pages/HomePage";
import MarketingShell from "../layouts/MarketingShell";
import AboutPage from "../pages/marketing/AboutPage";
import ServicesPage from "../pages/marketing/ServicesPage";
import AdvantagesPage from "../pages/marketing/AdvantagesPage";
import FaqPage from "../pages/marketing/FaqPage";
import CareerPage from "../pages/marketing/CareerPage";
import PrivacyPolicyPage from "../pages/marketing/PrivacyPolicyPage";
import TermsPage from "../pages/marketing/TermsPage";
import ModulesPage from "../pages/marketing/ModulesPage";
import FeaturesPage from "../pages/marketing/FeaturesPage";
import PricingPage from "../pages/marketing/PricingPage";
import DemoPage from "../pages/marketing/DemoPage";
import GetStartedPage from "../pages/marketing/GetStartedPage";
import SuperAdminDashboard from "../pages/superAdmin/Dashboard";
import CreateSchoolPage from "../pages/superAdmin/CreateSchool";
import CreateSchoolAdminPage from "../pages/superAdmin/CreateSchoolAdmin";
import SchoolsListPage from "../pages/superAdmin/SchoolsList";
import SchoolViewPage from "../pages/superAdmin/SchoolView";
import PlansPage from "../pages/superAdmin/Plans";
import SubscriptionsPage from "../pages/superAdmin/Subscriptions";
import PaymentsPage from "../pages/superAdmin/Payments";
import SecurityDashboardPage from "../pages/superAdmin/SecurityDashboard";
import LoginActivityPage from "../pages/superAdmin/LoginActivity";
import BlockedSchoolsPage from "../pages/superAdmin/BlockedSchools";
import GlobalAnnouncementPage from "../pages/superAdmin/GlobalAnnouncement";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminStudentManagementLayout from "../layouts/AdminStudentManagementLayout";
import AdminTeacherManagementLayout from "../layouts/AdminTeacherManagementLayout";
import AdminClassManagementLayout from "../layouts/AdminClassManagementLayout";
import AdminSubjectManagementLayout from "../layouts/AdminSubjectManagementLayout";
import AdminTimetableManagementLayout from "../layouts/AdminTimetableManagementLayout";
import AdminNoticeManagementLayout from "../layouts/AdminNoticeManagementLayout";
import AdminExamManagementLayout from "../layouts/AdminExamManagementLayout";
import AdminTransportManagementLayout from "../layouts/AdminTransportManagementLayout";
import CreateStudentPage from "../pages/admin/CreateStudent";
import RegisteredStudentsPage from "../pages/admin/RegisteredStudents";
import CreateTeacherPage from "../pages/admin/CreateTeacher";
import RegisteredTeachersPage from "../pages/admin/RegisteredTeachers";
import CreateClassPage from "../pages/admin/CreateClass";
import RegisteredClassesPage from "../pages/admin/RegisteredClasses";
import NoticeManagementPage from "../pages/admin/NoticeManagement";
import RegisteredNoticesPage from "../pages/admin/RegisteredNotices";
import SubjectManagementPage from "../pages/admin/SubjectManagement";
import RegisteredSubjectsPage from "../pages/admin/RegisteredSubjects";
import AttendanceManagementPage from "../pages/admin/AttendanceManagement";
import FeesManagementPage from "../pages/admin/FeesManagement";
import ModulePlaceholder from "../pages/admin/ModulePlaceholder";
import TimetableManagementPage from "../pages/admin/TimetableManagement";
import RegisteredTimetablePage from "../pages/admin/RegisteredTimetable";
import ExamsResultsManagementPage from "../pages/admin/ExamsResultsManagement";
import RegisteredExamsPage from "../pages/admin/RegisteredExams";
import TransportManagementPage from "../pages/admin/TransportManagement";
import RegisteredTransportPage from "../pages/admin/RegisteredTransport";
import StudentDashboard from "../pages/student/Dashboard";
import StudentAttendancePage from "../pages/student/Attendance";
import StudentResultPage from "../pages/student/Result";
import StudentFeesPage from "../pages/student/Fees";
import StudentAssignmentsPage from "../pages/student/Assignments";
import StudentNoticesPage from "../pages/student/Notices";
import StudentAdmitCardPage from "../pages/student/AdmitCard";
import StudentProfilePage from "../pages/student/Profile";
import StudentLibraryPage from "../pages/student/Library";
import StudentLinksRegistrationPage from "../pages/student/LinksRegistration";
import StudentFeedbackPage from "../pages/student/Feedback";
import StudentPlacementPage from "../pages/student/Placement";
import StudentComplaintsPage from "../pages/student/Complaints";
import StudentTimetablePage from "../pages/student/Timetable";
import StudentStudyMaterialsPage from "../pages/student/StudyMaterials";
import StudentAlertsPage from "../pages/student/Alerts";
import StudentNoticeBoardPage from "../pages/student/NoticeBoard";
import StudentLeavesListPage from "../pages/student/LeavesList";
import StudentLeaveApplyPage from "../pages/student/LeaveApply";
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherStudentsPage from "../pages/teacher/Students";
import TeacherAttendancePage from "../pages/teacher/Attendance";
import TeacherHomeworkPage from "../pages/teacher/Homework";
import TeacherExamsMarksPage from "../pages/teacher/ExamsMarks";
import TeacherTimetablePage from "../pages/teacher/Timetable";
import TeacherCommunicationPage from "../pages/teacher/Communication";
import TeacherAnnouncementsPage from "../pages/teacher/Announcements";
import TeacherStudyMaterialPage from "../pages/teacher/StudyMaterial";
import TeacherPerformancePage from "../pages/teacher/Performance";
import TeacherLeavesPage from "../pages/teacher/Leaves";
import TeacherDiaryPage from "../pages/teacher/Diary";
import TeacherOnlineClassesPage from "../pages/teacher/OnlineClasses";
import TeacherDoubtsPage from "../pages/teacher/Doubts";
import TeacherNotificationsPage from "../pages/teacher/Notifications";
import TeacherProfilePage from "../pages/teacher/Profile";
import TeacherSalaryPage from "../pages/teacher/Salary";
import TeacherActivitiesPage from "../pages/teacher/Activities";
import TeacherStudentLeavesPage from "../pages/teacher/StudentLeaves";

function HomeRoute() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={getRoleHome(user?.role)} replace />;
  return <HomePage />;
}

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-900">Unauthorized</h2>
        <p className="mt-2 text-gray-600">You do not have access to this page.</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-900">404</h2>
        <p className="mt-2 text-gray-600">Page not found.</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<MarketingShell />}>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/advantages" element={<AdvantagesPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[roles.SUPER_ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/create-school" element={<CreateSchoolPage />} />
          <Route path="/super-admin/create-school-admin" element={<CreateSchoolAdminPage />} />
          <Route path="/super-admin/schools" element={<SchoolsListPage />} />
          <Route path="/super-admin/schools/:schoolId" element={<SchoolViewPage />} />
          <Route path="/super-admin/plans" element={<PlansPage />} />
          <Route path="/super-admin/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/super-admin/payments" element={<PaymentsPage />} />
          <Route path="/super-admin/security-dashboard" element={<SecurityDashboardPage />} />
          <Route path="/super-admin/login-activity" element={<LoginActivityPage />} />
          <Route path="/super-admin/blocked-schools" element={<BlockedSchoolsPage />} />
          <Route path="/super-admin/global-announcement" element={<GlobalAnnouncementPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[roles.SCHOOL_ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudentManagementLayout />}>
            <Route index element={<Navigate to="enrol" replace />} />
            <Route path="enrol" element={<CreateStudentPage />} />
            <Route path="registered" element={<RegisteredStudentsPage />} />
          </Route>
          <Route path="/admin/create-student" element={<Navigate to="/admin/students/enrol" replace />} />
          <Route path="/admin/teachers" element={<AdminTeacherManagementLayout />}>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<CreateTeacherPage />} />
            <Route path="registered" element={<RegisteredTeachersPage />} />
          </Route>
          <Route path="/admin/create-teacher" element={<Navigate to="/admin/teachers/create" replace />} />
          <Route path="/admin/classes" element={<AdminClassManagementLayout />}>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<CreateClassPage />} />
            <Route path="registered" element={<RegisteredClassesPage />} />
          </Route>
          <Route path="/admin/create-class" element={<Navigate to="/admin/classes/create" replace />} />
          <Route path="/admin/subjects" element={<AdminSubjectManagementLayout />}>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<SubjectManagementPage />} />
            <Route path="registered" element={<RegisteredSubjectsPage />} />
          </Route>
          <Route path="/admin/attendance" element={<AttendanceManagementPage />} />
          <Route path="/admin/fees" element={<FeesManagementPage />} />
          <Route path="/admin/exams-results" element={<AdminExamManagementLayout />}>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<ExamsResultsManagementPage />} />
            <Route path="registered" element={<RegisteredExamsPage />} />
          </Route>
          <Route path="/admin/timetable" element={<AdminTimetableManagementLayout />}>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<TimetableManagementPage />} />
            <Route path="registered" element={<RegisteredTimetablePage />} />
          </Route>
          <Route
            path="/admin/homework"
            element={<ModulePlaceholder title="Homework / Assignments" description="Assign homework, upload files and track student submissions." />}
          />
          <Route
            path="/admin/library"
            element={<ModulePlaceholder title="Library Management" description="Add books, issue/return flow and fines tracking." />}
          />
          <Route path="/admin/transport" element={<AdminTransportManagementLayout />}>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<TransportManagementPage />} />
            <Route path="registered" element={<RegisteredTransportPage />} />
          </Route>
          <Route
            path="/admin/hostel"
            element={<ModulePlaceholder title="Hostel Management" description="Room allocation and hostel student assignment." />}
          />
          <Route
            path="/admin/staff"
            element={<ModulePlaceholder title="Staff Management" description="Manage non-teaching staff like clerk/peon and other operational roles." />}
          />
          <Route
            path="/admin/communication"
            element={<ModulePlaceholder title="Communication System" description="Send announcements and integrate SMS/Email/WhatsApp workflows." />}
          />
          <Route
            path="/admin/reports"
            element={<ModulePlaceholder title="Reports & Analytics" description="Attendance, fee and performance reports with export capabilities." />}
          />
          <Route
            path="/admin/settings"
            element={<ModulePlaceholder title="Settings" description="School profile, branding, theme and password/security settings." />}
          />
          <Route
            path="/admin/roles"
            element={<ModulePlaceholder title="Roles & Permissions" description="Create sub-admin roles and assign granular permissions." />}
          />
          <Route
            path="/admin/notifications"
            element={<ModulePlaceholder title="Notifications" description="Real-time notifications and alert center for admin users." />}
          />
          <Route
            path="/admin/files"
            element={<ModulePlaceholder title="File Management" description="Upload and manage student/teacher documents centrally." />}
          />
          <Route
            path="/admin/security"
            element={<ModulePlaceholder title="Security" description="JWT, RBAC, IP policies and tenant-level access control operations." />}
          />
          <Route path="/admin/notices" element={<AdminNoticeManagementLayout />}>
            <Route index element={<Navigate to="create" replace />} />
            <Route path="create" element={<NoticeManagementPage />} />
            <Route path="registered" element={<RegisteredNoticesPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[roles.STUDENT]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/alerts" element={<StudentAlertsPage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/library" element={<StudentLibraryPage />} />
          <Route path="/student/links-registration" element={<StudentLinksRegistrationPage />} />
          <Route path="/student/feedback" element={<StudentFeedbackPage />} />
          <Route path="/student/placement" element={<StudentPlacementPage />} />
          <Route path="/student/complaints" element={<StudentComplaintsPage />} />
          <Route path="/student/result" element={<StudentResultPage />} />
          <Route path="/student/fees" element={<StudentFeesPage />} />
          <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          <Route path="/student/notices" element={<StudentNoticesPage />} />
          <Route path="/student/notice-board" element={<StudentNoticeBoardPage />} />
          <Route path="/student/admit-card" element={<StudentAdmitCardPage />} />
          <Route path="/student/timetable" element={<StudentTimetablePage />} />
          <Route path="/student/study-materials" element={<StudentStudyMaterialsPage />} />
          <Route path="/student/leaves" element={<StudentLeavesListPage />} />
          <Route path="/student/leaves/apply" element={<StudentLeaveApplyPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[roles.TEACHER]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/students" element={<TeacherStudentsPage />} />
          <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
          <Route path="/teacher/homework" element={<TeacherHomeworkPage />} />
          <Route path="/teacher/exams-marks" element={<TeacherExamsMarksPage />} />
          <Route path="/teacher/timetable" element={<TeacherTimetablePage />} />
          <Route path="/teacher/communication" element={<TeacherCommunicationPage />} />
          <Route path="/teacher/announcements" element={<TeacherAnnouncementsPage />} />
          <Route path="/teacher/study-material" element={<TeacherStudyMaterialPage />} />
          <Route path="/teacher/performance" element={<TeacherPerformancePage />} />
          <Route path="/teacher/leaves" element={<TeacherLeavesPage />} />
          <Route path="/teacher/student-leaves" element={<TeacherStudentLeavesPage />} />
          <Route path="/teacher/diary" element={<TeacherDiaryPage />} />
          <Route path="/teacher/online-classes" element={<TeacherOnlineClassesPage />} />
          <Route path="/teacher/doubts" element={<TeacherDoubtsPage />} />
          <Route path="/teacher/notifications" element={<TeacherNotificationsPage />} />
          <Route path="/teacher/profile" element={<TeacherProfilePage />} />
          <Route path="/teacher/salary" element={<TeacherSalaryPage />} />
          <Route path="/teacher/activities" element={<TeacherActivitiesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
