import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, CheckCircle2, GraduationCap, Save, ShieldCheck, UserRound } from "lucide-react";
import { adminService } from "../../services/adminService";

const emptyForm = {
  classId: "",
  name: "",
  teacherId: "",
};

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

function SubjectManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingSubjectId = location.state?.subjectId || null;

  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const fetchData = async () => {
      setBootstrapLoading(true);
      try {
        const [subjectData, classData, teacherData] = await Promise.all([
          adminService.getSubjects(),
          adminService.getClasses(),
          adminService.getTeachers({ page: 1, limit: 200 }),
        ]);
        const subjectsList = Array.isArray(subjectData) ? subjectData : [];
        setSubjects(subjectsList);
        setClasses(Array.isArray(classData) ? classData : []);
        setTeachers(teacherData.items || []);

        if (editingSubjectId) {
          const current = subjectsList.find((item) => item._id === editingSubjectId);
          if (current) {
            setForm({
              classId: current.classId?._id || "",
              name: current.name || "",
              teacherId: current.teacherId?._id || "",
            });
          }
        } else {
          setForm(emptyForm);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setBootstrapLoading(false);
      }
    };

    fetchData();
  }, [editingSubjectId]);

  const completion = useMemo(() => {
    const checks = [Boolean(form.classId), Boolean(form.name.trim()), Boolean(form.teacherId)];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingSubjectId) {
        await adminService.updateSubject(editingSubjectId, form);
        toast.success("Subject updated");
        navigate("/admin/subjects/registered");
      } else {
        if (!form.classId?.trim()) {
          toast.error("Select a class for this subject.");
          return;
        }
        await adminService.createSubject(form);
        toast.success("Subject created");
        setForm(emptyForm);
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
        Loading subject form...
      </div>
    );
  }

  const selectedClass = classes.find((item) => item._id === form.classId);
  const selectedTeacher = teachers.find((item) => item._id === form.teacherId);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-brand-950 to-cyan-700 px-6 py-6 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100">Curriculum setup</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {editingSubjectId ? "Update subject mapping" : "Create subject mapping"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                Build a clean curriculum structure by mapping subjects to classes and optionally assigning the responsible teacher.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm lg:min-w-[220px] lg:w-auto">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                <span>Form completion</span>
                <span>{completion}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 transition-all" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-200">Class and subject name are the core essentials.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Subject details</h2>
                <p className="text-sm text-slate-500">Define the subject and its academic class mapping.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Class" required>
                <select className="input" name="classId" value={form.classId} onChange={onChange} required>
                  <option value="">Select class</option>
                  {classes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}-{item.section}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Subject name" required>
                <input className="input" name="name" placeholder="Mathematics, Science, English..." value={form.name} onChange={onChange} required />
              </Field>
              <Field label="Assigned teacher" hint="Optional teacher ownership for this subject.">
                <select className="input sm:col-span-2" name="teacherId" value={form.teacherId} onChange={onChange}>
                  <option value="">Assign teacher</option>
                  {teachers.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.userId?.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Preview</h2>
                <p className="text-sm text-slate-500">Quick summary of the subject record you are saving.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">Subject identity</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-950">{form.name || "Subject name pending"}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : "Class mapping pending"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Assigned teacher</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  <span>{selectedTeacher?.userId?.name || "Not assigned"}</span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Academic scope</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <span>{selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : "No class selected"}</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800">
              <CheckCircle2 className="h-4 w-4" />
              Separate create and list tabs now keep subject management cleaner for school admins.
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:justify-between sm:px-6">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            onClick={() => navigate("/admin/subjects/registered")}
          >
            <BookOpen className="h-4 w-4" />
            View all subjects
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : editingSubjectId ? "Update subject" : "Create subject"}
          </button>
        </div>
      </section>
    </form>
  );
}

export default SubjectManagementPage;
