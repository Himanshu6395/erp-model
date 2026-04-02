import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaShieldAlt, FaLock, FaUnlock, FaUserSlash } from "react-icons/fa";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function SecurityDashboardPage() {
  const [stats, setStats] = useState(null);
  const [schoolId, setSchoolId] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    try {
      setStats(await superAdminOpsService.getSecurityDashboard());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const block = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.blockSchool(schoolId, reason);
      toast.success("School blocked");
      setReason("");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const unblock = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.unblockSchool(schoolId);
      toast.success("School unblocked");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const disableLogin = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.setSchoolLoginAccess(schoolId, false);
      toast.success("Login disabled");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const enableLogin = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.setSchoolLoginAccess(schoolId, true);
      toast.success("Login enabled");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const forceLogout = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.forceLogoutSchoolUsers(schoolId);
      toast.success("Force logout triggered");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-800">Security Dashboard</h2>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Active Schools</p>
            <h3 className="text-2xl font-bold">{stats?.activeSchools || 0}</h3>
          </div>
          <div className="bg-green-100 text-green-600 p-3 rounded-xl">
            <FaShieldAlt />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Blocked Schools</p>
            <h3 className="text-2xl font-bold">{stats?.blockedSchools || 0}</h3>
          </div>
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
            <FaLock />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Failed Logins (24h)</p>
            <h3 className="text-2xl font-bold">{stats?.failedLoginAttempts || 0}</h3>
          </div>
          <div className="bg-red-100 text-red-600 p-3 rounded-xl">
            <FaUserSlash />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Sessions</p>
            <h3 className="text-2xl font-bold">{stats?.totalSessions || 0}</h3>
          </div>
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <FaShieldAlt />
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">

        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="School ID"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
          />

          <input
            className="border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Block reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex flex-wrap gap-3">

          <button onClick={block} className="px-4 py-2 rounded-xl border hover:bg-gray-50">
            Block School
          </button>

          <button onClick={unblock} className="px-4 py-2 rounded-xl border hover:bg-gray-50">
            Unblock School
          </button>

          <button onClick={disableLogin} className="px-4 py-2 rounded-xl border hover:bg-gray-50">
            Disable Login
          </button>

          <button onClick={enableLogin} className="px-4 py-2 rounded-xl border hover:bg-gray-50">
            Enable Login
          </button>

          <button
            onClick={forceLogout}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
          >
            Force Logout Users
          </button>

        </div>

      </div>

    </div>
  );
}

export default SecurityDashboardPage;