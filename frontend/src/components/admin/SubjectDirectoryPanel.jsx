import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, Edit3, GraduationCap, Trash2, UserRound } from "lucide-react";
import { adminService } from "../../services/adminService";

function SubjectDirectoryPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filteredSubjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((item) => {
      const teacherName = item.teacherId?.userId?.name || item.teacherId?.name || "";
      const classLabel = [item.classId?.name, item.classId?.section].filter(Boolean).join(" ");
      return `${item.name || ""} ${teacherName} ${classLabel}`.toLowerCase().includes(q);
    });
  }, [subjects, search]);

  const removeSubject = async (subjectId) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await adminService.deleteSubject(subjectId);
      toast.success("Subject deleted");
      fetchSubjects();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200/90 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand-600">Curriculum Directory</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Registered subjects</h2>
          <p className="mt-1 text-sm text-slate-500">Review, edit, and maintain subject mappings by class and assigned teacher.</p>
        </div>
        <div className="w-full sm:max-w-sm">
          <input
            className="input"
            placeholder="Search subject, class, or teacher"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <div className="py-8 text-sm text-slate-500">Loading subjects...</div> : null}
        {!loading && !filteredSubjects.length ? <div className="py-8 text-sm text-slate-500">No subjects found.</div> : null}

        {!loading &&
          filteredSubjects.map((item) => {
            const classLabel = [item.classId?.name, item.classId?.section].filter(Boolean).join(" - ") || "Class not mapped";
            const teacherName = item.teacherId?.userId?.name || item.teacherId?.name || "Teacher not assigned";

            return (
              <article
                key={item._id}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm transition hover:border-brand-200 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold tracking-tight text-slate-950">{item.name || "Subject"}</h3>
                    <p className="mt-1 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                      {classLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Assigned teacher</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    <span>{teacherName}</span>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Academic group</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    <span>{classLabel}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                    onClick={() => navigate("/admin/subjects/create", { state: { subjectId: item._id } })}
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    onClick={() => removeSubject(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}

export default SubjectDirectoryPanel;
