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
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Loader from "../../components/Loader";
import { teacherService } from "../../services/teacherService";
import { resolveUploadUrl } from "../../utils/apiOrigin";
import {
  TEACHER_LEAVE_TYPES,
  formatDate,
  inclusiveDays,
  leaveTypeLabel,
  statusBadgeClass,
  statusLabel,
} from "../../utils/teacherLeaveConstants";

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

const emptyForm = {
  leaveType: "SICK",
  fromDate: "",
  toDate: "",
  reason: "",
  emergencyContact: "",
};

function StatCard({ label, value, tone }) {
  const tones = {
    brand: "from-brand-600 to-indigo-600",
    emerald: "from-emerald-600 to-teal-600",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-600 to-red-600",
  };
  return (
    <div className={`relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${tones[tone] || tones.brand} p-5 text-white shadow-lg`}>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/80">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function buildFormData(form, file) {
  const fd = new FormData();
  fd.append("leaveType", form.leaveType);
  fd.append("fromDate", form.fromDate);
  fd.append("toDate", form.toDate);
  fd.append("reason", form.reason.trim());
  fd.append("emergencyContact", form.emergencyContact.trim());
  if (file) fd.append("attachment", file);
  return fd;
}

export default function TeacherLeaveManagementPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: "", search: "", from: "", to: "", page: 1 });
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [detail, setDetail] = useState(null);

  const dayCount = useMemo(() => inclusiveDays(form.fromDate, form.toDate), [form.fromDate, form.toDate]);

  const chartData = useMemo(() => {
    const map = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    (data.items || []).forEach((r) => {
      if (map[r.status] !== undefined) map[r.status] += 1;
    });
    return [
      { name: "Pending", count: map.PENDING },
      { name: "Approved", count: map.APPROVED },
      { name: "Rejected", count: map.REJECTED },
    ];
  }, [data.items]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, list] = await Promise.all([
        teacherService.getLeaveStats(),
        teacherService.getLeaves({
          page: filters.page,
          limit: 10,
          status: filters.status || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          search: filters.search || undefined,
        }),
      ]);
      setStats(s);
      setData(list);
    } catch (e) {
      toast.error(e.message || "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate) {
      toast.error("Select from and to dates");
      return;
    }
    setSubmitting(true);
    try {
      const fd = buildFormData(form, file);
      if (editingId) {
        await teacherService.updateLeave(editingId, fd);
        toast.success("Leave request updated");
      } else {
        await teacherService.applyLeave(fd);
        toast.success("Leave request submitted to school admin");
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(err.message || "Failed to save leave");
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (row) => {
    if (row.status !== "PENDING") {
      toast.error("Only pending requests can be edited");
      return;
    }
    setEditingId(row._id);
    setForm({
      leaveType: row.leaveType,
      fromDate: (row.fromDate || row.startDate || "").slice(0, 10),
      toDate: (row.toDate || row.endDate || "").slice(0, 10),
      reason: row.reason || "",
      emergencyContact: row.emergencyContact || "",
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (row) => {
    if (row.status !== "PENDING") {
      toast.error("Only pending requests can be deleted");
      return;
    }
    if (!window.confirm("Delete this leave request?")) return;
    try {
      await teacherService.deleteLeave(row._id);
      toast.success("Leave request deleted");
      if (editingId === row._id) resetForm();
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading && !data.items?.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader text="Loading leave management…" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-600">HR & Attendance</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Leave Management</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
            Apply for leave, track approval status, and manage your pending requests.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Leaves" value={stats?.total ?? 0} tone="brand" />
        <StatCard label="Approved" value={stats?.APPROVED ?? 0} tone="emerald" />
        <StatCard label="Pending" value={stats?.PENDING ?? 0} tone="amber" />
        <StatCard label="Rejected" value={stats?.REJECTED ?? 0} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white shadow-lg ring-1 ring-slate-100/90 xl:col-span-2">
          <div className="border-b border-slate-100 bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                {editingId ? <PencilLine className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </span>
              <div>
                <h2 className="text-lg font-bold">{editingId ? "Edit leave request" : "Apply for leave"}</h2>
                <p className="text-sm text-white/85">School admin will review and approve your request.</p>
              </div>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Leave type</label>
                <select className={inputClass} value={form.leaveType} onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value }))}>
                  {TEACHER_LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Emergency contact</label>
                <input
                  className={inputClass}
                  value={form.emergencyContact}
                  onChange={(e) => setForm((f) => ({ ...f, emergencyContact: e.target.value }))}
                  placeholder="+91 …"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-600">From date</label>
                <input type="date" className={inputClass} value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} required />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-600">To date</label>
                <input type="date" className={inputClass} value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} required />
              </div>
            </div>
            {dayCount > 0 ? (
              <p className="text-sm font-medium text-brand-700">
                <CalendarDays className="mr-1 inline h-4 w-4" />
                {dayCount} day(s) selected
              </p>
            ) : null}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Reason</label>
              <textarea className={`${inputClass} min-h-[100px]`} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-600">Attachment (optional)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-slate-600" />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
              >
                {submitting ? "Saving…" : editingId ? "Update request" : "Submit leave"}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
          <h3 className="text-sm font-bold text-slate-900">Status overview</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <RTooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-900">My leave requests</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClass} py-2 pl-9`}
                placeholder="Search…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              />
            </div>
            <select className={`${inputClass} w-auto py-2`} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <input type="date" className={`${inputClass} w-auto py-2`} value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 1 }))} />
            <input type="date" className={`${inputClass} w-auto py-2`} value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 1 }))} />
            <button type="button" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={load}>
              Apply
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[0.68rem] font-bold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!data.items?.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-slate-500">
                    <Clock3 className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 font-semibold">No leave requests yet</p>
                    <p className="text-sm">Submit your first application using the form above.</p>
                  </td>
                </tr>
              ) : (
                data.items.map((row) => (
                  <tr key={row._id} className="border-b border-slate-50 hover:bg-brand-50/20">
                    <td className="px-5 py-3.5 font-medium">{leaveTypeLabel(row.leaveType)}</td>
                    <td className="px-4 py-3.5">{formatDate(row.fromDate || row.startDate)}</td>
                    <td className="px-4 py-3.5">{formatDate(row.toDate || row.endDate)}</td>
                    <td className="px-4 py-3.5">{row.totalDays ?? inclusiveDays(row.fromDate, row.toDate)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusBadgeClass(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(row.createdAt)}</td>
                    <td className="max-w-[140px] truncate px-4 py-3.5 text-slate-500">{row.adminRemarks || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setDetail(row)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        {row.attachmentUrl ? (
                          <a href={resolveUploadUrl(row.attachmentUrl)} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Attachment">
                            <FileText className="h-4 w-4" />
                          </a>
                        ) : null}
                        {row.status === "PENDING" ? (
                          <>
                            <button type="button" onClick={() => onEdit(row)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50">
                              <PencilLine className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => onDelete(row)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              disabled={filters.page <= 1}
              className="rounded-xl border px-3 py-1.5 text-sm disabled:opacity-40"
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {filters.page} of {data.totalPages}
            </span>
            <button
              type="button"
              disabled={filters.page >= data.totalPages}
              className="rounded-xl border px-3 py-1.5 text-sm disabled:opacity-40"
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold text-slate-900">Leave details</h3>
              <button type="button" onClick={() => setDetail(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-500">ID</dt><dd className="font-medium">{detail.leaveDisplayId}</dd></div>
              <div><dt className="text-slate-500">Type</dt><dd>{leaveTypeLabel(detail.leaveType)}</dd></div>
              <div><dt className="text-slate-500">Dates</dt><dd>{formatDate(detail.fromDate)} – {formatDate(detail.toDate)} ({detail.totalDays} days)</dd></div>
              <div><dt className="text-slate-500">Reason</dt><dd className="whitespace-pre-wrap">{detail.reason}</dd></div>
              <div><dt className="text-slate-500">Status</dt><dd><span className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${statusBadgeClass(detail.status)}`}>{statusLabel(detail.status)}</span></dd></div>
              <div><dt className="text-slate-500">Admin remarks</dt><dd>{detail.adminRemarks || "—"}</dd></div>
              {detail.attachmentUrl ? (
                <div><dt className="text-slate-500">Attachment</dt><dd><a className="text-brand-600 underline" href={resolveUploadUrl(detail.attachmentUrl)} target="_blank" rel="noreferrer">Download</a></dd></div>
              ) : null}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
