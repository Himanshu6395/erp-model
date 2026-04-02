import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { adminService } from "../../services/adminService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

const TYPES = ["GENERAL", "URGENT", "EVENT", "HOLIDAY"];
const AUDIENCES = [
  { value: "STUDENTS", label: "Students" },
  { value: "TEACHERS", label: "Teachers" },
  { value: "BOTH", label: "Both" },
];
const PRIORITY = ["LOW", "MEDIUM", "HIGH"];
const STATUS = ["DRAFT", "PUBLISHED"];

function priorityBadge(p) {
  if (p === "HIGH") return "bg-red-100 text-red-800";
  if (p === "MEDIUM") return "bg-amber-100 text-amber-900";
  return "bg-emerald-100 text-emerald-800";
}

function emptyForm() {
  return {
    title: "",
    description: "",
    noticeType: "GENERAL",
    targetAudience: "BOTH",
    classId: "",
    section: "",
    publishDate: "",
    expiryDate: "",
    priority: "MEDIUM",
    status: "PUBLISHED",
    attachment: null,
  };
}

function NoticeManagementPage() {
  const [classes, setClasses] = useState([]);
  const [list, setList] = useState([]);
  const [filters, setFilters] = useState({ targetAudience: "", status: "", from: "", to: "" });
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadClasses = useCallback(async () => {
    try {
      setClasses(await adminService.getClasses());
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const loadList = useCallback(async () => {
    try {
      const params = {
        ...(filters.targetAudience ? { targetAudience: filters.targetAudience } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
      };
      setList(await adminService.listNotices(params));
    } catch (e) {
      toast.error(e.message);
    }
  }, [filters]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const appendFormFields = (fd) => {
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("noticeType", form.noticeType);
    fd.append("targetAudience", form.targetAudience);
    fd.append("classId", form.classId || "");
    fd.append("section", form.section || "");
    if (form.publishDate) fd.append("publishDate", new Date(form.publishDate).toISOString());
    if (form.expiryDate) fd.append("expiryDate", new Date(form.expiryDate).toISOString());
    fd.append("priority", form.priority);
    fd.append("status", form.status);
    if (form.attachment instanceof File) fd.append("attachment", form.attachment);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      appendFormFields(fd);
      if (editingId) {
        await adminService.updateNotice(editingId, fd);
        toast.success("Notice updated");
      } else {
        await adminService.createNotice(fd);
        toast.success("Notice created");
      }
      setForm(emptyForm());
      setEditingId(null);
      loadList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setForm({
      title: row.title || "",
      description: row.description || row.message || "",
      noticeType: row.noticeType || "GENERAL",
      targetAudience: row.targetAudience || "BOTH",
      classId: row.classId?._id || row.classId || "",
      section: row.section || "",
      publishDate: row.publishDate ? row.publishDate.slice(0, 16) : "",
      expiryDate: row.expiryDate ? row.expiryDate.slice(0, 16) : "",
      priority: row.priority || "MEDIUM",
      status: row.status || "PUBLISHED",
      attachment: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await adminService.deleteNotice(id);
      toast.success("Deleted");
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm());
      }
      loadList();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Notice management</h2>

      <FormCard
        title={editingId ? "Edit notice" : "Create notice"}
        subtitle="Target students, teachers, or both. Optional class/section limits which students see it. Drafts are hidden from staff and students."
      >
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={submit}>
          <input
            className="input sm:col-span-2 lg:col-span-1"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <select className="input" value={form.noticeType} onChange={(e) => setForm((p) => ({ ...p, noticeType: e.target.value }))}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={form.targetAudience}
            onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
          >
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <select className="input" value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}>
            <option value="">All classes (students)</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.section}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Section filter (optional)"
            value={form.section}
            onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
          />
          <input
            className="input"
            type="datetime-local"
            value={form.publishDate}
            onChange={(e) => setForm((p) => ({ ...p, publishDate: e.target.value }))}
          />
          <input
            className="input"
            type="datetime-local"
            placeholder="Expiry"
            value={form.expiryDate}
            onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
          />
          <select className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
            {PRIORITY.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select className="input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <textarea
            className="input min-h-32 sm:col-span-2 lg:col-span-3"
            placeholder="Description *"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            required
          />
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1 block text-sm text-gray-600">Attachment (optional)</label>
            <input
              type="file"
              className="text-sm"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setForm((p) => ({ ...p, attachment: e.target.files?.[0] || null }))}
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : editingId ? "Update" : "Publish"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm());
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </FormCard>

      <FormCard title="All notices" subtitle="Filter by audience, status, or created date range.">
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            className="input w-44"
            value={filters.targetAudience}
            onChange={(e) => setFilters((f) => ({ ...f, targetAudience: e.target.value }))}
          >
            <option value="">All audiences</option>
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <select
            className="input w-36"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
          <input
            className="input w-40"
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          />
          <input
            className="input w-40"
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          />
        </div>

        <div className="space-y-3">
          {list.map((row) => (
            <div key={row._id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">{row.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityBadge(row.priority)}`}>
                      {row.priority}
                    </span>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-800">{row.status}</span>
                    <span className="text-xs text-gray-500">{row.noticeType}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{row.description || row.message}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Audience: {row.targetAudience}
                    {row.classId?.name != null && ` · Class ${row.classId?.name}-${row.classId?.section || ""}`}
                    {row.section ? ` · Section ${row.section}` : ""}
                  </p>
                  {row.attachmentUrl && (
                    <a
                      href={resolveUploadUrl(row.attachmentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-brand-600 hover:underline"
                    >
                      Download: {row.attachmentOriginalName || "attachment"}
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary px-3 py-1 text-sm" onClick={() => startEdit(row)}>
                    Edit
                  </button>
                  <button type="button" className="btn-secondary px-3 py-1 text-sm text-red-700" onClick={() => remove(row._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!list.length && <p className="text-sm text-gray-500">No notices yet.</p>}
        </div>
      </FormCard>
    </div>
  );
}

export default NoticeManagementPage;
