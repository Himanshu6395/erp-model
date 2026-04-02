import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My leave requests</h1>
          <p className="text-sm text-gray-600">Track status and teacher remarks. Alerts also appear under Notifications.</p>
        </div>
        <Link to="/student/leaves/apply" className="btn-primary w-fit text-sm">
          Apply for leave
        </Link>
      </div>

      <FormCard title="All applications" subtitle="Leave ID is a short reference for this request.">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="py-2 pr-3">Leave ID</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">From – To</th>
                  <th className="py-2 pr-3">Days</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Teacher remarks</th>
                  <th className="py-2 pr-3">Applied</th>
                  <th className="py-2">File</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className="border-b border-gray-100">
                    <td className="py-2 pr-3 font-mono text-xs">{r.leaveDisplayId || r._id}</td>
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
                    <td className="max-w-[200px] py-2 pr-3 text-gray-600">{r.teacherRemarks || "—"}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-gray-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="py-2">
                      {r.attachmentUrl ? (
                        <a
                          href={resolveUploadUrl(r.attachmentUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline"
                        >
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
            {!rows.length && <p className="py-6 text-center text-gray-500">No leave requests yet.</p>}
          </div>
        )}
      </FormCard>
    </div>
  );
}

export default StudentLeavesListPage;
