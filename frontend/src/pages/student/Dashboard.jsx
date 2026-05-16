import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  IndianRupee,
  User,
  CalendarOff,
  CalendarCheck2,
} from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { PageHeader, GlassStat, PageCard, EmptyState, btnPrimary, btnSecondary } from "./studentPageUi";

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
  if (!data) return <p className="text-sm text-slate-500">No dashboard data available.</p>;

  return (
    <div className="space-y-6">
      <PageHeader badge="Overview" title="Student dashboard" subtitle="Your academic snapshot at a glance." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassStat
          icon={CalendarCheck}
          label="Attendance"
          value={`${data.attendanceSummary?.percentage || 0}%`}
          sub={`${data.attendanceSummary?.presentDays || 0}/${data.attendanceSummary?.totalDays || 0} present`}
          gradient="from-brand-600 to-indigo-600"
        />
        <GlassStat
          icon={IndianRupee}
          label="Fees pending"
          value={`₹${data.feeSummary?.pending || 0}`}
          sub={`Paid ₹${data.feeSummary?.paid || 0}`}
          gradient="from-emerald-600 to-teal-600"
        />
        <GlassStat
          icon={BookOpen}
          label="Assignments"
          value={data.assignments?.length || 0}
          sub="Upcoming and active tasks"
          gradient="from-violet-600 to-purple-600"
        />
        <GlassStat
          icon={Bell}
          label="Latest notices"
          value={data.latestNotices?.length || 0}
          sub="Important announcements"
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassStat
          icon={CalendarOff}
          label="Leave — pending"
          value={data.leaveSummary?.pending ?? 0}
          sub="Awaiting class teacher"
          gradient="from-amber-500 to-orange-500"
        />
        <GlassStat
          icon={CalendarCheck2}
          label="Leave — approved"
          value={data.leaveSummary?.approved ?? 0}
          sub="This academic year"
          gradient="from-emerald-600 to-teal-600"
        />
        <PageCard title="Leave notifications" subtitle="Approvals and rejections also appear under Alerts.">
          <div className="flex flex-wrap gap-2">
            <Link to="/student/leaves" className={btnSecondary}>
              View requests
            </Link>
            <Link to="/student/leaves/apply" className={btnPrimary}>
              Apply leave
            </Link>
          </div>
        </PageCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PageCard title="Student profile" subtitle="Your enrolment details." icon={User}>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-slate-700">Name:</span> {data.student?.name}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Email:</span> {data.student?.email}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Roll no:</span> {data.student?.rollNumber}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Section:</span> {data.student?.section}
            </p>
          </div>
        </PageCard>

        <PageCard title="Latest notices" subtitle="Recent announcements." icon={Bell}>
          {(data.latestNotices || []).length ? (
            <div className="space-y-2">
              {data.latestNotices.map((notice) => (
                <div key={notice._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="font-semibold text-slate-900">{notice.title}</p>
                  <p className="text-sm text-slate-600">{notice.description || notice.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Bell} title="No notices" message="Check back later for updates." />
          )}
        </PageCard>

        <PageCard title="Assignments" subtitle="Upcoming homework." icon={BookOpen}>
          {(data.assignments || []).length ? (
            <div className="space-y-2">
              {data.assignments.map((assignment) => (
                <div key={assignment._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                  <p className="font-semibold text-slate-900">{assignment.title}</p>
                  <p className="text-sm text-slate-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="No assignments" message="You're all caught up." />
          )}
        </PageCard>
      </div>
    </div>
  );
}

export default StudentDashboard;
