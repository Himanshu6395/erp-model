import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarDays, ClipboardList, Plus } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { resolveUploadUrl } from "../../utils/apiOrigin";
import { PageCard, PageHeader, DataTable, EmptyState, btnPrimary } from "./studentPageUi";

function statusClass(s) {
  if (s === "APPROVED") return "bg-emerald-100 text-emerald-800";
  if (s === "REJECTED") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-900";
}

function StudentLeavesListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setRows(await studentService.getLeaves());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Leave"
        title="My leave requests"
        subtitle="Track status and teacher remarks. Alerts also appear under Notifications."
        actions={
          <Link to="/student/leaves/apply" className={btnPrimary}>
            <Plus className="h-4 w-4" />
            Apply for leave
          </Link>
        }
      />

      <PageCard title="All applications" subtitle="Leave ID is a short reference for this request." icon={ClipboardList}>
        {loading ? (
          <Loader text="Loading leave requests…" />
        ) : !rows.length ? (
          <EmptyState icon={CalendarDays} title="No leave requests yet" message="Submit your first leave application to get started." />
        ) : (
          <DataTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Leave ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">From – To</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Teacher remarks</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3">File</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{r.leaveDisplayId || r._id}</td>
                    <td className="px-4 py-3 text-slate-800">{r.leaveType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-800">{r.totalDays}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(r.status)}`}>
                        {r.status === "PENDING" ? "Pending" : r.status === "APPROVED" ? "Approved" : "Rejected"}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-slate-600">{r.teacherRemarks || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.attachmentUrl ? (
                        <a href={resolveUploadUrl(r.attachmentUrl)} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </PageCard>
    </div>
  );
}

export default StudentLeavesListPage;
