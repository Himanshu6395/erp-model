import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherHomeworkPage() {
  const [loading, setLoading] = useState(false);
  const [scopeLoading, setScopeLoading] = useState(true);
  const [scope, setScope] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    attachments: "",
  });

  const loadScope = async () => {
    try {
      setScopeLoading(true);
      const data = await teacherService.getHomeworkScope();
      setScope(data);
      if (data?.options?.length) {
        setSelectedClassId(String(data.options[0].classId));
      } else {
        setSelectedClassId("");
      }
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
  }, []);

  useEffect(() => {
    load();
  }, []);

  const classLabelForEdit = (item) => {
    const name = item.classId?.name || "";
    const sec = item.section || item.classId?.section || "";
    return sec ? `${name} — Section ${sec}` : name || "—";
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!scope?.options?.length) {
      toast.error("No class is mapped to your profile. Contact the school admin.");
      return;
    }
    if (scope.requiresClassPick && !selectedClassId) {
      toast.error("Select a class");
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
      if (scope.requiresClassPick) {
        payload.classId = selectedClassId;
      }
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
    <div className="space-y-6">
      <FormCard
        title={editingId ? "Edit Homework" : "Create Homework"}
        subtitle="Class and section come from your school mapping. Students only see homework for their own class and section."
      >
        {scopeLoading ? (
          <p className="text-sm text-gray-500">Loading your class mapping…</p>
        ) : !scope?.options?.length ? (
          <p className="text-sm text-amber-800">
            You are not mapped to any class as class teacher or subject teacher. Homework cannot be created until the admin assigns you.
          </p>
        ) : (
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
            <div className="sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <div className="font-medium text-gray-700">Assigned class &amp; section</div>
              {editingId ? (
                <p className="mt-1 text-gray-900">{classLabelForEdit(items.find((i) => i._id === editingId) || {})}</p>
              ) : scope.requiresClassPick ? (
                <select
                  className="input mt-2 max-w-md"
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
                <p className="mt-1 text-gray-900">{selectedOption?.label || scope.options[0]?.label}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">These fields are set by the school and cannot be edited manually.</p>
            </div>

            <input
              className="input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            />
            <input
              className="input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Attachments URLs comma-separated"
              value={form.attachments}
              onChange={(e) => setForm((p) => ({ ...p, attachments: e.target.value }))}
            />
            <textarea
              className="input min-h-24 sm:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="flex gap-2 sm:col-span-2">
              <button className="btn-primary w-fit" type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Homework" : "Create Homework"}
              </button>
              {editingId && (
                <button className="btn-secondary w-fit" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </FormCard>

      <FormCard title="Homework List" subtitle="Track submissions and late submissions.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Due</th>
                <th className="py-2 pr-3">Submissions</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="py-2 pr-3">{item.title}</td>
                  <td className="py-2 pr-3">{classLabelForEdit(item)}</td>
                  <td className="py-2 pr-3">{new Date(item.dueDate).toLocaleDateString()}</td>
                  <td className="py-2 pr-3">
                    {item.submissionCount} (late: {item.lateSubmissionCount})
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => edit(item)}>
                        Edit
                      </button>
                      <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => remove(item._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={5} className="py-3 text-gray-500">
                    No homework found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherHomeworkPage;
