import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  Filter,
  RefreshCw,
  Search,
  UserCheck,
  UserRound,
  UserX,
  Users,
  XCircle,
  Clock3,
  PencilLine,
  TrendingUp,
  FileDown,
} from "lucide-react";
import Loader from "../../components/Loader";
import { adminService } from "../../services/adminService";

const STATUSES = [
  { value: "PRESENT", label: "Present", icon: CheckCircle2, tone: "emerald" },
  { value: "ABSENT", label: "Absent", icon: XCircle, tone: "rose" },
  { value: "LEAVE", label: "Leave", icon: CalendarDays, tone: "amber" },
  { value: "HALF_DAY", label: "Half Day", icon: Clock3, tone: "sky" },
];

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function startOfDay(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toISOString();
}

function endOfDay(iso) {
  const d = new Date(`${iso}T23:59:59.999`);
  return d.toISOString();
}

function teacherDisplayName(teacher) {
  if (!teacher) return "Teacher";
  return (
    teacher.userId?.name ||
    `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() ||
    "Teacher"
  );
}

function teacherSubjects(teacher) {
  if (!teacher) return "—";
  const fromNames = (teacher.subjectNames || []).filter(Boolean);
  if (fromNames.length) return fromNames.join(", ");
  const fromRefs = (teacher.subjects || []).map((s) => s?.name).filter(Boolean);
  if (fromRefs.length) return fromRefs.join(", ");
  return teacher.department || "—";
}

function teacherInitials(teacher) {
  const name = teacherDisplayName(teacher);
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusBadgeClass(status) {
  if (status === "PRESENT") return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
  if (status === "ABSENT") return "bg-rose-50 text-rose-800 ring-rose-200/80";
  if (status === "LEAVE") return "bg-amber-50 text-amber-900 ring-amber-200/80";
  if (status === "HALF_DAY") return "bg-sky-50 text-sky-800 ring-sky-200/80";
  return "bg-slate-100 text-slate-600 ring-slate-200/80";
}

function statusLabel(status) {
  return STATUSES.find((s) => s.value === status)?.label || status || "Not marked";
}

function formatTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function GlassStatCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[1.25rem] border border-white/60 p-5 shadow-[0_20px_50px_-28px_rgba(37,99,235,0.45)] ring-1 ring-slate-200/50 backdrop-blur-md ${gradient}`}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 blur-2xl transition group-hover:scale-110"
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-white shadow-lg ring-1 ring-white/30">
          <Icon className="h-5 w-5" strokeWidth={1.85} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/85">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-white">{value}</p>
          {sub ? <p className="mt-1 text-sm text-white/80">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

function AttendanceManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [weeklyRecords, setWeeklyRecords] = useState([]);

  const [filterDate, setFilterDate] = useState(todayIso());
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    teacherId: "",
    date: todayIso(),
    status: "PRESENT",
    remarks: "",
  });

  const attendanceByTeacherId = useMemo(() => {
    const map = new Map();
    attendanceRows.forEach((row) => {
      const tid = row.teacherId?._id || row.teacherId;
      if (tid) map.set(String(tid), row);
    });
    return map;
  }, [attendanceRows]);

  const stats = useMemo(() => {
    const total = teachers.length;
    let present = 0;
    let absent = 0;
    teachers.forEach((t) => {
      const row = attendanceByTeacherId.get(String(t._id));
      if (!row) return;
      if (row.status === "PRESENT") present += 1;
      else absent += 1;
    });
    const marked = present + absent;
    const pct = marked ? Math.round((present / marked) * 100) : total ? 0 : 0;
    return { total, present, absent, pct };
  }, [teachers, attendanceByTeacherId]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const name = teacherDisplayName(t).toLowerCase();
      const email = (t.userId?.email || "").toLowerCase();
      const emp = (t.employeeId || "").toLowerCase();
      return name.includes(q) || email.includes(q) || emp.includes(q);
    });
  }, [teachers, teacherSearch]);

  const selectedTeacher = useMemo(
    () => teachers.find((t) => String(t._id) === String(form.teacherId)),
    [teachers, form.teacherId]
  );

  const tableRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return teachers
      .map((teacher) => {
        const record = attendanceByTeacherId.get(String(teacher._id));
        return { teacher, record };
      })
      .filter(({ teacher, record }) => {
        if (statusFilter === "UNMARKED" && record) return false;
        if (statusFilter === "UNMARKED" && !record) return true;
        if (statusFilter && record?.status !== statusFilter) return false;
        if (!q) return true;
        const name = teacherDisplayName(teacher).toLowerCase();
        const subj = teacherSubjects(teacher).toLowerCase();
        return name.includes(q) || subj.includes(q);
      });
  }, [teachers, attendanceByTeacherId, tableSearch, statusFilter]);

  const weeklyChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      const dayStart = new Date(`${iso}T00:00:00`).getTime();
      const dayEnd = new Date(`${iso}T23:59:59.999`).getTime();
      const dayRows = weeklyRecords.filter((r) => {
        const t = new Date(r.date).getTime();
        return t >= dayStart && t <= dayEnd;
      });
      const present = dayRows.filter((r) => r.status === "PRESENT").length;
      const absent = dayRows.filter((r) => r.status === "ABSENT" || r.status === "LEAVE" || r.status === "HALF_DAY").length;
      days.push({ day: label, present, absent, total: dayRows.length });
    }
    return days;
  }, [weeklyRecords]);

  const monthlyChartData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data = [];
    for (let d = 1; d <= daysInMonth; d += 1) {
      const iso = new Date(year, month, d).toISOString().slice(0, 10);
      const dayStart = new Date(`${iso}T00:00:00`).getTime();
      const dayEnd = new Date(`${iso}T23:59:59.999`).getTime();
      const dayRows = weeklyRecords.filter((r) => {
        const t = new Date(r.date).getTime();
        return t >= dayStart && t <= dayEnd;
      });
      const present = dayRows.filter((r) => r.status === "PRESENT").length;
      const total = dayRows.length;
      const pct = total ? Math.round((present / total) * 100) : 0;
      if (d % 3 === 1 || d === daysInMonth) {
        data.push({ day: String(d), pct, present, total });
      }
    }
    return data;
  }, [weeklyRecords]);

  const loadData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const now = new Date();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [teacherRes, dayRows, weekRows, summary] = await Promise.all([
        adminService.getTeachers({ page: 1, limit: 200 }),
        adminService.getTeacherAttendanceReport({
          from: startOfDay(filterDate),
          to: endOfDay(filterDate),
        }),
        adminService.getTeacherAttendanceReport({
          from: startOfDay(monthStart.toISOString().slice(0, 10)),
          to: endOfDay(now.toISOString().slice(0, 10)),
        }),
        adminService.getMonthlyAttendanceSummary({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        }),
      ]);

      setTeachers(teacherRes.items || []);
      setAttendanceRows(Array.isArray(dayRows) ? dayRows : []);
      setWeeklyRecords(Array.isArray(weekRows) ? weekRows : []);
      setMonthlySummary(summary);
    } catch (error) {
      toast.error(error.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const markAttendance = async (payload) => {
    await adminService.markTeacherAttendance({
      teacherId: payload.teacherId,
      date: startOfDay(payload.date),
      status: payload.status,
      remarks: payload.remarks || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.teacherId) {
      toast.error("Please select a teacher");
      return;
    }
    if (!form.date) {
      toast.error("Please select a date");
      return;
    }
    setSubmitting(true);
    try {
      await markAttendance(form);
      toast.success("Teacher attendance saved");
      await loadData(true);
    } catch (error) {
      toast.error(error.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkMark = async (status) => {
    const unmarked = teachers.filter((t) => !attendanceByTeacherId.has(String(t._id)));
    if (!unmarked.length) {
      toast.error("All teachers already have attendance marked for this date");
      return;
    }
    setBulkLoading(true);
    try {
      await Promise.all(
        unmarked.map((t) =>
          markAttendance({
            teacherId: t._id,
            date: filterDate,
            status,
            remarks: "",
          })
        )
      );
      toast.success(`Marked ${unmarked.length} teacher(s) as ${statusLabel(status)}`);
      await loadData(true);
    } catch (error) {
      toast.error(error.message || "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleQuickEdit = (teacher, record) => {
    setForm({
      teacherId: teacher._id,
      date: filterDate,
      status: record?.status || "PRESENT",
      remarks: record?.remarks || "",
    });
    setTeacherSearch(teacherDisplayName(teacher));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportCsv = () => {
    const headers = ["Teacher", "Subject", "Status", "Time", "Remarks", "Date"];
    const lines = tableRows.map(({ teacher, record }) => [
      teacherDisplayName(teacher),
      teacherSubjects(teacher),
      record ? statusLabel(record.status) : "Not marked",
      record ? formatTime(record.updatedAt || record.createdAt) : "",
      record?.remarks || "",
      filterDate,
    ]);
    const csv = [headers, ...lines].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teacher-attendance-${filterDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance exported");
  };

  const downloadReport = () => {
    const summary = [
      `Teacher Attendance Report`,
      `Date: ${filterDate}`,
      `Total Teachers: ${stats.total}`,
      `Present: ${stats.present}`,
      `Absent / Leave / Half Day: ${stats.absent}`,
      `Attendance Rate: ${stats.pct}%`,
      monthlySummary
        ? `Monthly records (all): ${monthlySummary.teacherAttendanceRecords ?? "—"}`
        : "",
      "",
      "Details:",
      ...tableRows.map(({ teacher, record }) =>
        `${teacherDisplayName(teacher)} | ${teacherSubjects(teacher)} | ${record ? statusLabel(record.status) : "Not marked"} | ${record?.remarks || ""}`
      ),
    ].join("\n");
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teacher-attendance-report-${filterDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader text="Loading teacher attendance…" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-600">Faculty Operations</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Teacher Attendance</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
            Mark daily attendance, monitor presence trends, and export professional reports for your teaching staff.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50 disabled:opacity-60"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50"
            onClick={exportCsv}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStatCard
          icon={Users}
          label="Total Teachers"
          value={stats.total}
          sub="Active faculty roster"
          gradient="bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600"
        />
        <GlassStatCard
          icon={UserCheck}
          label="Present Today"
          value={stats.present}
          sub={`On ${filterDate}`}
          gradient="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600"
        />
        <GlassStatCard
          icon={UserX}
          label="Absent Today"
          value={stats.absent}
          sub="Absent, leave & half day"
          gradient="bg-gradient-to-br from-rose-600 via-rose-500 to-orange-600"
        />
        <GlassStatCard
          icon={TrendingUp}
          label="Attendance %"
          value={`${stats.pct}%`}
          sub="Of marked records today"
          gradient="bg-gradient-to-br from-violet-600 via-indigo-500 to-brand-600"
        />
      </div>

      {/* Quick actions + charts row */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 xl:col-span-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Quick actions</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">Bulk operations</h3>
          <p className="mt-1 text-xs text-slate-500">Apply to unmarked teachers for {filterDate}</p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => handleBulkMark("PRESENT")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-105 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark All Present
            </button>
            <button
              type="button"
              disabled={bulkLoading}
              onClick={() => handleBulkMark("ABSENT")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Mark All Absent
            </button>
            <button
              type="button"
              onClick={downloadReport}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
            >
              <FileDown className="h-4 w-4" />
              Download Report
            </button>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Analytics</p>
              <h3 className="text-base font-bold text-slate-900">Weekly attendance trend</h3>
            </div>
          </div>
          {weeklyChartData.every((d) => d.total === 0) ? (
            <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 text-sm text-slate-500">
              No attendance data for the past 7 days yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <RTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px -12px rgba(15,23,42,0.2)",
                  }}
                />
                <Legend />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" name="Other" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Monthly overview</p>
          <h3 className="text-base font-bold text-slate-900">Attendance percentage (current month)</h3>
        </div>
        {monthlyChartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-slate-500">No monthly data</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyChartData}>
              <defs>
                <linearGradient id="attPct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <RTooltip formatter={(v) => [`${v}%`, "Attendance"]} />
              <Area type="monotone" dataKey="pct" stroke="#2563eb" strokeWidth={2.5} fill="url(#attPct)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mark attendance form */}
      <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white shadow-[0_24px_60px_-32px_rgba(37,99,235,0.18)] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Mark teacher attendance</h2>
              <p className="text-sm text-white/85">Select faculty, set status, and add optional remarks.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Teacher search dropdown */}
            <div className="relative">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">Teacher</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} pl-11 pr-10`}
                  placeholder="Search and select teacher…"
                  value={teacherSearch}
                  onChange={(e) => {
                    setTeacherSearch(e.target.value);
                    setTeacherDropdownOpen(true);
                    if (!e.target.value) setForm((f) => ({ ...f, teacherId: "" }));
                  }}
                  onFocus={() => setTeacherDropdownOpen(true)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() => setTeacherDropdownOpen((v) => !v)}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              {teacherDropdownOpen && (
                <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-slate-100">
                  {filteredTeachers.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-500">No teachers found</p>
                  ) : (
                    filteredTeachers.map((t) => (
                      <button
                        key={t._id}
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-brand-50"
                        onClick={() => {
                          setForm((f) => ({ ...f, teacherId: t._id }));
                          setTeacherSearch(teacherDisplayName(t));
                          setTeacherDropdownOpen(false);
                        }}
                      >
                        {t.profileImage ? (
                          <img src={t.profileImage} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                            {teacherInitials(t)}
                          </span>
                        )}
                        <span>
                          <span className="block font-semibold text-slate-900">{teacherDisplayName(t)}</span>
                          <span className="text-xs text-slate-500">{teacherSubjects(t)}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {selectedTeacher ? (
                <p className="mt-2 text-xs text-emerald-700">
                  Selected: <span className="font-semibold">{teacherDisplayName(selectedTeacher)}</span>
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">Attendance date</label>
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => {
                  setForm((f) => ({ ...f, date: e.target.value }));
                  setFilterDate(e.target.value);
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wide text-slate-600">Status</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATUSES.map(({ value, label, icon: Icon, tone }) => {
                const active = form.status === value;
                const tones = {
                  emerald: active ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-emerald-200" : "",
                  rose: active ? "border-rose-500 bg-rose-50 text-rose-800 ring-rose-200" : "",
                  amber: active ? "border-amber-500 bg-amber-50 text-amber-900 ring-amber-200" : "",
                  sky: active ? "border-sky-500 bg-sky-50 text-sky-800 ring-sky-200" : "",
                };
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, status: value }))}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition hover:shadow-md ${
                      active
                        ? `${tones[tone]} ring-2`
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">Remarks (optional)</label>
            <textarea
              className={`${inputClass} min-h-[96px] resize-y`}
              placeholder="Add notes about late arrival, medical leave, etc."
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-105 disabled:opacity-60"
            >
              <ClipboardCheck className="h-4 w-4" />
              {submitting ? "Saving…" : "Submit attendance"}
            </button>
          </div>
        </form>
      </div>

      {/* Table section */}
      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Daily register</p>
              <h3 className="text-lg font-bold text-slate-900">Teacher attendance list</h3>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} py-2 pl-9`}
                  placeholder="Search teacher…"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 shrink-0 text-slate-400" />
                <select
                  className={`${inputClass} py-2`}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                  <option value="UNMARKED">Not marked</option>
                </select>
              </div>
              <input
                type="date"
                className={`${inputClass} py-2`}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                <th className="px-5 py-3.5 sm:px-6">Teacher</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Time</th>
                <th className="px-4 py-3.5">Remarks</th>
                <th className="px-5 py-3.5 text-right sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <UserRound className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">No teachers match your filters</p>
                    <p className="mt-1 text-sm text-slate-500">Try adjusting search, status, or date.</p>
                  </td>
                </tr>
              ) : (
                tableRows.map(({ teacher, record }) => (
                  <tr
                    key={teacher._id}
                    className="border-b border-slate-50 transition hover:bg-brand-50/30"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {teacher.profileImage ? (
                          <img
                            src={teacher.profileImage}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-xs font-bold text-white">
                            {teacherInitials(teacher)}
                          </span>
                        )}
                        <span>
                          <span className="block font-semibold text-slate-900">{teacherDisplayName(teacher)}</span>
                          <span className="text-xs text-slate-500">{teacher.employeeId || teacher.userId?.email || ""}</span>
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-4 text-slate-600">{teacherSubjects(teacher)}</td>
                    <td className="px-4 py-4">
                      {record ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusBadgeClass(record.status)}`}
                        >
                          {statusLabel(record.status)}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80">
                          Not marked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatTime(record?.updatedAt || record?.createdAt)}</td>
                    <td className="max-w-[200px] truncate px-4 py-4 text-slate-500">{record?.remarks || "—"}</td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <button
                        type="button"
                        onClick={() => handleQuickEdit(teacher, record)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AttendanceManagementPage;
