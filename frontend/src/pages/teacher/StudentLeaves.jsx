import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  FileDown,
  Filter,
  GraduationCap,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Loader from "../../components/Loader";
import { teacherService } from "../../services/teacherService";
import { resolveUploadUrl } from "../../utils/apiOrigin";
import {
  formatDate,
  formatDateTime,
  studentLeaveTypeLabel,
  studentStatusBadgeClass,
  studentStatusLabel,
} from "../../utils/studentLeaveConstants";

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

function GlassStat({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div className={`group relative overflow-hidden rounded-[1.25rem] border border-white/60 p-5 shadow-lg ring-1 ring-slate-200/50 backdrop-blur-md bg-gradient-to-br ${gradient}`}>
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/15 blur-2xl" aria-hidden />
      <div className="relative flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-white ring-1 ring-white/30">
          <Icon className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/85">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-white">{value}</p>
          {sub ? <p className="mt-1 text-sm text-white/80">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

function studentName(row) {
  return row.studentId?.userId?.name || "Student";
}

function studentInitials(row) {
  return studentName(row)
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function classLabel(row) {
  const cls = row.classId;
  const name = cls?.name || "—";
  const section = row.studentId?.section || cls?.section;
  return section ? `${name} · ${section}` : name;
}

function buildParams(filters) {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.search.trim()) params.search = filters.search.trim();
  return params;
}

export default function TeacherStudentLeavesPage() {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ status: "", from: "", to: "", search: "" });
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [acting, setActing] = useState(false);

  const chartData = useMemo(
    () => [
      { name: "Pending", count: stats?.pending ?? 0 },
      { name: "Approved", count: stats?.approved ?? 0 },
      { name: "Rejected", count: stats?.rejected ?? 0 },
    ],
    [stats]
  );

  const refresh = useCallback(async (f, silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [s, r] = await Promise.all([
        teacherService.getStudentLeaveStats(),
        teacherService.getStudentLeaves(buildParams(f)),
      ]);
      setStats(s);
      setRows(Array.isArray(r) ? r : []);
    } catch (e) {
      toast.error(e.message || "Failed to load student leaves");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load
  }, []);

  const openDetail = (row) => {
    setSelected(row);
    setRemarks(row.teacherRemarks || "");
  };

  const decide = async (decision) => {
    if (!selected) return;
    const r = remarks.trim();
    if (decision === "REJECT" && !r) {
      toast.error("Remarks are required to reject a leave");
      return;
    }
    setActing(true);
    try {
      await teacherService.decideStudentLeave(selected._id, { decision, teacherRemarks: r });
      toast.success(decision === "APPROVE" ? "Leave approved" : "Leave rejected");
      setSelected(null);
      await refresh(filters, true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(false);
    }
  };

  if (loading && !rows.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader text="Loading student leave requests…" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-600">Class teacher</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Student leave approvals</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
            Review and approve leave requests from students in classes where you are the assigned class teacher.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh(filters, true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStat icon={Users} label="Total requests" value={stats?.total ?? 0} sub="All time" gradient="from-brand-600 via-brand-500 to-indigo-600" />
        <GlassStat icon={Clock3} label="Pending" value={stats?.pending ?? 0} sub="Awaiting your action" gradient="from-amber-500 to-orange-500" />
        <GlassStat icon={CheckCircle2} label="Approved" value={stats?.approved ?? 0} sub="Approved by you" gradient="from-emerald-600 to-teal-600" />
        <GlassStat icon={XCircle} label="Rejected" value={stats?.rejected ?? 0} sub="Rejected by you" gradient="from-rose-600 to-red-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 xl:col-span-1">
          <h3 className="text-sm font-bold text-slate-900">Request status overview</h3>
          <p className="mt-0.5 text-xs text-slate-500">Distribution of leave decisions</p>
          <div className="mt-4">
            {chartData.every((d) => d.count === 0) ? (
              <div className="flex h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 text-sm text-slate-500">
                No requests yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <RTooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -12px rgba(15,23,42,0.2)" }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-brand-200/60 bg-gradient-to-br from-brand-50/80 to-white p-5 shadow-sm ring-1 ring-brand-100/80 xl:col-span-2">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Class teacher workflow</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Students submit leave from their portal. You receive requests only for classes where you are the class teacher.
                Approve promptly so attendance and records stay accurate. Rejections require a short remark for the student and parent.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900">Leave requests</h2>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {loading ? "Loading…" : `${rows.length} record${rows.length === 1 ? "" : "s"} found`}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} py-2 pl-9`}
                  placeholder="Search student name…"
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 shrink-0 text-slate-400" />
                <select
                  className={`${inputClass} w-auto min-w-[140px] py-2`}
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <input type="date" className={`${inputClass} w-auto py-2`} value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} title="From date" />
              <input type="date" className={`${inputClass} w-auto py-2`} value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} title="To date" />
              <button type="button" className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700" onClick={() => refresh(filters)}>
                Apply filters
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                <th className="px-5 py-3.5 sm:px-6">Student</th>
                <th className="px-4 py-3.5">Leave ID</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Days</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Applied</th>
                <th className="px-5 py-3.5 text-right sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {!rows.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <GraduationCap className="mx-auto h-11 w-11 text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">No matching leave requests</p>
                    <p className="mt-1 text-sm text-slate-500">Try adjusting filters or check back when students apply for leave.</p>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="border-b border-slate-50 transition hover:bg-brand-50/25">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                          {studentInitials(r)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{studentName(r)}</p>
                          <p className="truncate text-xs text-slate-500">{classLabel(r)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-600">{r.leaveDisplayId || "—"}</td>
                    <td className="px-4 py-4 font-medium text-slate-800">{studentLeaveTypeLabel(r.leaveType)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatDate(r.fromDate)} – {formatDate(r.toDate)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{r.totalDays}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${studentStatusBadgeClass(r.status)}`}>
                        {studentStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDateTime(r.createdAt)}</td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <button
                        type="button"
                        onClick={() => openDetail(r)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[1.35rem] bg-white shadow-2xl ring-1 ring-slate-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="leave-detail-title"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/80">Leave review</p>
                  <h3 id="leave-detail-title" className="mt-1 text-lg font-bold">
                    {studentName(selected)}
                  </h3>
                  <p className="mt-0.5 text-sm text-white/85">{classLabel(selected)}</p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="rounded-xl bg-white/20 p-2 hover:bg-white/30">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${studentStatusBadgeClass(selected.status)} bg-white/95`}>
                  {studentStatusLabel(selected.status)}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <dt className="text-xs font-bold uppercase text-slate-500">Leave ID</dt>
                  <dd className="mt-1 font-mono text-slate-900">{selected.leaveDisplayId}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <dt className="text-xs font-bold uppercase text-slate-500">Leave type</dt>
                  <dd className="mt-1 font-medium text-slate-900">{studentLeaveTypeLabel(selected.leaveType)}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 sm:col-span-2">
                  <dt className="text-xs font-bold uppercase text-slate-500">Dates</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {formatDate(selected.fromDate)} – {formatDate(selected.toDate)} ({selected.totalDays} day
                    {selected.totalDays === 1 ? "" : "s"})
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 sm:col-span-2">
                  <dt className="text-xs font-bold uppercase text-slate-500">Reason</dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-800">{selected.reason || "—"}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 sm:col-span-2">
                  <dt className="text-xs font-bold uppercase text-slate-500">Parent / contact</dt>
                  <dd className="mt-1 text-slate-900">
                    {selected.parentName || "—"} · {selected.contactPhone || "—"}
                  </dd>
                </div>
                {selected.attachmentUrl ? (
                  <div className="sm:col-span-2">
                    <a
                      href={resolveUploadUrl(selected.attachmentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100"
                    >
                      <FileDown className="h-4 w-4" />
                      Download attachment
                    </a>
                  </div>
                ) : null}
                {selected.status !== "PENDING" && selected.teacherRemarks ? (
                  <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 sm:col-span-2">
                    <dt className="text-xs font-bold uppercase text-slate-500">Your remarks</dt>
                    <dd className="mt-1 text-slate-800">{selected.teacherRemarks}</dd>
                  </div>
                ) : null}
              </dl>

              {selected.status === "PENDING" ? (
                <>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Teacher remarks</span>
                    <span className="ml-1 text-xs font-normal text-slate-500">(required if rejecting)</span>
                    <textarea
                      className={`${inputClass} mt-2 min-h-[96px] resize-y`}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add a note for the student and parent…"
                    />
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => decide("APPROVE")}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {acting ? "Processing…" : "Approve leave"}
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => decide("REJECT")}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-800 hover:bg-rose-100 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject leave
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" className="w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700" onClick={() => setSelected(null)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
