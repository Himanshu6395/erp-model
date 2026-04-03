import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarClock,
  Filter,
  Layers,
  RefreshCw,
  School,
  Sparkles,
} from "lucide-react";
import Loader from "../../components/Loader";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [extendDays, setExtendDays] = useState(30);
  const [extendTargetId, setExtendTargetId] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlanId, setFilterPlanId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [subs, planRows] = await Promise.all([superAdminOpsService.getSubscriptions(), superAdminOpsService.getPlans()]);
      setRows(subs);
      setPlans(planRows);
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
    const active = rows.filter((r) => r.status === "ACTIVE").length;
    const trial = rows.filter((r) => r.status === "TRIAL").length;
    return { total: rows.length, active, trial };
  }, [rows]);

  const filtersActive = Boolean(filterSearch.trim() || filterStatus || filterPlanId);

  const filteredRows = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterPlanId && (r.planId?._id || r.planId) !== filterPlanId) return false;
      if (q) {
        const name = (r.schoolId?.name || "").toLowerCase();
        const planName = (r.planId?.name || "").toLowerCase();
        if (!name.includes(q) && !planName.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filterSearch, filterStatus, filterPlanId]);

  const clearFilters = () => {
    setFilterSearch("");
    setFilterStatus("");
    setFilterPlanId("");
  };

  const doChangePlan = async () => {
    if (!selectedSubscription || !selectedPlan) return;
    try {
      await superAdminOpsService.changeSubscriptionPlan(selectedSubscription, selectedPlan);
      toast.success("Plan changed");
      setSelectedSubscription(null);
      setSelectedPlan("");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const doExtend = async (subscriptionId) => {
    const id = subscriptionId || extendTargetId;
    if (!id) {
      toast.error("Select a subscription to extend.");
      return;
    }
    try {
      await superAdminOpsService.extendSubscription(id, Number(extendDays || 30));
      toast.success("Subscription extended");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusBadge = (status) => {
    const map = {
      ACTIVE: "bg-emerald-100 text-emerald-800 ring-emerald-200/60",
      TRIAL: "bg-sky-100 text-sky-800 ring-sky-200/60",
      EXPIRED: "bg-rose-100 text-rose-800 ring-rose-200/60",
      CANCELLED: "bg-slate-100 text-slate-700 ring-slate-200/80",
    };
    return map[status] || "bg-slate-100 text-slate-700 ring-slate-200/80";
  };

  if (loading) return <Loader text="Loading subscriptions..." />;

  return (
    <div className="w-full max-w-7xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-indigo-900/20 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-100/90">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Lifecycle
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Subscriptions</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
              One row per school. Filter the grid, change plans in bulk from the panel below, or extend end dates without leaving
              this screen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <School className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total subscriptions</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Layers className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-800">{summary.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-brand-600 text-white shadow-md">
              <CalendarClock className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">In trial</p>
              <p className="text-2xl font-bold tabular-nums text-sky-800">{summary.trial}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-brand-600 text-white shadow-sm">
                <Filter className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Filters</h2>
                <p className="text-xs text-slate-500">Narrow the subscription list (client-side)</p>
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
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Search</label>
              <input
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                placeholder="School or plan name…"
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
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Plan</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={filterPlanId}
                onChange={(e) => setFilterPlanId(e.target.value)}
              >
                <option value="">All plans</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredRows.length}</span> of {rows.length} subscriptions
            {filtersActive ? " (filtered)" : ""}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100/80 to-slate-50/90 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5 sm:px-6">School</th>
                <th className="py-3.5 pr-4">Plan</th>
                <th className="py-3.5 pr-4">Start</th>
                <th className="py-3.5 pr-4">End</th>
                <th className="py-3.5 pr-4">Status</th>
                <th className="px-5 py-3.5 text-right sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr key={row._id} className="transition-colors hover:bg-violet-50/40">
                  <td className="px-5 py-4 font-semibold text-slate-900 sm:px-6">{row.schoolId?.name || "—"}</td>
                  <td className="py-4 pr-4 text-slate-700">{row.planId?.name || "—"}</td>
                  <td className="py-4 pr-4 tabular-nums text-slate-600">
                    {row.startDate ? new Date(row.startDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-4 pr-4 tabular-nums text-slate-600">
                    {row.endDate ? new Date(row.endDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/50"
                        onClick={() => {
                          setSelectedSubscription(row._id);
                          setSelectedPlan(row.planId?._id || "");
                        }}
                      >
                        Change plan
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-gradient-to-r from-cyan-600 to-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-700 hover:to-brand-700"
                        onClick={() => {
                          setExtendTargetId(row._id);
                          doExtend(row._id);
                        }}
                      >
                        Extend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredRows.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8">
                      <Layers className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.25} aria-hidden />
                      <p className="mt-3 font-semibold text-slate-800">No subscriptions match</p>
                      <p className="mt-1 text-sm text-slate-500">Clear filters or refresh after onboarding schools.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md ring-1 ring-slate-100/90">
          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-500/10 via-purple-50/50 to-transparent px-5 py-4 sm:px-6">
            <h3 className="text-base font-bold text-slate-900">Change plan</h3>
            <p className="mt-1 text-xs text-slate-600">Select a subscription and target catalog plan, then apply.</p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Subscription</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={selectedSubscription || ""}
                onChange={(e) => setSelectedSubscription(e.target.value)}
              >
                <option value="">Choose subscription…</option>
                {rows.map((row) => (
                  <option key={row._id} value={row._id}>
                    {row.schoolId?.name} — {row.planId?.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">New plan</label>
              <select className="input w-full rounded-xl py-2.5 text-sm shadow-sm" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                <option value="">Choose plan…</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn-primary w-full rounded-xl py-2.5 text-sm font-bold shadow-md sm:w-auto" onClick={doChangePlan}>
              Apply plan change
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md ring-1 ring-slate-100/90">
          <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-500/10 via-brand-50/40 to-transparent px-5 py-4 sm:px-6">
            <h3 className="text-base font-bold text-slate-900">Extend subscription</h3>
            <p className="mt-1 text-xs text-slate-600">Push the end date forward by a number of days.</p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Subscription</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={extendTargetId}
                onChange={(e) => setExtendTargetId(e.target.value)}
              >
                <option value="">Choose subscription…</option>
                {rows.map((row) => (
                  <option key={row._id} value={row._id}>
                    {row.schoolId?.name} — ends {row.endDate ? new Date(row.endDate).toLocaleDateString() : "—"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Days to add</label>
              <input
                className="input w-full max-w-[200px] rounded-xl py-2.5 text-sm shadow-sm"
                type="number"
                min={1}
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-700 hover:to-brand-700 sm:w-auto"
              onClick={() => doExtend()}
            >
              Extend end date
            </button>
            <p className="text-xs text-slate-500">You can also use the per-row <strong>Extend</strong> action in the table.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionsPage;
