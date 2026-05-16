import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  Download,
  Eye,
  FileDown,
  Filter,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import Loader from "../../components/Loader";
import { adminService } from "../../services/adminService";
import { resolveUploadUrl } from "../../utils/apiOrigin";
import {
  TEACHER_LEAVE_TYPES,
  formatDate,
  leaveTypeLabel,
  statusBadgeClass,
  statusLabel,
} from "../../utils/teacherLeaveConstants";

const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];
const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

function teacherSubjects(row) {
  const t = row.teacherId;
  if (!t || typeof t !== "object") return row.subjectLabel || "—";
  const names = (t.subjectNames || []).filter(Boolean);
  if (names.length) return names.join(", ");
  return (t.subjects || []).map((s) => s?.name).filter(Boolean).join(", ") || t.department || "—";
}

function teacherPhoto(row) {
  return row.teacherPhoto || row.teacherId?.profileImage || "";
}

function teacherName(row) {
  return row.teacherName || "Teacher";
}

function StatCard({ label, value, gradient }) {
  return (
    <div className={`rounded-[1.25rem] border border-white/50 bg-gradient-to-br ${gradient} p-5 text-white shadow-lg backdrop-blur-md`}>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/85">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function TeacherLeaveRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({ monthly: [], byType: [] });
  const [teachers, setTeachers] = useState([]);
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    status: "",
    leaveType: "",
    teacherId: "",
    from: "",
    to: "",
    search: "",
    page: 1,
  });
  const [detail, setDetail] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, list, teacherRes] = await Promise.all([
        adminService.getTeacherLeaveStats(),
        adminService.getTeacherLeaveCharts(),
        adminService.listTeacherLeaves({
          page: filters.page,
          limit: 10,
          status: filters.status || undefined,
          leaveType: filters.leaveType || undefined,
          teacherId: filters.teacherId || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          search: filters.search || undefined,
        }),
        adminService.getTeachers({ page: 1, limit: 200 }),
      ]);
      setStats(s);
      setCharts(c);
      setData(list);
      setTeachers(teacherRes.items || []);
    } catch (e) {
      toast.error(e.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const monthlyChart = useMemo(
    () => (charts.monthly || []).map((m) => ({ day: m.date?.slice(8) || m.date, requests: m.count })),
    [charts.monthly]
  );

  const typeChart = useMemo(
    () =>
      (charts.byType || []).map((t) => ({
        name: leaveTypeLabel(t.type),
        value: t.count,
      })),
    [charts.byType]
  );

  const exportCsv = () => {
    const headers = ["Teacher", "Department/Subject", "Type", "From", "To", "Days", "Status", "Reason", "Applied"];
    const lines = (data.items || []).map((r) => [
      teacherName(r),
      teacherSubjects(r),
      leaveTypeLabel(r.leaveType),
      formatDate(r.fromDate || r.startDate),
      formatDate(r.toDate || r.endDate),
      r.totalDays,
      statusLabel(r.status),
      r.reason,
      formatDate(r.createdAt),
    ]);
    const csv = [headers, ...lines].map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teacher-leave-requests.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const printReport = () => {
    window.print();
  };

  const submitDecision = async () => {
    if (!actionModal) return;
    if (actionModal.status === "REJECTED" && !remarks.trim()) {
      toast.error("Remarks required for rejection");
      return;
    }
    setActing(true);
    try {
      await adminService.decideTeacherLeave(actionModal.leave._id, {
        status: actionModal.status,
        adminRemarks: remarks.trim(),
      });
      toast.success(actionModal.status === "APPROVED" ? "Leave approved" : "Leave rejected");
      setActionModal(null);
      setRemarks("");
      setDetail(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm("Delete this leave request permanently?")) return;
    try {
      await adminService.deleteTeacherLeave(row._id);
      toast.success("Request deleted");
      setDetail(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading && !data.items?.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader text="Loading teacher leave requests…" />
      </div>
    );
  }

  return (
    <div className="leave-admin-print space-y-6 pb-10">
      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-600">Faculty HR</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Teacher Leave Requests</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600">Review, approve, or reject leave applications from your teaching staff.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button type="button" onClick={printReport} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50">
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
        <StatCard label="Total Requests" value={stats?.total ?? 0} gradient="from-brand-600 to-indigo-600" />
        <StatCard label="Pending" value={stats?.PENDING ?? 0} gradient="from-amber-500 to-orange-500" />
        <StatCard label="Approved" value={stats?.APPROVED ?? 0} gradient="from-emerald-600 to-teal-600" />
        <StatCard label="Rejected" value={stats?.REJECTED ?? 0} gradient="from-rose-600 to-red-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 print:hidden">
        <div className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Monthly leave requests</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <RTooltip />
              <Bar dataKey="requests" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Leave type distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {typeChart.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white shadow-sm print:border-0 print:shadow-none">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 print:hidden">
          <div className="flex flex-wrap items-end gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select className={`${inputClass} w-auto py-2`} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select className={`${inputClass} w-auto py-2`} value={filters.leaveType} onChange={(e) => setFilters((f) => ({ ...f, leaveType: e.target.value, page: 1 }))}>
              <option value="">All types</option>
              {TEACHER_LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select className={`${inputClass} w-auto max-w-[200px] py-2`} value={filters.teacherId} onChange={(e) => setFilters((f) => ({ ...f, teacherId: e.target.value, page: 1 }))}>
              <option value="">All teachers</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.userId?.name || "Teacher"}
                </option>
              ))}
            </select>
            <input type="date" className={`${inputClass} w-auto py-2`} value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 1 }))} />
            <input type="date" className={`${inputClass} w-auto py-2`} value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 1 }))} />
            <div className="relative min-w-[160px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} py-2 pl-9`} placeholder="Search…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} />
            </div>
            <button type="button" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={load}>
              Apply
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[0.68rem] font-bold uppercase text-slate-500">
                <th className="px-5 py-3">Teacher</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-5 py-3 text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!data.items?.length ? (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center text-slate-500">
                    <UserRound className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 font-semibold">No leave requests found</p>
                  </td>
                </tr>
              ) : (
                data.items.map((row) => (
                  <tr key={row._id} className="border-b border-slate-50 hover:bg-brand-50/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {teacherPhoto(row) ? (
                          <img src={resolveUploadUrl(teacherPhoto(row))} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100" />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-xs font-bold text-white">
                            {teacherName(row).slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="font-semibold text-slate-900">{teacherName(row)}</span>
                      </div>
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-3.5 text-slate-600">{teacherSubjects(row)}</td>
                    <td className="px-4 py-3.5">{leaveTypeLabel(row.leaveType)}</td>
                    <td className="px-4 py-3.5">{formatDate(row.fromDate || row.startDate)}</td>
                    <td className="px-4 py-3.5">{formatDate(row.toDate || row.endDate)}</td>
                    <td className="px-4 py-3.5">{row.totalDays}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusBadgeClass(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-3.5 print:hidden">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setDetail(row)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        {row.attachmentUrl ? (
                          <a href={resolveUploadUrl(row.attachmentUrl)} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Download attachment">
                            <FileDown className="h-4 w-4" />
                          </a>
                        ) : null}
                        {row.status === "PENDING" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActionModal({ leave: row, status: "APPROVED" });
                                setRemarks("");
                              }}
                              className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                              title="Approve"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionModal({ leave: row, status: "REJECTED" });
                                setRemarks("");
                              }}
                              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}
                        <button type="button" onClick={() => onDelete(row)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data.totalPages > 1 ? (
          <div className="flex justify-center gap-3 border-t border-slate-100 py-3 print:hidden">
            <button type="button" disabled={filters.page <= 1} className="rounded-xl border px-3 py-1.5 text-sm disabled:opacity-40" onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {filters.page} / {data.totalPages}
            </span>
            <button type="button" disabled={filters.page >= data.totalPages} className="rounded-xl border px-3 py-1.5 text-sm disabled:opacity-40" onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
              Next
            </button>
          </div>
        ) : null}
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm print:hidden" onClick={() => setDetail(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold">Leave details</h3>
              <button type="button" onClick={() => setDetail(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-slate-500">Teacher</dt><dd className="font-medium">{teacherName(detail)}</dd></div>
              <div><dt className="text-slate-500">Subject</dt><dd>{teacherSubjects(detail)}</dd></div>
              <div><dt className="text-slate-500">Type</dt><dd>{leaveTypeLabel(detail.leaveType)}</dd></div>
              <div><dt className="text-slate-500">Dates</dt><dd>{formatDate(detail.fromDate)} – {formatDate(detail.toDate)} ({detail.totalDays} days)</dd></div>
              <div><dt className="text-slate-500">Reason</dt><dd className="whitespace-pre-wrap">{detail.reason}</dd></div>
              <div><dt className="text-slate-500">Emergency contact</dt><dd>{detail.emergencyContact || "—"}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><span className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${statusBadgeClass(detail.status)}`}>{statusLabel(detail.status)}</span></dd></div>
              <div><dt className="text-slate-500">Admin remarks</dt><dd>{detail.adminRemarks || "—"}</dd></div>
            </dl>
            {detail.status === "PENDING" ? (
              <div className="mt-4 flex gap-2">
                <button type="button" className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white" onClick={() => { setActionModal({ leave: detail, status: "APPROVED" }); setRemarks(""); }}>
                  Approve
                </button>
                <button type="button" className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white" onClick={() => { setActionModal({ leave: detail, status: "REJECTED" }); setRemarks(""); }}>
                  Reject
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {actionModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setActionModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">
              {actionModal.status === "APPROVED" ? "Approve leave" : "Reject leave"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{teacherName(actionModal.leave)} · {leaveTypeLabel(actionModal.leave.leaveType)}</p>
            <label className="mt-4 block text-xs font-bold uppercase text-slate-600">Admin remarks</label>
            <textarea className={`${inputClass} mt-2 min-h-[88px]`} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={actionModal.status === "REJECTED" ? "Required for rejection" : "Optional"} />
            <div className="mt-4 flex gap-2">
              <button type="button" className="flex-1 rounded-xl border py-2.5 text-sm font-semibold" onClick={() => setActionModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={acting}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60 ${actionModal.status === "APPROVED" ? "bg-emerald-600" : "bg-rose-600"}`}
                onClick={submitDecision}
              >
                {acting ? "Saving…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
