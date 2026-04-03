import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Sparkles,
  UsersRound,
  Clock,
  FileText,
  ArrowRight,
  CalendarRange,
  Activity,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import Loader from "../../components/Loader";
import { teacherService } from "../../services/teacherService";

function SectionCard({ icon: Icon, title, subtitle, children, accent = "brand" }) {
  const headers = {
    brand: "from-brand-500/15 via-brand-50/30 to-transparent text-brand-700 ring-brand-100/80",
    violet: "from-violet-500/15 via-violet-50/30 to-transparent text-violet-700 ring-violet-100/80",
    demo: "from-cyan-500/15 via-cyan-50/30 to-transparent text-demo-600 ring-cyan-100/80",
    amber: "from-amber-500/15 via-amber-50/30 to-transparent text-amber-800 ring-amber-100/80",
    emerald: "from-emerald-500/15 via-emerald-50/30 to-transparent text-emerald-700 ring-emerald-100/80",
  };
  const h = headers[accent] || headers.brand;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-md shadow-gray-900/[0.04] ring-1 ring-gray-100/90 transition hover:shadow-lg hover:shadow-brand-500/[0.06]">
      <div className={`border-b border-gray-100/90 bg-gradient-to-r px-5 py-4 ring-1 ring-inset ${h}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-sm ring-1 ring-gray-100">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ListRow({ children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-100 bg-gradient-to-r from-slate-50/80 to-white hover:border-brand-200/50 hover:from-brand-50/40",
    violet: "border-violet-100/80 bg-gradient-to-r from-violet-50/50 to-white hover:border-violet-200/60",
    cyan: "border-cyan-100/80 bg-gradient-to-r from-cyan-50/50 to-white hover:border-cyan-200/60",
    amber: "border-amber-100/80 bg-gradient-to-r from-amber-50/40 to-white hover:border-amber-200/60",
    emerald: "border-emerald-100/80 bg-gradient-to-r from-emerald-50/40 to-white hover:border-emerald-200/60",
  };
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm transition ${tones[tone] || tones.slate}`}
    >
      {children}
    </div>
  );
}

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

  const teacherName = data?.profile?.name || "Teacher";

  return (
    <div className="space-y-8 pb-2">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-brand-900 to-[#0c4a6e] px-6 py-8 text-white shadow-xl shadow-brand-900/20 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-demo-400/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-violet-400/15 blur-2xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200/95 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Teacher workspace
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-white via-cyan-100 to-demo-300 bg-clip-text text-transparent">
                {teacherName}
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Your classes, attendance, and assignments in one vibrant hub—stay on top of today&apos;s
              periods and what needs your attention next.
            </p>
            <p className="mt-2 text-sm text-white/65">
              <span className="font-medium text-white/90">{data?.profile?.email || "—"}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to="/teacher/attendance"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden />
              Mark attendance
            </Link>
            <Link
              to="/teacher/homework"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-demo-500 to-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-900/30 transition hover:from-demo-400 hover:to-cyan-300"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Homework
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="brand"
          icon={<LayoutGrid className="h-5 w-5" strokeWidth={1.75} />}
          title="Assigned classes"
          value={data?.assignedClasses || 0}
          subtitle="Your class allocations"
        />
        <StatCard
          accent="violet"
          icon={<UsersRound className="h-5 w-5" strokeWidth={1.75} />}
          title="Total students"
          value={data?.totalStudents || 0}
          subtitle="Across your assigned classes"
        />
        <StatCard
          accent="amber"
          icon={<BookOpen className="h-5 w-5" strokeWidth={1.75} />}
          title="Pending homework"
          value={data?.pendingHomeworkCount || 0}
          subtitle="Open assignments"
        />
        <StatCard
          accent="demo"
          icon={<ClipboardCheck className="h-5 w-5" strokeWidth={1.75} />}
          title="Attendance"
          value={`${data?.attendanceSummary?.todayCount || 0} / ${data?.attendanceSummary?.monthlyCount || 0}`}
          subtitle="Today · monthly records"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 p-5 shadow-lg shadow-amber-500/10 ring-1 ring-amber-100/50 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-600/25">
              <CalendarRange className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Student leave requests</h2>
              <p className="mt-0.5 text-sm text-gray-600">
                Class teacher approvals—pending items need your action.
              </p>
            </div>
          </div>
          <Link
            to="/teacher/student-leaves"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-600/25 transition hover:from-amber-600 hover:to-orange-600"
          >
            Open approvals
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accent="sky"
            title="Total"
            value={data?.studentLeaveStats?.total ?? 0}
            subtitle="All requests"
          />
          <StatCard
            accent="amber"
            title="Pending"
            value={data?.studentLeaveStats?.pending ?? 0}
            subtitle="Needs action"
          />
          <StatCard
            accent="emerald"
            title="Approved"
            value={data?.studentLeaveStats?.approved ?? 0}
            subtitle="Approved by you"
          />
          <StatCard
            accent="rose"
            title="Rejected"
            value={data?.studentLeaveStats?.rejected ?? 0}
            subtitle="Rejected by you"
          />
        </div>

        <div className="mt-6 rounded-xl border border-amber-100/80 bg-white/70 p-4 backdrop-blur-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Clock className="h-4 w-4 text-amber-600" aria-hidden />
            Pending queue
          </h4>
          <div className="mt-3 space-y-2">
            {(data?.pendingStudentLeaves || []).map((item) => (
              <ListRow key={item._id} tone="amber">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="font-semibold text-gray-900">{item.studentId?.userId?.name || "Student"}</span>
                    <span className="text-gray-600">
                      {" "}
                      · {item.leaveType} · {item.leaveDisplayId}
                    </span>
                  </span>
                  <span className="rounded-lg bg-white/80 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200/60">
                    {new Date(item.fromDate).toLocaleDateString()} – {new Date(item.toDate).toLocaleDateString()}
                  </span>
                </div>
              </ListRow>
            ))}
            {!data?.pendingStudentLeaves?.length && (
              <p className="rounded-lg border border-dashed border-amber-200/80 bg-amber-50/50 py-6 text-center text-sm text-amber-900/70">
                No pending student leaves—great job staying current.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard icon={CalendarDays} title="Today's timetable" subtitle="Periods scheduled for today" accent="demo">
          <div className="space-y-2">
            {(data?.todayTimetable || []).map((item) => (
              <ListRow key={item._id} tone="cyan">
                <div className="flex flex-wrap items-center justify-between gap-2 font-medium text-gray-900">
                  <span className="flex items-center gap-2">
                    <span className="rounded-lg bg-cyan-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-cyan-800">
                      {item.startTime}–{item.endTime}
                    </span>
                    {item.subject}
                  </span>
                  <span className="text-sm font-normal text-gray-600">
                    {item.classId?.name}-{item.section}
                  </span>
                </div>
              </ListRow>
            ))}
            {!data?.todayTimetable?.length && (
              <p className="rounded-xl border border-dashed border-cyan-200/70 bg-cyan-50/40 py-8 text-center text-sm text-cyan-900/70">
                No classes scheduled for today—enjoy the breathing room.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard icon={GraduationCap} title="Upcoming exams" subtitle="Next assessments on your calendar" accent="violet">
          <div className="space-y-2">
            {(data?.upcomingExams || []).map((item) => (
              <ListRow key={item._id} tone="violet">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900">{item.title}</span>
                  <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-200/60">
                    {new Date(item.examDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {item.classId?.name}-{item.section}
                </p>
              </ListRow>
            ))}
            {!data?.upcomingExams?.length && (
              <p className="rounded-xl border border-dashed border-violet-200/70 bg-violet-50/40 py-8 text-center text-sm text-violet-900/70">
                No upcoming exams in the pipeline.
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard icon={Megaphone} title="Recent announcements" subtitle="Messages from your school" accent="brand">
          <div className="space-y-3">
            {(data?.recentAnnouncements || []).map((item) => (
              <ListRow key={item._id} tone="slate">
                <div className="font-semibold text-gray-900">{item.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.message}</p>
              </ListRow>
            ))}
            {!data?.recentAnnouncements?.length && (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-8 text-center text-sm text-gray-500">
                No announcements yet.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard icon={Activity} title="Recent activities" subtitle="Your latest actions in the ERP" accent="emerald">
          <div className="space-y-2">
            {(data?.recentActivities || []).map((item) => (
              <ListRow key={item._id} tone="emerald">
                <div className="font-semibold text-gray-900">{item.action}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <FileText className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </ListRow>
            ))}
            {!data?.recentActivities?.length && (
              <p className="rounded-xl border border-dashed border-emerald-200/70 bg-emerald-50/40 py-8 text-center text-sm text-emerald-900/70">
                No activity yet—your trail will appear here.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default TeacherDashboard;
