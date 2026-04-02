import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <Sidebar role={user?.role} />
      <div className="h-full md:pl-64">
        <Navbar />
        <main className="h-screen overflow-y-auto px-4 pb-4 pt-20 md:px-6 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
