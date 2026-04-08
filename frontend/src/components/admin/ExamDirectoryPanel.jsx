import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BarChart3, CalendarDays, PencilLine, Search, Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";

const STATUS_OPTIONS = ["DRAFT", "UPCOMING", "ONGOING", "COMPLETED", "PUBLISHED"];

function statusBadge(status) {
  if (status === "PUBLISHED") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "ONGOING") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (status === "COMPLETED") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function ExamDirectoryPanel() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ classId: "", status: "", query: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [classData, examData] = await Promise.all([adminService.getClasses(), adminService.listExamSessions()]);
      setClasses(Array.isArray(classData) ? classData : []);
      setExams(Array.isArray(examData) ? examData : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return exams.filter((exam) => {
      if (filters.classId && String(exam.classId?._id || exam.classId) !== String(filters.classId)) return false;
      if (filters.status && exam.status !== filters.status) return false;
      if (!q) return true;
      const haystack = [exam.name, exam.term, exam.academicYear, exam.classId?.name, exam.section, exam.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [exams, filters.classId, filters.query, filters.status]);

  const remove = async (examId) => {
    if (!window.confirm("Delete this exam and its related records?")) return;
    try {
      await adminService.deleteExamSession(examId);
      toast.success("Exam deleted");
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-700">Exam directory</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">All exams and results</h2>
          <p className="mt-1 text-sm text-slate-500">Open an exam to manage schedules, subject configs, marks, merit lists, and report cards.</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-11"
            placeholder="Search exam, year, class, term"
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <select className="input" value={filters.classId} onChange={(event) => setFilters((current) => ({ ...current, classId: event.target.value }))}>
          <option value="">All classes</option>
          {classes.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}-{item.section}
            </option>
          ))}
        </select>
        <select className="input" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={() => setFilters({ classId: "", status: "", query: "" })}
        >
          Reset filters
        </button>
      </div>

      {filtered.length ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filtered.map((exam) => (
            <article key={exam._id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-950">{exam.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1 ${statusBadge(exam.status)}`}>
                        {exam.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {exam.classId?.name || "Class"} {exam.section ? `• Section ${exam.section}` : ""} • {exam.academicYear}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Exam window</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Type</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{exam.examType}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Description</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{exam.description || "No description added yet."}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                  onClick={() => navigate("/admin/exams-results/create", { state: { examId: exam._id } })}
                >
                  <PencilLine className="h-4 w-4" />
                  Manage exam
                </button>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 sm:w-auto"
                  onClick={() => navigate("/admin/exams-results/create", { state: { examId: exam._id, focus: "results" } })}
                >
                  <BarChart3 className="h-4 w-4" />
                  Open results
                </button>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
                  onClick={() => remove(exam._id)}
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
          <p className="text-lg font-semibold text-slate-700">{loading ? "Loading exams..." : "No exams match the current filters."}</p>
          <p className="mt-2 text-sm text-slate-500">Create an exam from the create tab, then manage results and report cards from here.</p>
        </div>
      )}
    </section>
  );
}

export default ExamDirectoryPanel;
