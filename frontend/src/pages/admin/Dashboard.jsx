import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Banknote,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  Receipt,
  School,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/useAuth";
import { adminService } from "../../services/adminService";

const QUICK_LINKS = [
  { to: "/admin/students", label: "Students", hint: "Enrolment and records", icon: GraduationCap },
  { to: "/admin/teachers", label: "Teachers", hint: "Staff directory", icon: UserRound },
  { to: "/admin/classes", label: "Classes", hint: "Structure and sections", icon: LayoutGrid },
  { to: "/admin/attendance", label: "Attendance", hint: "Daily marking and reports", icon: ClipboardList },
  { to: "/admin/fees", label: "Fees", hint: "Collection and due tracking", icon: Wallet },
  { to: "/admin/timetable", label: "Timetable", hint: "Periods and room planning", icon: CalendarDays },
  { to: "/admin/notices", label: "Notices", hint: "School communications", icon: Megaphone },
  { to: "/admin/subjects", label: "Subjects", hint: "Curriculum setup", icon: BookOpen },
];

function formatCurrency(n) {
  const v = Number(n || 0);
  return `Rs ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function activityLabel(action, entityType) {
  const a = (action || "").toString();
  const e = (entityType || "").toString().replace(/_/g, " ").toLowerCase();
  if (!a && !e) return "Activity";
  return `${a} ${e}`.trim();
}

function actionTone(action) {
  const a = (action || "").toUpperCase();
  if (a.includes("DELETE")) return "bg-rose-50 text-rose-700 ring-rose-200";
  if (a.includes("CREATE") || a.includes("IMPORT")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (a.includes("UPDATE") || a.includes("PATCH")) return "bg-sky-50 text-sky-700 ring-sky-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function noticePriorityClass(p) {
  if (p === "HIGH") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (p === "LOW") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-amber-50 text-amber-800 ring-amber-200";
}

function MetricCard({ icon: Icon, title, value, subtitle, tone = "brand" }) {
  const tones = {
    brand: {
      wrap: "bg-brand-600 text-white shadow-brand-600/20",
      ring: "border-brand-100 ring-brand-100/70",
    },
    emerald: {
      wrap: "bg-emerald-600 text-white shadow-emerald-600/20",
      ring: "border-emerald-100 ring-emerald-100/70",
    },
    slate: {
      wrap: "bg-slate-800 text-white shadow-slate-900/20",
      ring: "border-slate-200 ring-slate-100/80",
    },
    amber: {
      wrap: "bg-amber-500 text-white shadow-amber-500/20",
      ring: "border-amber-100 ring-amber-100/70",
    },
  };

  const currentTone = tones[tone] || tones.brand;

  return (
    <div className={`rounded-3xl border bg-white p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.18)] ring-1 ${currentTone.ring}`}>
      <div className="flex items-start gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg ${currentTone.wrap}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          {subtitle ? <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p> : null}
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
        const arr = Array.isArray(settled[2].value) ? settled[2].value : [];
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
    const ratio = teachers > 0 ? `${(students / teachers).toFixed(1)}:1` : students > 0 ? "Add staff" : "--";
    const avgClass = classes > 0 ? (students / classes).toFixed(1) : "--";

    let feeStatus = {
      label: "Collections stable",
      note: "Overall collection performance looks healthy.",
      tone: "emerald",
    };

    if (totalGen > 0 && pending / totalGen > 0.35) {
      feeStatus = {
        label: "Follow up pending dues",
        note: "Pending balance is becoming material this term.",
        tone: "amber",
      };
    }

    if (overdue > 5 || (totalGen > 0 && pending / totalGen > 0.55)) {
      feeStatus = {
        label: "Collections need attention",
        note: "High overdue volume is affecting fee performance.",
        tone: "rose",
      };
    }

    return { ratio, avgClass, feeStatus };
  }, [students, teachers, classes, totalGen, pending, overdue]);

  const feeBar = useMemo(() => {
    const base = Math.max(totalGen, totalColl + pending, 1);
    const wColl = Math.min(100, Math.round((totalColl / base) * 100));
    const wPen = Math.min(100 - wColl, Math.round((pending / base) * 100));
    const wRest = Math.max(0, 100 - wColl - wPen);
    return { wColl, wPen, wRest };
  }, [totalGen, totalColl, pending]);

  if (loading) return <Loader text="Loading your admin dashboard..." />;

  return (
    <div className="w-full max-w-7xl space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#13254b_52%,#1d4ed8_100%)] px-6 py-8 text-white shadow-[0_30px_80px_-34px_rgba(15,23,42,0.55)] sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute left-0 top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-sky-100">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              Admin control center
            </p>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200">
              Monitor people, collections, notices, and academic operations from one clean overview built for daily
              decision-making.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-sky-100/90">This month</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(collectedMonth)}</p>
              <p className="mt-1 text-xs text-slate-200">Fee collection</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/20 px-4 py-3 backdrop-blur-sm">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-sky-100/90">Today</p>
              <p className="mt-1 text-lg font-semibold">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </p>
              <p className="mt-1 text-xs text-slate-200">Operational snapshot</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-[0_18px_40px_-28px_rgba(5,150,105,0.35)] ring-1 ring-emerald-100/70">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <TrendingUp className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-emerald-700">Fee health</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{insights.feeStatus.label}</p>
              <p className="mt-1 text-sm text-slate-600">{insights.feeStatus.note}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] ring-1 ring-slate-100/80">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
              <Users className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">Student to teacher</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{insights.ratio}</p>
              <p className="mt-1 text-sm text-slate-600">Staffing balance across your school population.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] ring-1 ring-slate-100/80">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-lg shadow-slate-900/20">
              <School className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">Average per class</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{insights.avgClass} students</p>
              <p className="mt-1 text-sm text-slate-600">Useful for section planning and academic load balancing.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5 text-brand-600" aria-hidden />
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Core metrics</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={GraduationCap} title="Students" value={students} subtitle="Currently enrolled" tone="brand" />
          <MetricCard icon={Users} title="Teachers" value={teachers} subtitle="Active staff members" tone="slate" />
          <MetricCard icon={LayoutGrid} title="Classes" value={classes} subtitle="Sections in operation" tone="emerald" />
          <MetricCard icon={ClipboardList} title="Attendance" value={attMonth} subtitle="Records marked this month" tone="slate" />
          <MetricCard
            icon={Receipt}
            title="Fees this month"
            value={formatCurrency(collectedMonth)}
            subtitle="Collected this cycle"
            tone="amber"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-6 lg:col-span-7">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)] ring-1 ring-slate-100/90">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-800 px-6 py-5 text-white">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                  <Banknote className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-bold">Fee performance</h3>
                  <p className="text-sm text-slate-200">A clear view of generated, collected, and pending amounts.</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 flex h-4 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${feeBar.wColl}%` }} title="Collected" />
                <div className="bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${feeBar.wPen}%` }} title="Pending" />
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
                  <span className="h-2 w-2 rounded-full bg-slate-300" /> Remaining
                </span>
              </div>

              {collectionRatio != null ? (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Lifetime collection rate</span>
                    <span className="tabular-nums text-brand-700">{collectionRatio}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-sky-500" style={{ width: `${collectionRatio}%` }} />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Total generated</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-slate-950">{formatCurrency(totalGen)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-700">Total collected</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-emerald-900">{formatCurrency(totalColl)}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-800">Pending</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-amber-950">{formatCurrency(pending)}</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-rose-700">Overdue records</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-rose-900">{overdue}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link
                  to="/admin/fees"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-brand-700"
                >
                  Open fees
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-950">Recent activity</h3>
              <p className="text-sm text-slate-600">Latest actions recorded across your school.</p>
            </div>
            <div className="divide-y divide-slate-100 p-4 sm:p-5">
              {(dashboard?.recentActivities || []).length ? (
                dashboard.recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 rounded-full px-2.5 py-1 text-[0.63rem] font-bold uppercase tracking-[0.16em] ring-1 ${actionTone(
                          activity.action
                        )}`}
                      >
                        {(activity.action || "--").toString()}
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
                <p className="py-10 text-center text-sm text-slate-500">No recent activity has been recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/80">
              <BookOpen className="mx-auto h-6 w-6 text-brand-600" strokeWidth={1.75} aria-hidden />
              <p className="mt-2 text-2xl font-black text-slate-950">{subjects.length}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">Subjects</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/80">
              <FileBarChart className="mx-auto h-6 w-6 text-slate-800" strokeWidth={1.75} aria-hidden />
              <p className="mt-2 text-2xl font-black text-slate-950">{exams.length}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">Exams</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/80">
              <Bell className="mx-auto h-6 w-6 text-amber-500" strokeWidth={1.75} aria-hidden />
              <p className="mt-2 text-2xl font-black text-slate-950">{noticeTotal}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">Notices</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-950">Latest notices</h3>
                <p className="text-xs text-slate-500">Published notices, newest first</p>
              </div>
              <Link to="/admin/notices" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                View all
              </Link>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto p-4">
              {notices.length ? (
                notices.map((n) => (
                  <div key={n._id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 truncate font-semibold text-slate-950">{n.title || "Notice"}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] ring-1 ${noticePriorityClass(
                          n.priority
                        )}`}
                      >
                        {n.priority || "MED"}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{n.description || n.message || ""}</p>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">No published notices yet.</p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h3 className="font-bold text-slate-950">Quick access</h3>
              <p className="text-xs text-slate-500">Open your most-used admin modules faster.</p>
            </div>
            <div className="grid gap-3 p-4">
              {QUICK_LINKS.map(({ to, label, hint, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 transition hover:border-brand-200 hover:bg-white hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10 transition group-hover:bg-brand-600">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-950">{label}</span>
                    <span className="block text-sm text-slate-500">{hint}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
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
