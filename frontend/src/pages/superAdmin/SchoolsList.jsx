import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Filter, MapPin, Plus, School, Sparkles } from "lucide-react";
import Loader from "../../components/Loader";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import { superAdminService } from "../../services/superAdminService";
import { debounce } from "../../utils/debounce";

function SchoolsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const schoolType = searchParams.get("schoolType") || "";
  const board = searchParams.get("board") || "";
  const status = searchParams.get("status") || "";

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (!next.get("limit")) next.set("limit", "10");
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateQuery({ search: value, page: 1 });
      }, 400),
    [searchParams.toString()]
  );

  useEffect(() => {
    debouncedSearch(searchInput);
    return () => debouncedSearch.cancel();
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const response = await superAdminService.getSchools({
          page,
          limit,
          search,
          schoolType,
          board,
          status,
        });
        setSchools(response.data || []);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          pages: response.pages || 1,
        });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, [page, limit, search, schoolType, board, status]);

  const filtersActive = Boolean(schoolType || board || status || search);
  const activeCount = schools.filter((s) => s.isActive !== false).length;

  if (loading) return <Loader text="Loading schools..." />;

  return (
    <div className="w-full max-w-7xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-indigo-900/20 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-100/90">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Directory
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Schools</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
              Search and filter every tenant on the platform. Use row actions to open a school&apos;s full profile and
              security context.
            </p>
          </div>
          <Link
            to="/super-admin/create-school"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-900 shadow-lg transition hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New school
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <School className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total (filtered)</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Building2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">This page · active</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">
                {schools.length}
                <span className="text-lg font-semibold text-slate-400"> · </span>
                <span className="text-lg font-semibold text-emerald-700">{activeCount}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-brand-600 text-white shadow-md">
              <Filter className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Page</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">
                {pagination.page}
                <span className="text-base font-medium text-slate-400"> / {pagination.pages}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1 max-w-xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Search</p>
              <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Name, code, city…" />
            </div>
            {filtersActive ? (
              <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/60">
                Filters applied
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">School type</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={schoolType}
                onChange={(e) => updateQuery({ schoolType: e.target.value, page: 1 })}
              >
                <option value="">All types</option>
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="Semi-Govt">Semi-Govt</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Board</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={board}
                onChange={(e) => updateQuery({ board: e.target.value, page: 1 })}
              >
                <option value="">All boards</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="IB">IB</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={status}
                onChange={(e) => updateQuery({ status: e.target.value, page: 1 })}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Rows per page</label>
              <select
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                value={limit}
                onChange={(e) => updateQuery({ limit: e.target.value, page: 1 })}
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-100/80 to-slate-50/90 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5 pr-4 sm:px-6">School</th>
                <th className="py-3.5 pr-4">Code</th>
                <th className="py-3.5 pr-4">Location</th>
                <th className="py-3.5 pr-4">Type</th>
                <th className="py-3.5 pr-4">Board</th>
                <th className="py-3.5 pr-4">Status</th>
                <th className="px-5 py-3.5 pr-6 text-right sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schools.map((school) => {
                const city = school.addressDetails?.city || "—";
                const blocked = school.security?.isBlocked;
                return (
                  <tr key={school._id} className="transition-colors hover:bg-violet-50/40">
                    <td className="px-5 py-4 font-semibold text-slate-900 sm:px-6">{school.name}</td>
                    <td className="py-4 pr-4">
                      <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">{school.code}</code>
                    </td>
                    <td className="py-4 pr-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        {city}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-700">{school.basicInfo?.schoolType || "—"}</td>
                    <td className="py-4 pr-4 text-slate-700">{school.basicInfo?.affiliationBoard || "—"}</td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {blocked ? (
                          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 ring-1 ring-rose-200/60">
                            Blocked
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                            school.isActive !== false
                              ? "bg-emerald-100 text-emerald-800 ring-emerald-200/60"
                              : "bg-slate-100 text-slate-700 ring-slate-200/80"
                          }`}
                        >
                          {school.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <Link
                        to={`/super-admin/schools/${school._id}`}
                        className="inline-flex items-center rounded-lg bg-gradient-to-r from-violet-600 to-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-700 hover:to-brand-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!schools.length && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-8">
                      <School className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.25} aria-hidden />
                      <p className="mt-3 font-semibold text-slate-800">No schools match</p>
                      <p className="mt-1 text-sm text-slate-500">Adjust search or filters, or provision a new tenant.</p>
                      <Link
                        to="/super-admin/create-school"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
                      >
                        Create school →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={(nextPage) => updateQuery({ page: nextPage })}
          />
        </div>
      </div>
    </div>
  );
}

export default SchoolsListPage;
