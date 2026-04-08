import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BellRing, CalendarClock, CheckCircle2, FileText, Megaphone, Save, ShieldCheck, Users } from "lucide-react";
import { adminService } from "../../services/adminService";

const TYPES = ["GENERAL", "URGENT", "EVENT", "HOLIDAY"];
const AUDIENCES = [
  { value: "STUDENTS", label: "Students" },
  { value: "TEACHERS", label: "Teachers" },
  { value: "BOTH", label: "Both" },
];
const PRIORITY = ["LOW", "MEDIUM", "HIGH"];
const STATUS = ["DRAFT", "PUBLISHED"];

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

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function NoticeManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingNoticeId = location.state?.noticeId || null;

  const [classes, setClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);

  const loadPageData = useCallback(async () => {
    setBootstrapLoading(true);
    try {
      const [classData, noticeData] = await Promise.all([adminService.getClasses(), adminService.listNotices()]);
      const classList = Array.isArray(classData) ? classData : [];
      const noticeList = Array.isArray(noticeData) ? noticeData : [];
      setClasses(classList);
      setNotices(noticeList);

      if (editingNoticeId) {
        const current = noticeList.find((item) => item._id === editingNoticeId);
        if (current) {
          setForm({
            title: current.title || "",
            description: current.description || current.message || "",
            noticeType: current.noticeType || "GENERAL",
            targetAudience: current.targetAudience || "BOTH",
            classId: current.classId?._id || current.classId || "",
            section: current.section || "",
            publishDate: current.publishDate ? current.publishDate.slice(0, 16) : "",
            expiryDate: current.expiryDate ? current.expiryDate.slice(0, 16) : "",
            priority: current.priority || "MEDIUM",
            status: current.status || "PUBLISHED",
            attachment: null,
          });
        } else {
          setForm(emptyForm());
        }
      } else {
        setForm(emptyForm());
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBootstrapLoading(false);
    }
  }, [editingNoticeId]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(form.title.trim()),
      Boolean(form.description.trim()),
      Boolean(form.noticeType),
      Boolean(form.targetAudience),
      Boolean(form.priority),
      Boolean(form.status),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  const appendFormFields = (formData) => {
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("noticeType", form.noticeType);
    formData.append("targetAudience", form.targetAudience);
    formData.append("classId", form.classId || "");
    formData.append("section", form.section || "");
    if (form.publishDate) formData.append("publishDate", new Date(form.publishDate).toISOString());
    if (form.expiryDate) formData.append("expiryDate", new Date(form.expiryDate).toISOString());
    formData.append("priority", form.priority);
    formData.append("status", form.status);
    if (form.attachment instanceof File) formData.append("attachment", form.attachment);
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      appendFormFields(formData);

      if (editingNoticeId) {
        await adminService.updateNotice(editingNoticeId, formData);
        toast.success("Notice updated");
        navigate("/admin/notices/registered");
      } else {
        await adminService.createNotice(formData);
        toast.success("Notice created");
        setForm(emptyForm());
        loadPageData();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (bootstrapLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)]">
        Loading notice management...
      </div>
    );
  }

  const selectedClass = classes.find((item) => item._id === form.classId);
  const publishedCount = notices.filter((item) => item.status === "PUBLISHED").length;
  const draftCount = notices.filter((item) => item.status === "DRAFT").length;
  const highPriorityCount = notices.filter((item) => item.priority === "HIGH").length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-brand-950 to-fuchsia-700 px-6 py-6 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-fuchsia-100">Communication center</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {editingNoticeId ? "Update school notice" : "Create school notice"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                Publish professional announcements for students, teachers, or both with audience controls, priority tags, and optional attachments.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm lg:min-w-[220px] lg:w-auto">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-100">
                <span>Form completion</span>
                <span>{completion}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-300 to-cyan-300 transition-all" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-200">Title and description are the core publishing essentials.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Total notices</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{notices.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Published</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{publishedCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Drafts</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{draftCount}</p>
          </div>
          <div className="rounded-3xl border border-fuchsia-200 bg-fuchsia-50 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-fuchsia-700">High priority</p>
            <p className="mt-3 text-3xl font-bold text-fuchsia-900">{highPriorityCount}</p>
          </div>
        </div>
      </section>

      <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Megaphone className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Notice details</h2>
                <p className="text-sm text-slate-500">Write the announcement content and decide how it should be published.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Title" required>
                <input className="input" name="title" value={form.title} onChange={onChange} placeholder="School holiday, exam schedule, annual event..." required />
              </Field>
              <Field label="Notice type">
                <select className="input" name="noticeType" value={form.noticeType} onChange={onChange}>
                  {TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Target audience">
                <select className="input" name="targetAudience" value={form.targetAudience} onChange={onChange}>
                  {AUDIENCES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Class filter" hint="Optional if this notice only applies to one class.">
                <select className="input" name="classId" value={form.classId} onChange={onChange}>
                  <option value="">All classes</option>
                  {classes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} - {item.section}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Section filter" hint="Optional section-specific visibility.">
                <input className="input" name="section" value={form.section} onChange={onChange} placeholder="A, B, C" />
              </Field>
              <Field label="Priority">
                <select className="input" name="priority" value={form.priority} onChange={onChange}>
                  {PRIORITY.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select className="input" name="status" value={form.status} onChange={onChange}>
                  {STATUS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Publish date">
                <input className="input" name="publishDate" type="datetime-local" value={form.publishDate} onChange={onChange} />
              </Field>
              <Field label="Expiry date">
                <input className="input" name="expiryDate" type="datetime-local" value={form.expiryDate} onChange={onChange} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description" required>
                  <textarea
                    className="input min-h-36"
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="Write the full notice message here..."
                    required
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Attachment" hint="Optional PDF, image, or document for notice recipients.">
                  <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600 transition hover:border-fuchsia-300 hover:bg-fuchsia-50/40">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {form.attachment?.name || "Choose attachment file"}
                    </span>
                    <span className="text-xs text-slate-500">Supported: PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                      onChange={(event) => setForm((current) => ({ ...current, attachment: event.target.files?.[0] || null }))}
                    />
                  </label>
                </Field>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                onClick={() => {
                  navigate("/admin/notices/create", { replace: true });
                  setForm(emptyForm());
                }}
              >
                <BellRing className="h-4 w-4" />
                {editingNoticeId ? "Cancel edit" : "Reset form"}
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                onClick={() => navigate("/admin/notices/registered")}
              >
                <BellRing className="h-4 w-4" />
                View all notices
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : editingNoticeId ? "Update notice" : "Publish notice"}
              </button>
            </div>
          </section>
        </section>

        <section className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Preview</h2>
                <p className="text-sm text-slate-500">A quick summary of the notice before it goes live.</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Megaphone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">Notice identity</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-950">{form.title || "Notice title pending"}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {form.noticeType} notice for {AUDIENCES.find((item) => item.value === form.targetAudience)?.label || "selected audience"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Academic visibility</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>
                    {selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : "All classes"}
                    {form.section ? ` • Section ${form.section}` : ""}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Publishing window</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  <span>
                    {form.publishDate || "Publish now"} {form.expiryDate ? `to ${form.expiryDate}` : "with no expiry set"}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Notice body</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {form.description || "Notice description preview will appear here."}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-50 px-4 py-3 text-sm font-medium text-fuchsia-800">
              <CheckCircle2 className="h-4 w-4" />
              Create and list tabs now keep school notices cleaner and easier to manage.
            </div>
          </section>
        </section>
      </form>
    </div>
  );
}

export default NoticeManagementPage;
