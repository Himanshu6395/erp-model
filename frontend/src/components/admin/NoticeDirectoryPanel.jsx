import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BellRing, CalendarClock, Eye, PencilLine, Search, Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

const AUDIENCES = [
  { value: "STUDENTS", label: "Students" },
  { value: "TEACHERS", label: "Teachers" },
  { value: "BOTH", label: "Both" },
];

function priorityBadge(priority) {
  if (priority === "HIGH") return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  if (priority === "MEDIUM") return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
}

function statusBadge(status) {
  return status === "PUBLISHED"
    ? "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200"
    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function NoticeDirectoryPanel() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ targetAudience: "", status: "", from: "", to: "", query: "" });

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(filters.targetAudience ? { targetAudience: filters.targetAudience } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
      };
      const data = await adminService.listNotices(params);
      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters.from, filters.status, filters.targetAudience, filters.to]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const filteredNotices = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    if (!query) return list;
    return list.filter((row) => {
      const haystack = [
        row.title,
        row.description,
        row.message,
        row.noticeType,
        row.targetAudience,
        row.status,
        row.priority,
        row.classId?.name,
        row.classId?.section,
        row.section,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters.query, list]);

  const remove = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await adminService.deleteNotice(id);
      toast.success("Notice deleted");
      loadList();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-700">Notice directory</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">All notices</h2>
          <p className="mt-1 text-sm text-slate-500">Search, review, edit, or remove published and draft notices from a dedicated directory tab.</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-11"
            placeholder="Search title, audience, class, type"
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <select className="input" value={filters.targetAudience} onChange={(event) => setFilters((current) => ({ ...current, targetAudience: event.target.value }))}>
          <option value="">All audiences</option>
          {AUDIENCES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select className="input" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <input className="input" type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
        <input className="input" type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={() => setFilters({ targetAudience: "", status: "", from: "", to: "", query: "" })}
        >
          Reset filters
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          {loading ? "Refreshing" : `${filteredNotices.length} listed`}
        </div>
        <div className="rounded-2xl bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
          {filteredNotices.filter((item) => item.status === "PUBLISHED").length} published
        </div>
        <div className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
          {filteredNotices.filter((item) => item.priority === "HIGH").length} high priority
        </div>
      </div>

      {filteredNotices.length ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filteredNotices.map((row) => (
            <article key={row._id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <BellRing className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-950">{row.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${priorityBadge(row.priority)}`}>
                        {row.priority}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{row.noticeType} notice</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{row.description || row.message}</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Audience</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{row.targetAudience}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Academic group</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {row.classId?.name ? `${row.classId.name} - ${row.classId.section || ""}` : "All classes"}
                    {row.section ? ` • Section ${row.section}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {row.publishDate ? new Date(row.publishDate).toLocaleString() : "Immediate publish"}
                </span>
                {row.attachmentUrl ? (
                  <a
                    href={resolveUploadUrl(row.attachmentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-brand-700 transition hover:text-brand-800 hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {row.attachmentOriginalName || "View attachment"}
                  </a>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                  onClick={() => navigate("/admin/notices/create", { state: { noticeId: row._id } })}
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
                  onClick={() => remove(row._id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-700">No notices match the current filters.</p>
          <p className="mt-2 text-sm text-slate-500">Create a new notice from the create tab or reset filters to view the full directory.</p>
        </div>
      )}
    </section>
  );
}

export default NoticeDirectoryPanel;
