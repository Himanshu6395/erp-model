import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCcw } from "lucide-react";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryEmptyState, LibraryPageHero, LibrarySectionCard, LibraryStatusBadge, formatLibraryDate } from "./libraryShared";

function LibraryReturnBooksPage() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [returnNotes, setReturnNotes] = useState({});
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const issueRes = await adminService.getLibraryIssues({ page: 1, limit: 100 });
      setIssues((issueRes?.data || []).filter((item) => ["ISSUED", "OVERDUE"].includes(item.computedStatus || item.status)));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const returnBook = async (issueId) => {
    setBusyId(issueId);
    try {
      const result = await adminService.returnLibraryBook(issueId, { returnNote: returnNotes[issueId] || "" });
      if (result?.fineRecord?.amount) toast.success(`Returned with Rs ${result.fineRecord.amount} fine`);
      else toast.success("Book returned");
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <Loader text="Loading return queue..." />;

  return (
    <div className="space-y-6">
      <LibraryPageHero
        badge="Returns & recovery"
        title="Return books and close borrowing cycles"
        subtitle="Process book returns, detect overdue items, and automatically create fines when due dates are missed."
      />

      <LibrarySectionCard title="Return queue" subtitle="Books that are still out with students and waiting to be checked back in.">
        {!issues.length ? (
          <LibraryEmptyState title="No active returns pending" message="All issued books are already settled right now." />
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{issue.bookSnapshot?.title || issue.bookId?.title}</p>
                      <LibraryStatusBadge status={issue.computedStatus || issue.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {issue.studentSnapshot?.name} • {issue.studentSnapshot?.className} / {issue.studentSnapshot?.section} • Roll {issue.studentSnapshot?.rollNumber}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Issued {formatLibraryDate(issue.issueDate)} • Due {formatLibraryDate(issue.dueDate)} • Overdue {issue.overdueDays || 0} day(s)
                    </p>
                  </div>
                  <textarea
                    className="input min-h-24 w-full rounded-2xl py-3 shadow-sm"
                    placeholder="Optional return note"
                    value={returnNotes[issue._id] || ""}
                    onChange={(e) => setReturnNotes((prev) => ({ ...prev, [issue._id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => returnBook(issue._id)}
                    disabled={busyId === issue._id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {busyId === issue._id ? "Processing..." : "Return book"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </LibrarySectionCard>
    </div>
  );
}

export default LibraryReturnBooksPage;
