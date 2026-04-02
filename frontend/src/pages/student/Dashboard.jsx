import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaBell, FaBookOpen, FaMoneyCheckAlt, FaUserGraduate } from "react-icons/fa";
import { MdEventBusy, MdOutlineEventAvailable } from "react-icons/md";
import Loader from "../../components/Loader";
import StatCard from "../../components/StatCard";
import { studentService } from "../../services/studentService";

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await studentService.getDashboard();
        setData(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loader text="Loading student dashboard..." />;
  if (!data) return <p className="text-sm text-gray-500">No dashboard data available.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<MdOutlineEventAvailable />}
          title="Attendance"
          value={`${data.attendanceSummary?.percentage || 0}%`}
          subtitle={`${data.attendanceSummary?.presentDays || 0}/${data.attendanceSummary?.totalDays || 0} present`}
        />
        <StatCard
          icon={<FaMoneyCheckAlt />}
          title="Fees Pending"
          value={`₹${data.feeSummary?.pending || 0}`}
          subtitle={`Paid ₹${data.feeSummary?.paid || 0}`}
        />
        <StatCard icon={<FaBookOpen />} title="Assignments" value={data.assignments?.length || 0} subtitle="Upcoming and active tasks" />
        <StatCard icon={<FaBell />} title="Latest Notices" value={data.latestNotices?.length || 0} subtitle="Important announcements" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<MdEventBusy />}
          title="Leave — pending"
          value={data.leaveSummary?.pending ?? 0}
          subtitle="Awaiting class teacher"
        />
        <StatCard
          icon={<MdEventBusy />}
          title="Leave — approved"
          value={data.leaveSummary?.approved ?? 0}
          subtitle="This academic year (all time in app)"
        />
        <div className="card flex flex-col justify-center gap-2">
          <p className="text-sm font-semibold text-gray-700">Leave notifications</p>
          <p className="text-sm text-gray-600">Approvals and rejections also appear under Alerts with type leave status.</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/student/leaves" className="btn-secondary text-sm">
              View requests
            </Link>
            <Link to="/student/leaves/apply" className="btn-primary text-sm">
              Apply leave
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <FaUserGraduate className="text-brand-600" />
            Student Profile
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Name:</span> {data.student?.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {data.student?.email}
            </p>
            <p>
              <span className="font-semibold">Roll No:</span> {data.student?.rollNumber}
            </p>
            <p>
              <span className="font-semibold">Section:</span> {data.student?.section}
            </p>
          </div>
        </div>

        <div className="card lg:col-span-1">
          <h3 className="mb-3 text-lg font-semibold">Latest Notices</h3>
          <div className="space-y-2">
            {(data.latestNotices || []).map((notice) => (
              <div key={notice._id} className="rounded-lg border border-gray-100 p-3">
                <p className="font-semibold text-gray-900">{notice.title}</p>
                <p className="text-sm text-gray-600">{notice.description || notice.message}</p>
              </div>
            ))}
            {!data.latestNotices?.length && <p className="text-sm text-gray-500">No notices</p>}
          </div>
        </div>

        <div className="card lg:col-span-1">
          <h3 className="mb-3 text-lg font-semibold">Assignments</h3>
          <div className="space-y-2">
            {(data.assignments || []).map((assignment) => (
              <div key={assignment._id} className="rounded-lg border border-gray-100 p-3">
                <p className="font-semibold text-gray-900">{assignment.title}</p>
                <p className="text-sm text-gray-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
            {!data.assignments?.length && <p className="text-sm text-gray-500">No assignments</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
