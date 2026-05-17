import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BadgeIndianRupee, CheckCircle2, ShieldMinus } from "lucide-react";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryEmptyState, LibraryPageHero, LibrarySectionCard, LibraryStatusBadge, formatLibraryDate } from "./libraryShared";

function LibraryFineManagementPage() {
  const [loading, setLoading] = useState(true);
  const [fines, setFines] = useState([]);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const fineRes = await adminService.getLibraryFines({ page: 1, limit: 100 });
      setFines(fineRes?.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const payFine = async (fineId) => {
    setBusyId(fineId);
    try {
      await adminService.payLibraryFine(fineId);
      toast.success("Fine marked as paid");
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  const waiveFine = async (fineId) => {
    setBusyId(fineId);
    try {
      await adminService.waiveLibraryFine(fineId);
      toast.success("Fine waived");
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <Loader text="Loading fine records..." />;

  return (
    <div className="space-y-6">
      <LibraryPageHero
        badge="Penalty center"
        title="Fine management"
        subtitle="Track overdue charges, payment state, waived cases, and student liability across the library cycle."
      />

      <LibrarySectionCard title="Fine ledger" subtitle="Every overdue fine generated from the return flow appears here for settlement.">
        {!fines.length ? (
          <LibraryEmptyState title="No fines recorded" message="Overdue returns will automatically generate payable fine records." />
        ) : (
          <div className="space-y-4">
            {fines.map((fine) => (
              <div key={fine._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{fine.bookId?.title || "Book"}</p>
                      <LibraryStatusBadge status={fine.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {fine.studentId?.userId?.name || "Student"} • {fine.studentId?.classId?.name || ""} / {fine.studentId?.section || ""}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Overdue by {fine.daysOverdue || 0} day(s) • Raised {formatLibraryDate(fine.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fine amount</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">Rs {fine.amount || 0}</p>
                    <p className="mt-1 text-xs text-slate-500">{fine.reason || "Overdue return"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {fine.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => payFine(fine._id)}
                          disabled={busyId === fine._id}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark paid
                        </button>
                        <button
                          type="button"
                          onClick={() => waiveFine(fine._id)}
                          disabled={busyId === fine._id}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                        >
                          <ShieldMinus className="h-4 w-4" />
                          Waive
                        </button>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                        <BadgeIndianRupee className="h-4 w-4" />
                        {fine.status === "PAID" ? `Paid on ${formatLibraryDate(fine.paidAt)}` : "Waived"}
                      </div>
                    )}
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

export default LibraryFineManagementPage;
