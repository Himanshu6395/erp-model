import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Banknote, Coins, Filter, Sparkles, Wallet } from "lucide-react";
import Loader from "../../components/Loader";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setPayments(await superAdminOpsService.getPayments());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const paid = payments.filter((p) => p.status === "PAID");
    const totalPaid = paid.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    return { count: payments.length, paidCount: paid.length, totalPaid };
  }, [payments]);

  const filtered = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return payments.filter((row) => {
      if (filterStatus && row.status !== filterStatus) return false;
      if (filterMethod && row.method !== filterMethod) return false;
      if (q) {
        const name = (row.schoolId?.name || "").toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [payments, filterStatus, filterMethod, filterSearch]);

  const methods = useMemo(() => {
    const set = new Set(payments.map((p) => p.method).filter(Boolean));
    return Array.from(set);
  }, [payments]);

  const filtersActive = Boolean(filterStatus || filterMethod || filterSearch.trim());

  const clearFilters = () => {
    setFilterStatus("");
    setFilterMethod("");
    setFilterSearch("");
  };

  if (loading) return <Loader text="Loading payments..." />;

  return (
    <div className="w-full max-w-7xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-emerald-950/20 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />
        <div className="relative min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-100/90">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            Finance
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Payments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
            Platform settlement records. Filter locally by school name, method, or status to audit receipts quickly.
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <Wallet className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Records</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{summary.count}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Banknote className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Paid count</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-800">{summary.paidCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Coins className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Paid total</p>
              <p className="text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
                ₹{summary.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-brand-600 text-white shadow-sm">
                <Filter className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Filters</h2>
                <p className="text-xs text-slate-500">Refine the ledger view on this device</p>
              </div>
            </div>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearFilters}
                className="self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Clear all
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">School</label>
              <input
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                placeholder="Search by school name…"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Method</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
              >
                <option value="">All methods</option>
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {payments.length} rows
            {filtersActive ? " (filtered)" : ""}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100/80 to-slate-50/90 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5 sm:px-6">School</th>
                <th className="py-3.5 pr-4">Amount</th>
                <th className="py-3.5 pr-4">Method</th>
                <th className="py-3.5 pr-4">Date</th>
                <th className="px-5 py-3.5 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row._id} className="transition-colors hover:bg-emerald-50/40">
                  <td className="px-5 py-4 font-semibold text-slate-900 sm:px-6">{row.schoolId?.name || "—"}</td>
                  <td className="py-4 pr-4 font-semibold tabular-nums text-slate-900">₹{Number(row.amount || 0).toLocaleString()}</td>
                  <td className="py-4 pr-4">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                      {row.method || "—"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 tabular-nums text-slate-600">{row.paidAt ? new Date(row.paidAt).toLocaleString() : "—"}</td>
                  <td className="px-5 py-4 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${
                        row.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800 ring-emerald-200/60"
                          : row.status === "FAILED"
                            ? "bg-rose-100 text-rose-800 ring-rose-200/60"
                            : "bg-slate-100 text-slate-700 ring-slate-200/80"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8">
                      <Wallet className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.25} aria-hidden />
                      <p className="mt-3 font-semibold text-slate-800">No payments match</p>
                      <p className="mt-1 text-sm text-slate-500">Adjust filters or record new settlements from subscriptions.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PaymentsPage;
