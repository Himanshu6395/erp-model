import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, Calendar, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { teacherService } from "../../services/teacherService";
import { DataTable, EmptyState, inputClass, labelClass, PageCard, PageHeader } from "./teacherPageUi";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50";

function classLabelForEdit(item) {
  const cls = item.classId;
  if (!cls) return "—";
  const name = cls.name || cls.className || "Class";
  const section = item.section || cls.section;
  return section ? `${name} · ${section}` : name;
}

function TeacherHomeworkPage() {
  const [scope, setScope] = useState(null);
  const [scopeLoading, setScopeLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", dueDate: "", attachments: "" });

  const loadScope = async () => {
    setScopeLoading(true);
    try {
      const data = await teacherService.getHomeworkScope();
      setScope(data);
      if (data?.options?.length) setSelectedClassId(String(data.options[0].classId));
    } catch (error) {
      toast.error(error.message);
      setScope(null);
    } finally {
      setScopeLoading(false);
    }
  };

  const load = async () => {
    try {
      const data = await teacherService.getHomework();
      setItems(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadScope();
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!scope?.options?.length) {
      toast.error("No class assigned to you");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        attachments: form.attachments
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      if (scope.requiresClassPick) payload.classId = selectedClassId;
      if (editingId) {
        await teacherService.updateHomework(editingId, payload);
        toast.success("Homework updated");
      } else {
        await teacherService.createHomework(payload);
        toast.success("Homework created");
      }
      setEditingId(null);
      setForm({ title: "", description: "", subject: "", dueDate: "", attachments: "" });
      if (scope?.options?.length) setSelectedClassId(String(scope.options[0].classId));
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      subject: item.subject || "",
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : "",
      attachments: (item.attachments || []).join(", "),
    });
    const cid = item.classId?._id || item.classId;
    if (cid) setSelectedClassId(String(cid));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", description: "", subject: "", dueDate: "", attachments: "" });
    if (scope?.options?.length) setSelectedClassId(String(scope.options[0].classId));
  };

  const remove = async (assignmentId) => {
    if (!window.confirm("Delete homework?")) return;
    try {
      await teacherService.deleteHomework(assignmentId);
      toast.success("Homework deleted");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const selectedOption = scope?.options?.find((o) => String(o.classId) === String(selectedClassId));

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Teaching"
        title="Homework"
        subtitle="Create and manage assignments for your mapped classes. Students only see homework for their class and section."
      />

      <PageCard
        title={editingId ? "Edit assignment" : "Create assignment"}
        subtitle="Class and section come from your school mapping."
        icon={editingId ? Pencil : Plus}
      >
        {scopeLoading ? (
          <p className="text-sm text-slate-500">Loading your class mapping…</p>
        ) : !scope?.options?.length ? (
          <EmptyState
            icon={BookOpen}
            title="No class assigned"
            message="Ask the school admin to map you as class teacher or subject teacher before creating homework."
          />
        ) : (
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
            <div className="sm:col-span-2 rounded-2xl border border-brand-100/80 bg-gradient-to-br from-brand-50/80 to-indigo-50/50 px-4 py-3">
              <p className={labelClass}>Assigned class &amp; section</p>
              {editingId ? (
                <p className="text-sm font-semibold text-slate-900">{classLabelForEdit(items.find((i) => i._id === editingId) || {})}</p>
              ) : scope.requiresClassPick ? (
                <select
                  className={`${inputClass} mt-1 max-w-md`}
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  required
                  aria-label="Class for homework"
                >
                  {scope.options.map((o) => (
                    <option key={String(o.classId)} value={String(o.classId)}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-semibold text-slate-900">{selectedOption?.label || scope.options[0]?.label}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            </div>
            <div>
              <label className={labelClass}>Subject</label>
              <input className={inputClass} value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Due date</label>
              <input className={inputClass} type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} required />
            </div>
            <div>
              <label className={labelClass}>Attachment URLs</label>
              <input
                className={inputClass}
                placeholder="Comma-separated links"
                value={form.attachments}
                onChange={(e) => setForm((p) => ({ ...p, attachments: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} min-h-28`}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button className={btnPrimary} type="submit" disabled={loading}>
                {loading ? "Saving…" : editingId ? "Update homework" : "Create homework"}
              </button>
              {editingId ? (
                <button className={btnSecondary} type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        )}
      </PageCard>

      <PageCard title="Assignments" subtitle="Track submissions and late submissions." icon={ClipboardList}>
        {!items.length ? (
          <EmptyState icon={BookOpen} title="No homework yet" message="Create your first assignment above." />
        ) : (
          <DataTable>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Submissions</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                    <td className="px-4 py-3 text-slate-600">{classLabelForEdit(item)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        {item.submissionCount}
                      </span>
                      <span className="ml-1 text-xs text-slate-500">late: {item.lateSubmissionCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className={btnSecondary + " !px-3 !py-1.5 text-xs"} type="button" onClick={() => edit(item)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-2xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          type="button"
                          onClick={() => remove(item._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </PageCard>
    </div>
  );
}

export default TeacherHomeworkPage;
