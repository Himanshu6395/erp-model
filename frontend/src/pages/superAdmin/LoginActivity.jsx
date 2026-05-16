import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LogIn, MonitorSmartphone, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import Loader from "../../components/Loader";
import ErpUserAvatar from "../../components/common/ErpUserAvatar";
import { useAuth } from "../../context/useAuth";
import FilterField from "../../components/superAdmin/FilterField";
import SuperAdminFilterMenu from "../../components/superAdmin/SuperAdminFilterMenu";
import { superAdminOpsService } from "../../services/superAdminOpsService";
import { SA_INPUT_WITH_H, SA_SELECT_WITH_H, countActiveFilters } from "./superAdminUi";
import { usePlatformSettings } from "../../hooks/usePlatformSettings";

const initialFilters = { from: "", to: "", role: "", status: "" };

function LoginActivityPage() {
  const { formatDateTime } = usePlatformSettings();
  const { user } = useAuth();
  const superAdminProfile = useSelector((s) => s.superAdminProfile);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);

  const load = async (nextFilters = applied) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(nextFilters).filter(([, v]) => v));
      setRows(await superAdminOpsService.getLoginActivity(params));
      setApplied(nextFilters);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(initialFilters);
  }, []);

  const summary = useMemo(() => {
    const success = rows.filter((r) => r.status === "SUCCESS").length;
    const failed = rows.filter((r) => r.status === "FAILED").length;
    return { total: rows.length, success, failed };
  }, [rows]);

  const filtersDirty = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(applied),
    [filters, applied]
  );

  const filterBadgeCount = useMemo(() => countActiveFilters(applied), [applied]);

  const syncDraft = () => setFilters(applied);
  const applyFilters = () => load(filters);

  const clearFilters = () => {
    setFilters(initialFilters);
    load(initialFilters);
  };

  return (
    <div className="w-full max-w-7xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-900 px-6 py-8 text-white shadow-xl shadow-indigo-950/25 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden />
        <div className="relative min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-100/90">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            Audit
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Login activity</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
            Authentication events across tenants. Use filters to constrain by window, role, or outcome—then apply to query the
            server.
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
              <LogIn className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Events (this result)</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Successful</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-800">{summary.success}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md">
              <XCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Failed</p>
              <p className="text-2xl font-bold tabular-nums text-rose-800">{summary.failed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-100/90">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{summary.total}</span> events
            {filterBadgeCount ? <span className="text-slate-500"> · filtered</span> : null}
            {filtersDirty ? <span className="ml-2 text-amber-700">· unapplied changes</span> : null}
          </p>
          <SuperAdminFilterMenu activeCount={filterBadgeCount} onOpen={syncDraft} onApply={applyFilters} onClear={clearFilters}>
            <div className="space-y-4">
              <FilterField label="From date">
                <input type="date" className={SA_INPUT_WITH_H} value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
              </FilterField>
              <FilterField label="To date">
                <input type="date" className={SA_INPUT_WITH_H} value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
              </FilterField>
              <FilterField label="Role">
                <input className={SA_INPUT_WITH_H} placeholder="e.g. school_admin" value={filters.role} onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))} />
              </FilterField>
              <FilterField label="Status">
                <select className={SA_SELECT_WITH_H} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                  <option value="">All outcomes</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                </select>
              </FilterField>
            </div>
          </SuperAdminFilterMenu>
        </div>

        {loading ? (
          <div className="py-16">
            <Loader text="Loading activity…" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] table-fixed border-separate border-spacing-0 text-sm">
              <colgroup>
                <col className="w-[17%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[9%]" />
                <col className="w-[30%]" />
                <col className="w-[15%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100/80 to-slate-50/90 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-3.5 sm:px-6">User</th>
                  <th className="py-3.5 pr-3">Role</th>
                  <th className="py-3.5 pr-3">School</th>
                  <th className="py-3.5 pr-3">IP</th>
                  <th className="py-3.5 pr-3">Device</th>
                  <th className="py-3.5 pr-3">Time</th>
                  <th className="px-5 py-3.5 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const rowName = row.userId?.name || row.email || "—";
                  const isCurrentSuperAdmin =
                    row.role === "SUPER_ADMIN" &&
                    (row.userId?.email === user?.email || row.email === user?.email);
                  const rowAvatar = isCurrentSuperAdmin ? superAdminProfile.avatarUrl : "";

                  return (
                  <tr key={row._id} className="transition-colors hover:bg-indigo-50/40">
                    <td className="min-w-0 overflow-hidden px-5 py-4 align-top sm:px-6">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <ErpUserAvatar
                          src={rowAvatar}
                          name={rowName}
                          email={row.email || row.userId?.email}
                          size={36}
                          className="shrink-0"
                        />
                        <span className="truncate font-semibold text-slate-900" title={rowName}>
                          {rowName}
                        </span>
                      </div>
                    </td>
                    <td className="min-w-0 overflow-hidden py-4 pr-3 align-top">
                      <span className="inline-block max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                        {row.role || "—"}
                      </span>
                    </td>
                    <td className="min-w-0 overflow-hidden py-4 pr-3 align-top text-slate-700">
                      <span className="block truncate" title={row.schoolId?.name || ""}>
                        {row.schoolId?.name || "—"}
                      </span>
                    </td>
                    <td className="min-w-0 overflow-hidden py-4 pr-3 align-top font-mono text-xs text-slate-600">
                      <span className="block truncate" title={row.ipAddress || ""}>
                        {row.ipAddress || "—"}
                      </span>
                    </td>
                    <td className="min-w-0 overflow-hidden py-4 pr-3 align-top">
                      <div className="flex min-w-0 max-w-full items-center gap-1.5">
                        <MonitorSmartphone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-slate-600" title={row.device || ""}>
                          {row.device || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="min-w-0 whitespace-nowrap py-4 pr-3 align-top tabular-nums text-slate-600">
                      {formatDateTime(row.timestamp)}
                    </td>
                    <td className="min-w-0 whitespace-nowrap px-5 py-4 align-top sm:px-6">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${
                          row.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800 ring-emerald-200/60"
                            : "bg-rose-100 text-rose-800 ring-rose-200/60"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8">
                        <LogIn className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.25} aria-hidden />
                        <p className="mt-3 font-semibold text-slate-800">No events</p>
                        <p className="mt-1 text-sm text-slate-500">Broaden the date range or clear filters and apply again.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginActivityPage;
