import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Eye, MapPin, Plus, School, Sparkles, Trash2 } from "lucide-react";
import Loader from "../../components/Loader";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import ConfirmDeleteModal from "../../components/superAdmin/ConfirmDeleteModal";
import FilterField from "../../components/superAdmin/FilterField";
import SuperAdminFilterMenu from "../../components/superAdmin/SuperAdminFilterMenu";
import { superAdminService } from "../../services/superAdminService";
import { SA_SELECT_WITH_H, SA_TABLE_HEAD, countActiveFilters } from "./superAdminUi";

function SchoolsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [draft, setDraft] = useState({
    search: "",
    schoolType: "",
    board: "",
    status: "",
    limit: "10",
  });

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

  const fetchSchools = useCallback(async () => {
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
  }, [page, limit, search, schoolType, board, status]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const filterBadgeCount = countActiveFilters({ search, schoolType, board, status });
  const activeOnPage = schools.filter((s) => s.isActive !== false).length;
  const blockedCount = schools.filter((s) => s.security?.isBlocked).length;

  const syncDraftFromUrl = () => {
    setDraft({
      search,
      schoolType,
      board,
      status,
      limit: String(limit),
    });
  };

  const applyFilters = () => {
    updateQuery({
      search: draft.search.trim(),
      schoolType: draft.schoolType,
      board: draft.board,
      status: draft.status,
      limit: draft.limit,
      page: 1,
    });
  };

  const clearFilters = () => {
    setDraft({ search: "", schoolType: "", board: "", status: "", limit: String(limit) });
    setSearchParams({ limit: String(limit), page: "1" });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await superAdminService.deleteSchoolById(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchSchools();
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <div className="w-full max-w-7xl space-y-6 pb-6">
      <header className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500" aria-hidden />
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-800">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden />
                Tenant directory
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Schools</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Search, filter, and manage every school on the platform. Open a row to edit profile, subscription, and
                security settings.
              </p>
            </div>
            <Link
              to="/super-admin/create-school"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New school
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-600" aria-hidden />
          <p className="pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Total (filtered)</p>
          <p className="mt-1 pl-3 text-2xl font-bold tabular-nums text-slate-900">{pagination.total}</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" aria-hidden />
          <p className="pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">On this page · active</p>
          <p className="mt-1 pl-3 text-2xl font-bold tabular-nums text-slate-900">
            {activeOnPage}
            <span className="text-base font-medium text-slate-400"> / {schools.length}</span>
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" aria-hidden />
          <p className="pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Blocked (page)</p>
          <p className="mt-1 pl-3 text-2xl font-bold tabular-nums text-slate-900">{blockedCount}</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400" aria-hidden />
          <p className="pl-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Pagination</p>
          <p className="mt-1 pl-3 text-2xl font-bold tabular-nums text-slate-900">
            {pagination.page}
            <span className="text-base font-medium text-slate-400"> / {pagination.pages}</span>
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{pagination.total}</span> schools
            {filterBadgeCount ? (
              <span className="text-slate-500">
                {" "}
                · {filterBadgeCount} filter{filterBadgeCount > 1 ? "s" : ""} applied
              </span>
            ) : null}
          </p>
          <SuperAdminFilterMenu
            activeCount={filterBadgeCount}
            onOpen={syncDraftFromUrl}
            onApply={applyFilters}
            onClear={clearFilters}
          >
            <div className="space-y-4">
              <FilterField label="Search">
                <SearchInput
                  value={draft.search}
                  onChange={(v) => setDraft((d) => ({ ...d, search: v }))}
                  placeholder="Name, code, city…"
                />
              </FilterField>
              <FilterField label="School type">
                <select
                  className={SA_SELECT_WITH_H}
                  value={draft.schoolType}
                  onChange={(e) => setDraft((d) => ({ ...d, schoolType: e.target.value }))}
                >
                  <option value="">All types</option>
                  <option value="Private">Private</option>
                  <option value="Government">Government</option>
                  <option value="Semi-Govt">Semi-Govt</option>
                </select>
              </FilterField>
              <FilterField label="Board">
                <select
                  className={SA_SELECT_WITH_H}
                  value={draft.board}
                  onChange={(e) => setDraft((d) => ({ ...d, board: e.target.value }))}
                >
                  <option value="">All boards</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB</option>
                </select>
              </FilterField>
              <FilterField label="Status">
                <select
                  className={SA_SELECT_WITH_H}
                  value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FilterField>
              <FilterField label="Rows per page">
                <select
                  className={SA_SELECT_WITH_H}
                  value={draft.limit}
                  onChange={(e) => setDraft((d) => ({ ...d, limit: e.target.value }))}
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </FilterField>
            </div>
          </SuperAdminFilterMenu>
        </div>

        {loading ? (
          <div className="px-6 py-16">
            <Loader text="Loading schools…" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={SA_TABLE_HEAD}>
                    <th className="px-5 py-3.5 pr-4 sm:px-6">School</th>
                    <th className="py-3.5 pr-4">Code</th>
                    <th className="hidden py-3.5 pr-4 md:table-cell">Location</th>
                    <th className="hidden py-3.5 pr-4 lg:table-cell">Type</th>
                    <th className="hidden py-3.5 pr-4 lg:table-cell">Board</th>
                    <th className="py-3.5 pr-4">Status</th>
                    <th className="px-5 py-3.5 pr-6 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schools.map((school) => {
                    const city = school.addressDetails?.city || "—";
                    const blocked = school.security?.isBlocked;
                    return (
                      <tr key={school._id} className="transition-colors hover:bg-slate-50/90">
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                              <Building2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{school.name}</p>
                              <p className="truncate text-xs text-slate-500 md:hidden">{city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800">
                            {school.code}
                          </code>
                        </td>
                        <td className="hidden py-4 pr-4 text-slate-600 md:table-cell">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                            {city}
                          </span>
                        </td>
                        <td className="hidden py-4 pr-4 text-slate-700 lg:table-cell">{school.basicInfo?.schoolType || "—"}</td>
                        <td className="hidden py-4 pr-4 text-slate-700 lg:table-cell">{school.basicInfo?.affiliationBoard || "—"}</td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-1.5">
                            {blocked ? (
                              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 ring-1 ring-rose-200/80">
                                Blocked
                              </span>
                            ) : null}
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                                school.isActive !== false
                                  ? "bg-emerald-50 text-emerald-800 ring-emerald-200/80"
                                  : "bg-slate-100 text-slate-600 ring-slate-200/80"
                              }`}
                            >
                              {school.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right sm:px-6">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <Link
                              to={`/super-admin/schools/${school._id}`}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
                              title="View school"
                            >
                              <Eye className="h-3.5 w-3.5 text-brand-600" aria-hidden />
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: school._id, name: school.name })}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50/50 text-rose-700 transition hover:bg-rose-100"
                              title={`Delete ${school.name}`}
                              aria-label={`Delete ${school.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!schools.length && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10">
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
          </>
        )}
      </div>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete school"
        itemName={deleteTarget?.name}
        message="All tenant data for this school will be permanently removed. This cannot be undone."
        confirmLabel="Delete school"
      />
    </div>
  );
}

export default SchoolsListPage;
