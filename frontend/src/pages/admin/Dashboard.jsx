import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { MdClass, MdNotifications, MdReceipt, MdFactCheck, MdPendingActions, MdWarning } from "react-icons/md";
import StatCard from "../../components/StatCard";
import Loader from "../../components/Loader";
import { adminService } from "../../services/adminService";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await adminService.getDashboard();
        setDashboard(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">School Admin Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={<FaUserGraduate />} title="Total Students" value={dashboard?.totalStudents || 0} subtitle="Current school data only" />
        <StatCard icon={<FaChalkboardTeacher />} title="Total Teachers" value={dashboard?.totalTeachers || 0} subtitle="Current school data only" />
        <StatCard icon={<MdClass />} title="Total Classes" value={dashboard?.totalClasses || 0} subtitle="Class & section count" />
        <StatCard
          icon={<MdFactCheck />}
          title="Attendance Summary"
          value={dashboard?.attendanceSummary?.markedRecordsThisMonth || 0}
          subtitle="Marked records this month"
        />
        <StatCard
          icon={<MdReceipt />}
          title="Fee Collection"
          value={`₹${Number(dashboard?.feeCollectionSummary?.collectedThisMonth || 0).toLocaleString()}`}
          subtitle="Collected this month"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<MdReceipt />}
          title="Total fees generated"
          value={`₹${Number(dashboard?.feeCollectionSummary?.totalFeesGenerated || 0).toLocaleString()}`}
          subtitle="All assigned packages"
        />
        <StatCard
          icon={<MdReceipt />}
          title="Total collected"
          value={`₹${Number(dashboard?.feeCollectionSummary?.totalCollected || 0).toLocaleString()}`}
          subtitle="Lifetime payments"
        />
        <StatCard
          icon={<MdPendingActions />}
          title="Pending"
          value={`₹${Number(dashboard?.feeCollectionSummary?.pendingAmount || 0).toLocaleString()}`}
          subtitle="Outstanding balance"
        />
        <StatCard
          icon={<MdWarning />}
          title="Overdue records"
          value={dashboard?.feeCollectionSummary?.overdueRecords ?? 0}
          subtitle="Assignments marked overdue"
        />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MdNotifications />
          Recent Activities
        </div>
        <div className="space-y-3 text-sm">
          {(dashboard?.recentActivities || []).map((activity) => (
            <div key={activity._id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <div className="font-medium text-gray-900">
                {activity.action} {activity.entityType}
              </div>
              <div className="text-gray-500">{new Date(activity.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {!dashboard?.recentActivities?.length && <div className="text-gray-500">No activity yet.</div>}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
