import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCheck, MessageSquareWarning, XCircle } from "lucide-react";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryEmptyState, LibraryPageHero, LibrarySectionCard, LibraryStatusBadge, formatLibraryDate } from "./libraryShared";

function LibraryStudentRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [notes, setNotes] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const requestRes = await adminService.getLibraryIssues({ page: 1, limit: 100, status: "REQUESTED" });
      setRequests(requestRes?.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (issueId) => {
    setBusyId(issueId);
    try {
      await adminService.approveLibraryRequest(issueId);
      toast.success("Request approved");
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  const reject = async (issueId) => {
    setBusyId(issueId);
    try {
      await adminService.rejectLibraryRequest(issueId, { rejectionReason: notes[issueId] || "Request rejected" });
      toast.success("Request rejected");
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <Loader text="Loading student requests..." />;

  return (
    <div className="space-y-6">
      <LibraryPageHero
        badge="Student request desk"
        title="Review student issue requests"
        subtitle="Approve or reject requests while seeing the student, class, book, and request note in one review stream."
      />

      <LibrarySectionCard title="Pending requests" subtitle="Student-raised borrowing requests waiting for librarian approval.">
        {!requests.length ? (
          <LibraryEmptyState title="No pending requests" message="Fresh student requests will appear here when they ask for a book." />
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_auto] xl:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{request.bookSnapshot?.title || request.bookId?.title}</p>
                      <LibraryStatusBadge status={request.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {request.studentSnapshot?.name} • Roll {request.studentSnapshot?.rollNumber} • {request.studentSnapshot?.className} / {request.studentSnapshot?.section}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Requested on {formatLibraryDate(request.createdAt)} • Due if approved {formatLibraryDate(request.dueDate)}
                    </p>
                    {request.requestNote ? (
                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <span className="mr-2 inline-flex items-center gap-1 font-semibold text-slate-900">
                          <MessageSquareWarning className="h-4 w-4" />
                          Student note:
                        </span>
                        {request.requestNote}
                      </div>
                    ) : null}
                  </div>
                  <textarea
                    className="input min-h-28 w-full rounded-2xl py-3 shadow-sm"
                    placeholder="Optional rejection reason"
                    value={notes[request._id] || ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [request._id]: e.target.value }))}
                  />
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button
                      type="button"
                      onClick={() => approve(request._id)}
                      disabled={busyId === request._id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(request._id)}
                      disabled={busyId === request._id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </LibrarySectionCard>
    </div>
  );
}

export default LibraryStudentRequestsPage;
