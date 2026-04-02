import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import StatCard from "../../components/StatCard";
import { teacherService } from "../../services/teacherService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

function statusClass(s) {
  if (s === "APPROVED") return "bg-emerald-100 text-emerald-800";
  if (s === "REJECTED") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-900";
}

function buildParams(filters) {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.search.trim()) params.search = filters.search.trim();
  return params;
}

function TeacherStudentLeavesPage() {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    from: "",
    to: "",
    search: "",
  });
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [acting, setActing] = useState(false);

  const refresh = async (f = filters) => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        teacherService.getStudentLeaveStats(),
        teacherService.getStudentLeaves(buildParams(f)),
      ]);
      setStats(s);
      setRows(r);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  const openDetail = (row) => {
    setSelected(row);
    setRemarks("");
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
      await refresh(filters);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student leave approvals</h1>
        <p className="text-sm text-gray-600">Only students in classes where you are the class teacher appear here.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total requests" value={stats?.total ?? "—"} subtitle="All time" />
        <StatCard title="Pending" value={stats?.pending ?? "—"} subtitle="Awaiting your action" />
        <StatCard title="Approved" value={stats?.approved ?? "—"} subtitle="Approved by you" />
        <StatCard title="Rejected" value={stats?.rejected ?? "—"} subtitle="Rejected by you" />
      </div>

      <FormCard title="Filters" subtitle="Narrow down by status, overlapping date range, or student name.">
        <div className="flex flex-wrap gap-3">
          <select
            className="input w-44"
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <input
            type="date"
            className="input w-40"
            value={filters.from}
            onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
          />
          <input
            type="date"
            className="input w-40"
            value={filters.to}
            onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
          />
          <input
            className="input min-w-[200px] flex-1"
            placeholder="Student name"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
          />
          <button type="button" className="btn-secondary" onClick={() => refresh(filters)}>
            Apply filters
          </button>
        </div>
      </FormCard>

      <FormCard title="Requests" subtitle={loading ? "Loading…" : `${rows.length} record(s)`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2 pr-3">Leave ID</th>
                <th className="py-2 pr-3">Student</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">From – To</th>
                <th className="py-2 pr-3">Days</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Applied</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-mono text-xs">{r.leaveDisplayId}</td>
                  <td className="py-2 pr-3">{r.studentId?.userId?.name || "—"}</td>
                  <td className="py-2 pr-3">{r.leaveType}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 pr-3">{r.totalDays}</td>
                  <td className="py-2 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(r.status)}`}>
                      {r.status === "PENDING" ? "Pending" : r.status === "APPROVED" ? "Approved" : "Rejected"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-gray-600">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                  <td className="py-2">
                    <button type="button" className="text-sm font-semibold text-brand-600 hover:underline" onClick={() => openDetail(r)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !rows.length && <p className="py-6 text-center text-gray-500">No matching leave requests.</p>}
        </div>
      </FormCard>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Leave details</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Leave ID</dt>
                <dd className="font-mono">{selected.leaveDisplayId}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Student</dt>
                <dd>{selected.studentId?.userId?.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Class / section</dt>
                <dd>
                  {selected.classId?.name} — {selected.studentId?.section || selected.classId?.section}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Type & dates</dt>
                <dd>
                  {selected.leaveType} · {new Date(selected.fromDate).toLocaleDateString()} –{" "}
                  {new Date(selected.toDate).toLocaleDateString()} ({selected.totalDays} days)
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Reason</dt>
                <dd className="whitespace-pre-wrap text-gray-800">{selected.reason || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Parent / contact</dt>
                <dd>
                  {selected.parentName} · {selected.contactPhone}
                </dd>
              </div>
              {selected.attachmentUrl ? (
                <div>
                  <dt className="text-gray-500">Attachment</dt>
                  <dd>
                    <a href={resolveUploadUrl(selected.attachmentUrl)} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                      Open file
                    </a>
                  </dd>
                </div>
              ) : null}
              {selected.status !== "PENDING" && (
                <div>
                  <dt className="text-gray-500">Your previous remarks</dt>
                  <dd>{selected.teacherRemarks || "—"}</dd>
                </div>
              )}
            </dl>

            {selected.status === "PENDING" && (
              <>
                <label className="mt-4 block text-sm">
                  <span className="font-medium text-gray-700">Teacher remarks</span>
                  <span className="text-gray-500"> (required if rejecting)</span>
                  <textarea
                    className="input mt-1 min-h-[80px] w-full"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional note for approval; required when rejecting."
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="btn-primary" disabled={acting} onClick={() => decide("APPROVE")}>
                    Approve leave
                  </button>
                  <button type="button" className="btn-secondary border-red-200 text-red-700" disabled={acting} onClick={() => decide("REJECT")}>
                    Reject leave
                  </button>
                  <button type="button" className="btn-secondary ml-auto" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
              </>
            )}

            {selected.status !== "PENDING" && (
              <button type="button" className="btn-secondary mt-6 w-full" onClick={() => setSelected(null)}>
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherStudentLeavesPage;
