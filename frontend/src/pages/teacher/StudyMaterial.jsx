import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  Link2,
  PencilLine,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Loader from "../../components/Loader";
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

const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

const labelClass = "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600";

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

function materialTypeLabel(value) {
  return MATERIAL_OPTIONS.find((o) => o.value === value)?.label || value || "—";
}

function statusBadge(status) {
  if (status === "PUBLISHED") return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
  return "bg-slate-100 text-slate-700 ring-slate-200/80";
}

function priorityBadge(priority) {
  if (priority === "HIGH") return "bg-rose-50 text-rose-800 ring-rose-200/80";
  if (priority === "LOW") return "bg-sky-50 text-sky-800 ring-sky-200/80";
  return "bg-amber-50 text-amber-900 ring-amber-200/80";
}

function GlassStat({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.25rem] border border-white/60 bg-gradient-to-br p-5 text-white shadow-lg ring-1 ring-slate-200/50 backdrop-blur-md ${gradient}`}>
      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/25 ring-1 ring-white/30">
          <Icon className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/85">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-0.5 text-xs text-white/80">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

function FileUploadZone({ label, hint, accept, fileName, onChange, icon: Icon }) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
      <Icon className="mb-2 h-8 w-8 text-slate-400 transition group-hover:text-brand-600" strokeWidth={1.5} />
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-1 text-xs text-slate-500">{hint}</span>
      {fileName ? <span className="mt-2 truncate text-xs font-medium text-brand-700">{fileName}</span> : null}
      <input type="file" className="sr-only" accept={accept} onChange={onChange} />
    </label>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export default function TeacherStudyMaterialPage() {
  const [assigned, setAssigned] = useState([]);
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [classStudents, setClassStudents] = useState([]);

  const subjectsForClass = useMemo(() => {
    const row = assigned.find((c) => c.classId === form.classId);
    return row?.subjects || [];
  }, [assigned, form.classId]);

  const stats = useMemo(() => {
    const published = items.filter((i) => i.status === "PUBLISHED").length;
    const draft = items.filter((i) => i.status === "DRAFT").length;
    const downloads = items.reduce((s, i) => s + (i.downloadCount || 0), 0);
    return { total: items.length, published, draft, downloads };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) =>
        String(row.title || "").toLowerCase().includes(q) ||
        String(row.topic || "").toLowerCase().includes(q) ||
        String(row.subjectId?.name || row.subject || "").toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const loadAssigned = useCallback(async () => {
    try {
      const data = await teacherService.getAssignedClassesWithSubjects();
      setAssigned(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const loadMaterials = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setPageLoading(true);
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
    } finally {
      setPageLoading(false);
      setRefreshing(false);
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
    setSubmitting(true);
    try {
      if (editingId) {
        const fd = buildFormData(!!form.file || !!form.thumbnail);
        await teacherService.updateStudyMaterial(editingId, fd);
        toast.success("Material updated");
      } else {
        if (!form.file && !form.externalLink.trim()) {
          toast.error("Add a file or an external link");
          setSubmitting(false);
          return;
        }
        const fd = buildFormData(true);
        await teacherService.createStudyMaterialMultipart(fd);
        toast.success("Study material uploaded");
      }
      setForm(emptyForm());
      setEditingId(null);
      loadMaterials(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
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
      loadMaterials(true);
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

  if (pageLoading && !items.length && !assigned.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader text="Loading study materials…" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-600">Learning resources</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Study material</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
            Upload notes, assignments, and references for your classes. Students see published items after the publish date.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadMaterials(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStat icon={BookOpen} label="Total materials" value={stats.total} sub="In current filter" gradient="from-brand-600 to-indigo-600" />
        <GlassStat icon={Eye} label="Published" value={stats.published} sub="Visible to students" gradient="from-emerald-600 to-teal-600" />
        <GlassStat icon={FileText} label="Drafts" value={stats.draft} sub="Not yet published" gradient="from-amber-500 to-orange-500" />
        <GlassStat icon={Download} label="Downloads" value={stats.downloads} sub="All time (filtered)" gradient="from-violet-600 to-purple-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white shadow-lg ring-1 ring-slate-100/90 xl:col-span-2">
          <div className="border-b border-slate-100 bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-4 text-white sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                {editingId ? <PencilLine className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              </span>
              <div>
                <h2 className="text-lg font-bold">{editingId ? "Edit material" : "Upload material"}</h2>
                <p className="text-sm text-white/85">Class, section & publish settings</p>
              </div>
            </div>
          </div>

          <form className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto p-5 sm:p-6" onSubmit={submit}>
            <SectionCard title="Basic information" subtitle="Title and description shown to students">
              <div>
                <label className={labelClass}>Title *</label>
                <input className={inputClass} placeholder="e.g. Chapter 5 — Quadratic equations" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass} min-h-[88px] resize-y`} placeholder="Optional summary for students…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
            </SectionCard>

            <SectionCard title="Class assignment" subtitle="Who receives this material">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Class *</label>
                  <select className={inputClass} value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value, subjectId: "" }))} required>
                    <option value="">Select class</option>
                    {assigned.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        {c.className || c.classId}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Section</label>
                  <select className={inputClass} value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Subject *</label>
                <select className={inputClass} value={form.subjectId} onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))} required={subjectsForClass.length > 0}>
                  <option value="">Select subject</option>
                  {subjectsForClass.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Chapter / topic</label>
                <input className={inputClass} placeholder="e.g. Unit 3 — Algebra" value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} />
              </div>
            </SectionCard>

            <SectionCard title="Content" subtitle="File, link, type and priority">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Material type</label>
                  <select className={inputClass} value={form.materialType} onChange={(e) => setForm((p) => ({ ...p, materialType: e.target.value }))}>
                    {MATERIAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <select className={inputClass} value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  <Link2 className="mr-1 inline h-3.5 w-3.5" />
                  External link
                </label>
                <input className={inputClass} placeholder="YouTube, Google Drive, etc." value={form.externalLink} onChange={(e) => setForm((p) => ({ ...p, externalLink: e.target.value }))} />
              </div>
              <FileUploadZone
                label="Main file"
                hint="PDF, Office, image or video"
                icon={FileText}
                fileName={form.file?.name}
                onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              />
              <FileUploadZone
                label="Thumbnail"
                hint="Optional preview image"
                accept="image/*"
                icon={ImageIcon}
                fileName={form.thumbnail?.name}
                onChange={(e) => setForm((p) => ({ ...p, thumbnail: e.target.files?.[0] || null }))}
              />
            </SectionCard>

            <SectionCard title="Publishing" subtitle="When and how students can access">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    <Calendar className="mr-1 inline h-3.5 w-3.5" />
                    Publish date
                  </label>
                  <input className={inputClass} type="date" value={form.publishDate} onChange={(e) => setForm((p) => ({ ...p, publishDate: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Expiry date</label>
                  <input className={inputClass} type="date" value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Visibility</label>
                  <select className={inputClass} value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}>
                    <option value="PUBLIC">Public (whole class)</option>
                    <option value="RESTRICTED">Restricted students</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select className={inputClass} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" checked={form.allowDownload} onChange={(e) => setForm((p) => ({ ...p, allowDownload: e.target.checked }))} />
                  Allow download
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" checked={form.allowComments} onChange={(e) => setForm((p) => ({ ...p, allowComments: e.target.checked }))} />
                  Allow comments
                </label>
              </div>
              {form.visibility === "RESTRICTED" && (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-900">
                    <Users className="h-4 w-4" />
                    Select students
                  </div>
                  <div className="max-h-36 space-y-2 overflow-y-auto">
                    {classStudents.length === 0 && <p className="text-xs text-amber-800/80">No students loaded for this class/section.</p>}
                    {classStudents.map((st) => (
                      <label key={st._id} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/60 px-2 py-1.5 text-sm">
                        <input type="checkbox" className="h-4 w-4 rounded" checked={form.restrictedStudentIds.includes(String(st._id))} onChange={() => toggleRestrictedStudent(st._id)} />
                        <span>{st.userId?.name || st.rollNumber}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            <div className="flex flex-wrap gap-2 pt-1">
              <button type="submit" disabled={submitting} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60 sm:flex-none sm:px-8">
                <Upload className="h-4 w-4" />
                {submitting ? "Saving…" : editingId ? "Save changes" : "Publish upload"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 xl:col-span-3">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your materials</h3>
                <p className="text-sm text-slate-500">{filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}</p>
              </div>
              <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className={`${inputClass} py-2 pl-9`} placeholder="Search title, topic…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select className={`${inputClass} w-auto min-w-[120px] py-2`} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                <option value="">All classes</option>
                {assigned.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    {c.className}
                  </option>
                ))}
              </select>
              <select className={`${inputClass} w-auto py-2`} value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                <option value="">Sections</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select className={`${inputClass} w-auto min-w-[120px] py-2`} value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="">Subjects</option>
                {subjectFilterOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select className={`${inputClass} w-auto min-w-[120px] py-2`} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Types</option>
                {MATERIAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input className={`${inputClass} w-auto py-2`} type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
              <input className={`${inputClass} w-auto py-2`} type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[0.68rem] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 sm:px-5">Material</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-3 py-3">Subject</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Downloads</th>
                  <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!filteredItems.length ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center">
                      <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-2 font-semibold text-slate-700">No materials found</p>
                      <p className="text-sm text-slate-500">Upload content or adjust your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((row) => (
                    <tr key={row._id} className="border-b border-slate-50 transition hover:bg-brand-50/20">
                      <td className="px-4 py-3.5 sm:px-5">
                        <p className="font-semibold text-slate-900">{row.title}</p>
                        {row.topic ? <p className="text-xs text-slate-500">{row.topic}</p> : null}
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${priorityBadge(row.priority)}`}>
                            {row.priority}
                          </span>
                          <span className="text-[10px] text-slate-400">Sec {row.section}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-slate-700">{row.classId?.name || "—"}</td>
                      <td className="px-3 py-3.5 text-slate-700">{row.subjectId?.name || row.subject || "—"}</td>
                      <td className="px-3 py-3.5">{materialTypeLabel(row.materialType)}</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${statusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 font-medium text-slate-800">{row.downloadCount ?? 0}</td>
                      <td className="px-4 py-3.5 text-right sm:px-5">
                        <div className="flex justify-end gap-1">
                          {row.fileUrl && (
                            <a href={resolveUploadUrl(row.fileUrl)} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Open file">
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                          {row.externalLink && (
                            <a href={row.externalLink} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="External link">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button type="button" onClick={() => startEdit(row)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50" title="Edit">
                            <PencilLine className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => remove(row._id)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
