import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { roles } from "../utils/roleUtils";
import GlobalAnnouncementBanner from "../components/GlobalAnnouncementBanner";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const SCHOOL_PORTAL_ROLES = [roles.SCHOOL_ADMIN, roles.TEACHER, roles.STUDENT];

function DashboardLayout() {
  const { user } = useAuth();
  const showGlobalBanner = SCHOOL_PORTAL_ROLES.includes(user?.role);

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <Sidebar role={user?.role} />
      <div className="h-full md:pl-64">
        <Navbar />
        <main className="h-screen overflow-y-auto px-4 pb-4 pt-20 md:px-6 md:pb-6">
          {showGlobalBanner ? <GlobalAnnouncementBanner /> : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
