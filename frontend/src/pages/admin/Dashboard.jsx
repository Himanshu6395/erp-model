import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Banknote,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Palette,
  Receipt,
  School,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/useAuth";
import { adminService } from "../../services/adminService";

const QUICK_LINKS = [
  {
    to: "/admin/students",
    label: "Students",
    hint: "Enrolment & records",
    icon: GraduationCap,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/30",
  },
  {
    to: "/admin/create-teacher",
    label: "Teachers",
    hint: "Staff directory",
    icon: UserRound,
    gradient: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-500/25",
  },
  {
    to: "/admin/create-class",
    label: "Classes",
    hint: "Structure & sections",
    icon: LayoutGrid,
    gradient: "from-teal-500 to-emerald-600",
    shadow: "shadow-teal-500/25",
  },
  {
    to: "/admin/attendance",
    label: "Attendance",
    hint: "Marking & reports",
    icon: ClipboardList,
    gradient: "from-lime-500 to-green-600",
    shadow: "shadow-lime-500/20",
  },
  {
    to: "/admin/fees",
    label: "Fees",
    hint: "Collection & dues",
    icon: Wallet,
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/25",
  },
  {
    to: "/admin/timetable",
    label: "Timetable",
    hint: "Periods & rooms",
    icon: CalendarDays,
    gradient: "from-fuchsia-500 to-pink-600",
    shadow: "shadow-fuchsia-500/25",
  },
  {
    to: "/admin/notices",
    label: "Notices",
    hint: "School communications",
    icon: Megaphone,
    gradient: "from-rose-500 to-red-600",
    shadow: "shadow-rose-500/20",
  },
  {
    to: "/admin/subjects",
    label: "Subjects",
    hint: "Curriculum setup",
    icon: BookOpen,
    gradient: "from-cyan-500 to-teal-600",
    shadow: "shadow-cyan-500/25",
  },
  {
    to: "/admin/exams-results",
    label: "Exams & results",
    hint: "Sessions & marks",
    icon: FileBarChart,
    gradient: "from-indigo-500 to-violet-600",
    shadow: "shadow-indigo-500/25",
  },
];

