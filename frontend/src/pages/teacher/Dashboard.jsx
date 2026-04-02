import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import StatCard from "../../components/StatCard";
import Loader from "../../components/Loader";
import { teacherService } from "../../services/teacherService";

function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await teacherService.getDashboard();
        setData(response);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <Loader text="Loading teacher dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          Welcome {data?.profile?.name || "Teacher"} ({data?.profile?.email || "-"})
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Assigned Classes" value={data?.assignedClasses || 0} subtitle="Your class allocations" />
        <StatCard title="Total Students" value={data?.totalStudents || 0} subtitle="In your assigned classes" />
        <StatCard title="Pending Homework" value={data?.pendingHomeworkCount || 0} subtitle="Open assignments" />
        <StatCard
          title="Attendance Summary"
          value={`${data?.attendanceSummary?.todayCount || 0}/${data?.attendanceSummary?.monthlyCount || 0}`}
          subtitle="Today / Monthly records"
        />
      </div>

      <div className="card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Student leave requests (class teacher)</h3>
            <p className="text-sm text-gray-600">Approve or reject leaves from students in your homeroom class.</p>
          </div>
          <Link to="/teacher/student-leaves" className="btn-primary w-fit text-sm">
            Open approvals
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <StatCard title="Total" value={data?.studentLeaveStats?.total ?? 0} subtitle="All requests" />
          <StatCard title="Pending" value={data?.studentLeaveStats?.pending ?? 0} subtitle="Needs action" />
          <StatCard title="Approved" value={data?.studentLeaveStats?.approved ?? 0} subtitle="Approved by you" />
          <StatCard title="Rejected" value={data?.studentLeaveStats?.rejected ?? 0} subtitle="Rejected by you" />
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-800">Pending queue</h4>
          <div className="mt-2 space-y-2 text-sm">
            {(data?.pendingStudentLeaves || []).map((item) => (
              <div key={item._id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-100 bg-gray-50 px-3 py-2">
                <span>
                  <span className="font-medium">{item.studentId?.userId?.name || "Student"}</span>
                  <span className="text-gray-600">
                    {" "}
                    · {item.leaveType} · {item.leaveDisplayId}
                  </span>
                </span>
                <span className="text-gray-500">
                  {new Date(item.fromDate).toLocaleDateString()} – {new Date(item.toDate).toLocaleDateString()}
                </span>
              </div>
            ))}
            {!data?.pendingStudentLeaves?.length && <p className="text-gray-500">No pending student leaves.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Timetable</h3>
          <div className="mt-3 space-y-2 text-sm">
            {(data?.todayTimetable || []).map((item) => (
              <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                {item.subject} | {item.classId?.name}-{item.section} | {item.startTime}-{item.endTime}
              </div>
            ))}
            {!data?.todayTimetable?.length && <div className="text-gray-500">No classes scheduled for today.</div>}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Exams</h3>
          <div className="mt-3 space-y-2 text-sm">
            {(data?.upcomingExams || []).map((item) => (
              <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                {item.title} | {item.classId?.name}-{item.section} | {new Date(item.examDate).toLocaleDateString()}
              </div>
            ))}
            {!data?.upcomingExams?.length && <div className="text-gray-500">No upcoming exams.</div>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Recent Announcements</h3>
          <div className="mt-3 space-y-2 text-sm">
            {(data?.recentAnnouncements || []).map((item) => (
              <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-gray-600">{item.message}</div>
              </div>
            ))}
            {!data?.recentAnnouncements?.length && <div className="text-gray-500">No announcements.</div>}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <div className="mt-3 space-y-2 text-sm">
            {(data?.recentActivities || []).map((item) => (
              <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                <div className="font-medium text-gray-900">{item.action}</div>
                <div className="text-gray-600">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {!data?.recentActivities?.length && <div className="text-gray-500">No activity yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
