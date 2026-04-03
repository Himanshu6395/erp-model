import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Ban, Filter, MapPin, ShieldAlert, Sparkles } from "lucide-react";
import Loader from "../../components/Loader";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function BlockedSchoolsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSearch, setFilterSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await superAdminOpsService.getBlockedSchools();
      setRows(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const name = (row.basicInfo?.schoolName || row.name || "").toLowerCase();
      const code = (row.basicInfo?.schoolCode || row.code || "").toLowerCase();
      const city = (row.addressDetails?.city || "").toLowerCase();
      return name.includes(q) || code.includes(q) || city.includes(q);
    });
  }, [rows, filterSearch]);

  const unblock = async (schoolId) => {
    try {
      await superAdminOpsService.unblockSchool(schoolId);
      toast.success("School unblocked");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatLocation = (row) => {
    const parts = [row.addressDetails?.city, row.addressDetails?.state].filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
  };

  if (loading) return <Loader text="Loading blocked schools…" />;

  return (
    <div className="w-full max-w-7xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950 via-slate-900 to-violet-950 px-6 py-8 text-white shadow-xl shadow-rose-950/25 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-rose-500/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" aria-hidden />
        <div className="relative min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-rose-100/90">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            Enforcement
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Blocked schools</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
            Tenants with an active security block. Search locally by name, code, or city; unblock restores access per API rules.
          </p>
        </div>
      </section>

      <div className="rounded-xl border border-rose-200/60 bg-gradient-to-r from-rose-50/80 to-white p-4 shadow-sm ring-1 ring-rose-100/50 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md">
            <Ban className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800/80">Queue depth</p>
            <p className="text-2xl font-bold tabular-nums text-slate-900">{rows.length}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 text-white shadow-sm">
              <Filter className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Filter list</h2>
              <p className="text-xs text-slate-500">Client-side search on this page</p>
            </div>
          </div>
          <div className="mt-4 max-w-md">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Search</label>
            <input
              className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
              placeholder="School name, code, or city…"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {rows.length} blocked schools.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100/80 to-slate-50/90 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5 sm:px-6">School</th>
                <th className="py-3.5 pr-4">Location</th>
                <th className="py-3.5 pr-4">Admin</th>
                <th className="py-3.5 pr-4">Reason</th>
                <th className="py-3.5 pr-4">Blocked at</th>
                <th className="py-3.5 pr-4">Status</th>
                <th className="px-5 py-3.5 text-right sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row._id} className="transition-colors hover:bg-rose-50/40">
                  <td className="px-5 py-4 sm:px-6">
                    <p className="font-semibold text-slate-900">{row.basicInfo?.schoolName || row.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.7rem]">{row.basicInfo?.schoolCode || row.code}</code>
                    </p>
                  </td>
                  <td className="py-4 pr-4 text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      {formatLocation(row)}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="font-medium text-slate-800">{row.schoolAdmin?.adminName || "—"}</p>
                    <p className="text-xs text-slate-500">{row.schoolAdmin?.adminEmail || ""}</p>
                  </td>
                  <td className="max-w-[200px] py-4 pr-4 text-slate-600">
                    <span className="line-clamp-2">{row.security?.blockedReason || "—"}</span>
                  </td>
                  <td className="py-4 pr-4 tabular-nums text-slate-600">
                    {row.security?.blockedAt ? new Date(row.security.blockedAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-4 pr-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 ring-1 ring-rose-200/60">
                      <ShieldAlert className="h-3 w-3" aria-hidden />
                      Blocked
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => unblock(row._id)}
                      className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-teal-700"
                    >
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8">
                      <Ban className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.25} aria-hidden />
                      <p className="mt-3 font-semibold text-slate-800">{rows.length ? "No matches" : "No blocked schools"}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {rows.length ? "Try a different search." : "Great — no tenants are currently blocked."}
                      </p>
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

export default BlockedSchoolsPage;