function formatCurrency(n) {
  const v = Number(n || 0);
  return `₹${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function activityLabel(action, entityType) {
  const a = (action || "").toString();
  const e = (entityType || "").toString().replace(/_/g, " ").toLowerCase();
  if (!a && !e) return "Activity";
  return `${a} ${e}`.trim();
}

function actionTone(action) {
  const a = (action || "").toUpperCase();
  if (a.includes("DELETE")) return "bg-rose-100 text-rose-800 ring-rose-200/70";
  if (a.includes("CREATE") || a.includes("IMPORT")) return "bg-emerald-100 text-emerald-800 ring-emerald-200/70";
  if (a.includes("UPDATE") || a.includes("PATCH")) return "bg-sky-100 text-sky-800 ring-sky-200/70";
  return "bg-violet-100 text-violet-800 ring-violet-200/70";
}

function noticePriorityClass(p) {
  if (p === "HIGH") return "bg-rose-500/15 text-rose-800 ring-rose-200/60";
  if (p === "LOW") return "bg-slate-100 text-slate-600 ring-slate-200/80";
  return "bg-amber-500/15 text-amber-900 ring-amber-200/60";
}

function MetricCard({ icon: Icon, title, value, subtitle, gradient, borderClass }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${borderClass}`}
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl transition group-hover:opacity-60 bg-gradient-to-br ${gradient}`}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ring-2 ring-white/30 ${gradient}`}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
          {subtitle ? <p className="mt-1 text-xs leading-snug text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [notices, setNotices] = useState([]);
  const [noticeTotal, setNoticeTotal] = useState(0);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const settled = await Promise.allSettled([
        adminService.getDashboard(),
        adminService.getSubjects(),
        adminService.listNotices({ status: "PUBLISHED" }),
        adminService.listExamSessions(),
      ]);

      if (settled[0].status === "fulfilled") setDashboard(settled[0].value);
      else {
        toast.error(settled[0].reason?.message || "Could not load dashboard");
        setDashboard(null);
      }

      if (settled[1].status === "fulfilled") setSubjects(Array.isArray(settled[1].value) ? settled[1].value : []);
      else setSubjects([]);

      if (settled[2].status === "fulfilled") {
        const n = settled[2].value;
        const arr = Array.isArray(n) ? n : [];
        setNoticeTotal(arr.length);
        setNotices(arr.slice(0, 5));
      } else {
        setNotices([]);
        setNoticeTotal(0);
      }

      if (settled[3].status === "fulfilled") setExams(Array.isArray(settled[3].value) ? settled[3].value : []);
      else setExams([]);

      setLoading(false);
    };
    run();
  }, []);

  const fees = dashboard?.feeCollectionSummary;
  const collectedMonth = Number(fees?.collectedThisMonth || 0);
  const totalGen = Number(fees?.totalFeesGenerated || 0);
  const totalColl = Number(fees?.totalCollected || 0);
  const pending = Number(fees?.pendingAmount || 0);
  const overdue = fees?.overdueRecords ?? 0;

  const students = dashboard?.totalStudents ?? 0;
  const teachers = dashboard?.totalTeachers ?? 0;
  const classes = dashboard?.totalClasses ?? 0;
  const attMonth = dashboard?.attendanceSummary?.markedRecordsThisMonth ?? 0;

  const collectionRatio = useMemo(() => {
    if (!totalGen || totalGen <= 0) return null;
    return Math.min(100, Math.round((totalColl / totalGen) * 100));
  }, [totalGen, totalColl]);

  const insights = useMemo(() => {
    const ratio =
      teachers > 0 ? `${(students / teachers).toFixed(1)}:1` : students > 0 ? "Add staff" : "—";
    const avgClass = classes > 0 ? (students / classes).toFixed(1) : "—";
    let feeMood = { label: "Balanced", color: "from-teal-500 to-cyan-500", ring: "ring-teal-200/60" };
    if (totalGen > 0 && pending / totalGen > 0.35) {
      feeMood = { label: "Follow up dues", color: "from-amber-500 to-orange-500", ring: "ring-amber-200/60" };
    }
    if (overdue > 5 || (totalGen > 0 && pending / totalGen > 0.55)) {
      feeMood = { label: "Fee focus needed", color: "from-rose-500 to-red-500", ring: "ring-rose-200/60" };
    }
    if (collectionRatio != null && collectionRatio >= 75 && pending / Math.max(totalGen, 1) < 0.2) {
      feeMood = { label: "Strong collections", color: "from-emerald-500 to-green-500", ring: "ring-emerald-200/60" };
    }
    return { ratio, avgClass, feeMood };
  }, [students, teachers, classes, totalGen, pending, overdue, collectionRatio]);

  const feeBar = useMemo(() => {
    const base = Math.max(totalGen, totalColl + pending, 1);
    const wColl = Math.min(100, Math.round((totalColl / base) * 100));
    const wPen = Math.min(100 - wColl, Math.round((pending / base) * 100));
    const wRest = Math.max(0, 100 - wColl - wPen);
    return { wColl, wPen, wRest };
  }, [totalGen, totalColl, pending]);

  if (loading) return <Loader text="Loading your colourful campus overview…" />;

  return (
    <div className="w-full max-w-7xl space-y-8 pb-8">
      {/* Vibrant hero — campus energy, distinct from super-admin indigo */}
      <section className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-600 via-emerald-700 to-cyan-800 px-6 py-9 text-white shadow-2xl shadow-teal-900/30 sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-yellow-400/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-96 rounded-full bg-violet-600/25 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/95 shadow-inner">
              <Sparkles className="h-4 w-4 text-amber-200" strokeWidth={1.75} aria-hidden />
              Campus hub
            </p>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! Here&apos;s your school at a glance
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-teal-50/95">
              People, fees, notices, and exams — colour-coded and quick to scan. Everything here is{" "}
              <span className="font-semibold text-white">your school only</span>.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5 text-amber-200" aria-hidden />
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-teal-100/90">This month</p>
                <p className="text-lg font-bold tabular-nums">{formatCurrency(collectedMonth)}</p>
                <p className="text-xs text-teal-100/80">Fee collection</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/10 px-4 py-3 text-sm font-medium text-white/90 backdrop-blur-sm">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>
      </section>

      {/* Live insights */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className={`flex items-center gap-3 rounded-2xl border border-white/20 bg-gradient-to-br p-4 text-white shadow-lg ring-1 ${insights.feeMood.ring} ${insights.feeMood.color}`}
        >
          <Zap className="h-8 w-8 shrink-0 text-white/90" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/80">Fee pulse</p>
            <p className="text-lg font-bold">{insights.feeMood.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 to-blue-50 p-4 shadow-md ring-1 ring-sky-100/80">
          <Users className="h-8 w-8 shrink-0 text-sky-600" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700/80">Student : teacher</p>
            <p className="text-lg font-bold text-slate-900">{insights.ratio}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 shadow-md ring-1 ring-violet-100/80">
          <School className="h-8 w-8 shrink-0 text-violet-600" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-800/80">Avg per class</p>
            <p className="text-lg font-bold text-slate-900">{insights.avgClass} students</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-md ring-1 ring-amber-100/80">
          <Bell className="h-8 w-8 shrink-0 text-amber-600" strokeWidth={1.75} aria-hidden />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-900/70">Live notices</p>
            <p className="text-lg font-bold text-slate-900">{noticeTotal} published</p>
          </div>
        </div>
      </div>

      {/* Core metrics — bold colour per card */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-fuchsia-600" aria-hidden />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Colour-coded overview</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            icon={GraduationCap}
            title="Students"
            value={students}
            subtitle="Enrolled in your school"
            gradient="from-violet-500 to-purple-700"
            borderClass="border-violet-200/90 ring-1 ring-violet-100/80"
          />
          <MetricCard
            icon={Users}
            title="Teachers"
            value={teachers}
            subtitle="On your staff roster"
            gradient="from-sky-500 to-blue-700"
            borderClass="border-sky-200/90 ring-1 ring-sky-100/80"
          />
          <MetricCard
            icon={LayoutGrid}
            title="Classes"
            value={classes}
            subtitle="Sections you run"
            gradient="from-teal-500 to-emerald-700"
            borderClass="border-teal-200/90 ring-1 ring-teal-100/80"
          />
          <MetricCard
            icon={ClipboardList}
            title="Attendance"
            value={attMonth}
            subtitle="Marks this month"
            gradient="from-lime-500 to-green-700"
            borderClass="border-lime-200/90 ring-1 ring-lime-100/80"
          />
          <MetricCard
            icon={Receipt}
            title="Fees (month)"
            value={formatCurrency(collectedMonth)}
            subtitle="Collected so far"
            gradient="from-amber-500 to-orange-600"
            borderClass="border-amber-200/90 ring-1 ring-amber-100/80"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Finance + spectrum bar */}
        <div className="space-y-6 lg:col-span-7">
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/[0.06] ring-1 ring-slate-100/90">
            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 px-6 py-5 text-white">
              <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%221%22%20cy%3D%221%22%20r%3D%221%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.12%29%22%2F%3E%3C%2Fsvg%3E')] opacity-60" aria-hidden />
              <div className="relative flex flex-wrap items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur">
                  <Banknote className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-bold">Fee spectrum</h3>
                  <p className="text-sm text-white/90">Lifetime position · collection vs outstanding</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6 flex h-4 overflow-hidden rounded-full ring-2 ring-slate-100">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                  style={{ width: `${feeBar.wColl}%` }}
                  title="Collected"
                />
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                  style={{ width: `${feeBar.wPen}%` }}
                  title="Pending"
                />
                <div className="bg-slate-200" style={{ width: `${feeBar.wRest}%` }} title="Remaining" />
              </div>
              <div className="mb-6 flex flex-wrap gap-4 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Collected
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-300" /> Other / unallocated
                </span>
              </div>

              {collectionRatio != null ? (
                <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50/90 p-4">
                  <div className="mb-2 flex justify-between text-xs font-bold text-slate-600">
                    <span>Lifetime collection rate</span>
                    <span className="tabular-nums text-fuchsia-700">{collectionRatio}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-slate-200/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500"
                      style={{ width: `${collectionRatio}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/90 to-white p-4 ring-1 ring-violet-100/60">
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-700/80">Total generated</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{formatCurrency(totalGen)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-white p-4 ring-1 ring-emerald-100/60">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-800/80">Total collected</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-emerald-900">{formatCurrency(totalColl)}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/90 to-white p-4 ring-1 ring-amber-100/60">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-900/80">Pending</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-amber-950">{formatCurrency(pending)}</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/90 to-white p-4 ring-1 ring-rose-100/60">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-800/80">Overdue records</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-rose-900">{overdue}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Link
                  to="/admin/fees"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:from-fuchsia-500 hover:to-violet-500"
                >
                  Open fees
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg ring-1 ring-slate-100/90">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/50 to-cyan-50/40 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Recent activity</h3>
              <p className="text-sm text-slate-600">Latest actions in your school</p>
            </div>
            <div className="divide-y divide-slate-100 p-4 sm:p-5">
              {(dashboard?.recentActivities || []).length ? (
                (dashboard.recentActivities || []).map((activity) => (
                  <div
                    key={activity._id}
                    className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ring-1 ${actionTone(activity.action)}`}
                      >
                        {(activity.action || "—").toString()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{activityLabel(activity.action, activity.entityType)}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(activity.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">
                  No activity yet — your colourful timeline will fill up as you work.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          {/* Snapshot */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50 to-teal-50 p-3 text-center shadow-md ring-1 ring-cyan-100/60">
              <BookOpen className="mx-auto h-6 w-6 text-cyan-600" strokeWidth={1.75} aria-hidden />
              <p className="mt-2 text-2xl font-black text-slate-900">{subjects.length}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-cyan-800/80">Subjects</p>
            </div>
            <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-violet-50 p-3 text-center shadow-md ring-1 ring-indigo-100/60">
              <FileBarChart className="mx-auto h-6 w-6 text-indigo-600" strokeWidth={1.75} aria-hidden />
              <p className="mt-2 text-2xl font-black text-slate-900">{exams.length}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-indigo-800/80">Exams</p>
            </div>
            <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-pink-50 p-3 text-center shadow-md ring-1 ring-rose-100/60">
              <Megaphone className="mx-auto h-6 w-6 text-rose-600" strokeWidth={1.75} aria-hidden />
              <p className="mt-2 text-2xl font-black text-slate-900">{noticeTotal}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-rose-800/80">Notices</p>
            </div>
          </div>

          {/* Notices preview */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg ring-1 ring-slate-100/90">
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-rose-50 to-amber-50 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">Latest notices</h3>
                <p className="text-xs text-slate-600">Published · newest first</p>
              </div>
              <Link to="/admin/notices" className="text-xs font-bold text-rose-600 hover:text-rose-800">
                View all →
              </Link>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto p-4">
              {notices.length ? (
                notices.map((n) => (
                  <div
                    key={n._id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-rose-200/60 hover:bg-rose-50/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 truncate font-semibold text-slate-900">{n.title || "Notice"}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ring-1 ${noticePriorityClass(n.priority)}`}
                      >
                        {n.priority || "MED"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{n.description || n.message || ""}</p>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">No published notices — share updates from Notices.</p>
              )}
            </div>
          </div>

          {/* Colourful shortcuts */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl ring-1 ring-slate-100/90">
            <div className="border-b border-slate-100 bg-gradient-to-r from-amber-100/50 via-white to-violet-100/40 px-5 py-4">
              <h3 className="font-bold text-slate-900">Rainbow shortcuts</h3>
              <p className="text-xs text-slate-600">Jump to your favourite modules</p>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-1">
              {QUICK_LINKS.map(({ to, label, hint, icon: Icon, gradient, shadow }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-transparent hover:bg-white hover:shadow-lg"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${gradient} ${shadow}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">{label}</span>
                    <span className="block text-xs text-slate-500">{hint}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
