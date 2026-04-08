import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit3, Search, Trash2 } from "lucide-react";
import Pagination from "../../components/Pagination";
import { adminService } from "../../services/adminService";
import { getTransportItemMeta, getTransportItemTitle, transportModuleMap, transportModules } from "../../utils/transportConfig";

function RegisteredTransportPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleKey = searchParams.get("module") || transportModules[0].key;
  const activeModule = transportModuleMap[moduleKey] || transportModules[0];

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });

  const fetchRecords = async ({ page = 1, searchText = search, module = activeModule.key } = {}) => {
    setLoading(true);
    try {
      const data = await adminService.listTransportModule(module, {
        page,
        limit: 10,
        search: searchText || undefined,
      });
      setRecords(data.items || []);
      setPagination({
        page: data.page || page,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
        limit: data.limit || 10,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords({ page: 1, searchText: search, module: activeModule.key });
  }, [activeModule.key]);

  const handleModuleChange = (nextModuleKey) => {
    const next = new URLSearchParams(searchParams);
    next.set("module", nextModuleKey);
    next.delete("search");
    setSearch("");
    setSearchParams(next);
  };

  const handleSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.set("module", activeModule.key);
    if (search.trim()) next.set("search", search.trim());
    else next.delete("search");
    setSearchParams(next);
    fetchRecords({ page: 1, searchText: search, module: activeModule.key });
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm(`Delete this ${activeModule.singular}?`)) return;
    try {
      await adminService.deleteTransportModule(activeModule.key, itemId);
      toast.success(`${activeModule.singular} deleted`);
      fetchRecords({ page: pagination.page, searchText: search, module: activeModule.key });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-5">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cyan-700">Transport Directory</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">All transport records</h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse every transport dataset, switch modules quickly, and jump back into edit mode when needed.
          </p>
        </div>

        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {transportModules.map((module) => {
            const Icon = module.icon;
            const active = module.key === activeModule.key;
            return (
              <button
                key={module.key}
                type="button"
                onClick={() => handleModuleChange(module.key)}
                className={`inline-flex min-w-max items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {module.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder={activeModule.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
            />
          </div>
          <button className="btn-secondary shrink-0" type="button" onClick={handleSearch}>
            Search
          </button>
          <button
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
            type="button"
            onClick={() => navigate(`/admin/transport/create?module=${activeModule.key}`)}
          >
            Create {activeModule.singular}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {loading ? <div className="py-8 text-sm text-slate-500">Loading {activeModule.label.toLowerCase()}...</div> : null}

        {!loading && !records.length ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            No {activeModule.label.toLowerCase()} found.
          </div>
        ) : null}

        {!loading &&
          records.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-cyan-200 hover:bg-white"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-slate-950">{getTransportItemTitle(activeModule.key, item)}</h3>
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white">
                      {activeModule.label}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {getTransportItemMeta(activeModule.key, item).map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{value || "Pending"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 sm:w-auto"
                    type="button"
                    onClick={() =>
                      navigate(`/admin/transport/create?module=${activeModule.key}`, {
                        state: { moduleKey: activeModule.key, itemId: item._id },
                      })
                    }
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
                    type="button"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {!loading && pagination.total > 0 ? (
        <Pagination
          page={pagination.page}
          pages={pagination.totalPages}
          total={pagination.total}
          onPageChange={(page) => fetchRecords({ page, searchText: search, module: activeModule.key })}
        />
      ) : null}
    </section>
  );
}

export default RegisteredTransportPage;
