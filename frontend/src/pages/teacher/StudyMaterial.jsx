import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

const MATERIAL_OPTIONS = [
  { value: "NOTES", label: "Notes" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "HOMEWORK", label: "Homework" },
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "QUESTION_PAPER", label: "Question Paper" },
  { value: "REFERENCE", label: "Reference Material" },
];

const SECTIONS = ["A", "B", "C", "D", "E"];

const emptyForm = () => ({
  title: "",
  description: "",
  classId: "",
  section: "A",
  subjectId: "",
  topic: "",
  materialType: "NOTES",
  externalLink: "",
  publishDate: new Date().toISOString().slice(0, 10),
  expiryDate: "",
  visibility: "PUBLIC",
  allowDownload: true,
  allowComments: false,
  priority: "MEDIUM",
  status: "PUBLISHED",
  restrictedStudentIds: [],
  file: null,
  thumbnail: null,
});

function TeacherStudyMaterialPage() {
  const [assigned, setAssigned] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [classStudents, setClassStudents] = useState([]);

  const subjectsForClass = useMemo(() => {
    const row = assigned.find((c) => c.classId === form.classId);
    return row?.subjects || [];
  }, [assigned, form.classId]);

  const loadAssigned = useCallback(async () => {
    try {
      const data = await teacherService.getAssignedClassesWithSubjects();
      setAssigned(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const loadMaterials = useCallback(async () => {
    try {
      const params = {};
      if (filterClass) params.classId = filterClass;
      if (filterSection) params.section = filterSection;
      if (filterSubject) params.subjectId = filterSubject;
      if (filterType) params.materialType = filterType;
      if (filterFrom) params.from = new Date(filterFrom).toISOString();
      if (filterTo) params.to = new Date(filterTo).toISOString();
      const data = await teacherService.listMaterialsTeacher(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    }
  }, [filterClass, filterSection, filterSubject, filterType, filterFrom, filterTo]);

  useEffect(() => {
    loadAssigned();
  }, [loadAssigned]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    if (form.visibility !== "RESTRICTED" || !form.classId) {
      setClassStudents([]);
      return;
    }
    (async () => {
      try {
        const res = await teacherService.getStudents({
          classId: form.classId,
          section: form.section || undefined,
          limit: 200,
          page: 1,
        });
        setClassStudents(res.items || []);
      } catch {
        setClassStudents([]);
      }
    })();
  }, [form.visibility, form.classId, form.section]);

  const toggleRestrictedStudent = (id) => {
    const sid = String(id);
    setForm((p) => ({
      ...p,
      restrictedStudentIds: p.restrictedStudentIds.includes(sid)
        ? p.restrictedStudentIds.filter((x) => x !== sid)
        : [...p.restrictedStudentIds, sid],
    }));
  };

  const buildFormData = (includeFiles) => {
    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());
    fd.append("classId", form.classId);
    fd.append("section", form.section);
    if (form.subjectId) fd.append("subjectId", form.subjectId);
    fd.append("topic", form.topic.trim());
    fd.append("materialType", form.materialType);
    fd.append("externalLink", form.externalLink.trim());
    fd.append("publishDate", new Date(form.publishDate).toISOString());
    if (form.expiryDate) fd.append("expiryDate", new Date(form.expiryDate).toISOString());
    fd.append("visibility", form.visibility);
    fd.append("restrictedStudentIds", JSON.stringify(form.restrictedStudentIds));
    fd.append("allowDownload", String(form.allowDownload));
    fd.append("allowComments", String(form.allowComments));
    fd.append("priority", form.priority);
    fd.append("status", form.status);
    if (includeFiles && form.file) fd.append("file", form.file);
    if (includeFiles && form.thumbnail) fd.append("thumbnail", form.thumbnail);
    return fd;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.classId) {
      toast.error("Select a class");
      return;
    }
    if (!form.subjectId && !subjectsForClass.length) {
      toast.error("No subjects for this class — add subjects in admin or pick a class with your subjects.");
      return;
    }
    if (!form.subjectId) {
      toast.error("Select a subject");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        const fd = buildFormData(!!form.file || !!form.thumbnail);
        await teacherService.updateStudyMaterial(editingId, fd);
        toast.success("Material updated");
      } else {
        if (!form.file && !form.externalLink.trim()) {
          toast.error("Add a file or an external link");
          setLoading(false);
          return;
        }
        const fd = buildFormData(true);
        await teacherService.createStudyMaterialMultipart(fd);
        toast.success("Study material uploaded");
      }
      setForm(emptyForm());
      setEditingId(null);
      loadMaterials();
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
      description: row.description || "",
      classId: row.classId?._id || row.classId || "",
      section: row.section || "A",
      subjectId: row.subjectId?._id || row.subjectId || "",
      topic: row.topic || "",
      materialType: row.materialType || "NOTES",
      externalLink: row.externalLink || "",
      publishDate: row.publishDate ? String(row.publishDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
      expiryDate: row.expiryDate ? String(row.expiryDate).slice(0, 10) : "",
      visibility: row.visibility || "PUBLIC",
      allowDownload: row.allowDownload !== false,
      allowComments: !!row.allowComments,
      priority: row.priority || "MEDIUM",
      status: row.status || "DRAFT",
      restrictedStudentIds: (row.restrictedStudentIds || []).map((x) => String(x._id || x)),
      file: null,
      thumbnail: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this study material?")) return;
    try {
      await teacherService.deleteStudyMaterial(id);
      toast.success("Deleted");
      loadMaterials();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const subjectFilterOptions = useMemo(() => {
    const map = new Map();
    assigned.forEach((c) => (c.subjects || []).forEach((s) => map.set(String(s._id), s.name)));
    items.forEach((row) => {
      const sid = row.subjectId?._id || row.subjectId;
      const name = row.subjectId?.name || row.subject;
      if (sid && name) map.set(String(sid), name);
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [assigned, items]);

  return (
    <div className="space-y-6">
      <FormCard
        title={editingId ? "Edit study material" : "Upload study material"}
        subtitle="Assign to class & section. Students only see published items for their class after the publish date."
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          <input
            className="input sm:col-span-2"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <textarea
            className="input min-h-20 sm:col-span-2"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <select
            className="input"
            value={form.classId}
            onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value, subjectId: "" }))}
            required
          >
            <option value="">Class *</option>
            {assigned.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.className || c.classId}
              </option>
            ))}
          </select>
          <select className="input" value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
          <select
            className="input sm:col-span-2"
            value={form.subjectId}
            onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
            required={subjectsForClass.length > 0}
          >
            <option value="">Subject *</option>
            {subjectsForClass.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            className="input sm:col-span-2"
            placeholder="Chapter / topic"
            value={form.topic}
            onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
          />
          <select
            className="input"
            value={form.materialType}
            onChange={(e) => setForm((p) => ({ ...p, materialType: e.target.value }))}
          >
            {MATERIAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
            <option value="LOW">Priority: Low</option>
            <option value="MEDIUM">Priority: Medium</option>
            <option value="HIGH">Priority: High</option>
          </select>
          <input
            className="input"
            type="date"
            value={form.publishDate}
            onChange={(e) => setForm((p) => ({ ...p, publishDate: e.target.value }))}
          />
          <input
            className="input"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
          />
          <input
            className="input sm:col-span-2"
            placeholder="External link (YouTube, Drive, …)"
            value={form.externalLink}
            onChange={(e) => setForm((p) => ({ ...p, externalLink: e.target.value }))}
          />
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="text-gray-600">Main file (PDF, Office, image, video)</span>
            <input
              type="file"
              className="text-sm"
              onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="text-gray-600">Thumbnail (optional)</span>
            <input
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={(e) => setForm((p) => ({ ...p, thumbnail: e.target.files?.[0] || null }))}
            />
          </label>
          <select
            className="input"
            value={form.visibility}
            onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}
          >
            <option value="PUBLIC">Public (whole class)</option>
            <option value="RESTRICTED">Restricted (selected students)</option>
          </select>
          <select className="input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.allowDownload}
              onChange={(e) => setForm((p) => ({ ...p, allowDownload: e.target.checked }))}
            />
            Allow download
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.allowComments}
              onChange={(e) => setForm((p) => ({ ...p, allowComments: e.target.checked }))}
            />
            Allow comments (flag only)
          </label>
          {form.visibility === "RESTRICTED" && (
            <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <div className="mb-2 font-medium text-amber-900">Select students</div>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {classStudents.length === 0 && <span className="text-gray-600">No students loaded for this class/section.</span>}
                {classStudents.map((st) => (
                  <label key={st._id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.restrictedStudentIds.includes(String(st._id))}
                      onChange={() => toggleRestrictedStudent(st._id)}
                    />
                    <span>{st.userId?.name || st.rollNumber}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button className="btn-primary" type="submit" disabled={loading}>
              {editingId ? "Save changes" : "Publish upload"}
            </button>
            {editingId && (
              <button className="btn-secondary" type="button" onClick={cancelEdit}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </FormCard>

      <FormCard title="Your materials" subtitle="Filter and manage uploads.">
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <select className="input" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">All classes</option>
            {assigned.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.className}
              </option>
            ))}
          </select>
          <select className="input" value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
            <option value="">All sections</option>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className="input" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
            <option value="">All subjects</option>
            {subjectFilterOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select className="input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All types</option>
            {MATERIAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input className="input" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          <input className="input" type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Sec</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Downloads</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-900">{row.title}</td>
                  <td className="px-3 py-2">{row.classId?.name || "—"}</td>
                  <td className="px-3 py-2">{row.section}</td>
                  <td className="px-3 py-2">{row.subjectId?.name || row.subject || "—"}</td>
                  <td className="px-3 py-2">{row.materialType}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.publishDate ? String(row.publishDate).slice(0, 10) : "—"}</td>
                  <td className="px-3 py-2">{row.downloadCount ?? 0}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {row.fileUrl && (
                        <a
                          className="text-brand-700 underline"
                          href={resolveUploadUrl(row.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          File
                        </a>
                      )}
                      {row.externalLink && (
                        <a className="text-brand-700 underline" href={row.externalLink} target="_blank" rel="noreferrer">
                          Link
                        </a>
                      )}
                      <button type="button" className="text-blue-600 underline" onClick={() => startEdit(row)}>
                        Edit
                      </button>
                      <button type="button" className="text-red-600 underline" onClick={() => remove(row._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <div className="p-4 text-center text-gray-500">No materials match filters.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherStudyMaterialPage;
