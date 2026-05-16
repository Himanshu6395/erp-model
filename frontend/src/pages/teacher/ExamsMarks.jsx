import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Award, BookMarked, GraduationCap, Search } from "lucide-react";
import { teacherService } from "../../services/teacherService";
import { EmptyState, inputClass, labelClass, PageCard, PageHeader } from "./teacherPageUi";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50";

function TeacherExamsMarksPage() {
  const [exams, setExams] = useState([]);
  const [examForm, setExamForm] = useState({ title: "", classId: "", section: "", examDate: "" });
  const [marksForm, setMarksForm] = useState({
    studentId: "",
    examId: "",
    subject: "",
    marksObtained: "",
    totalMarks: "100",
    remarks: "",
  });
  const [studentIdForResults, setStudentIdForResults] = useState("");
  const [results, setResults] = useState([]);

  const loadExams = async () => {
    try {
      const data = await teacherService.getExams();
      setExams(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const createExam = async () => {
    try {
      await teacherService.createExam(examForm);
      toast.success("Exam created");
      setExamForm({ title: "", classId: "", section: "", examDate: "" });
      loadExams();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveMarks = async () => {
    try {
      await teacherService.upsertMarks(marksForm);
      toast.success("Marks saved");
      setMarksForm({ studentId: "", examId: "", subject: "", marksObtained: "", totalMarks: "100", remarks: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadResults = async () => {
    if (!studentIdForResults) return;
    try {
      const data = await teacherService.getStudentResults(studentIdForResults);
      setResults(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Assessment"
        title="Exams & marks"
        subtitle="Create exams, enter marks with auto grade calculation, and view student results."
      />

      <PageCard title="Exams" subtitle="Create upcoming exams for assigned classes." icon={BookMarked}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Exam title</label>
            <input className={inputClass} value={examForm.title} onChange={(e) => setExamForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Class ID</label>
            <input className={inputClass} value={examForm.classId} onChange={(e) => setExamForm((p) => ({ ...p, classId: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Section</label>
            <input className={inputClass} value={examForm.section} onChange={(e) => setExamForm((p) => ({ ...p, section: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Exam date</label>
            <input className={inputClass} type="date" value={examForm.examDate} onChange={(e) => setExamForm((p) => ({ ...p, examDate: e.target.value }))} />
          </div>
        </div>
        <button className={`${btnPrimary} mt-4`} type="button" onClick={createExam}>
          Create exam
        </button>
        <div className="mt-6 space-y-2">
          {exams.map((item) => (
            <div
              key={item._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm"
            >
              <span className="font-semibold text-slate-900">{item.title}</span>
              <span className="text-slate-600">
                {item.classId?.name}-{item.section} · {new Date(item.examDate).toLocaleDateString()}
              </span>
            </div>
          ))}
          {!exams.length && <EmptyState icon={BookMarked} title="No exams" message="Create your first exam above." />}
        </div>
      </PageCard>

      <PageCard title="Marks entry" subtitle="Enter or update marks — grades are calculated automatically." icon={GraduationCap}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Student ID", "studentId", "text"],
            ["Exam ID", "examId", "text"],
            ["Subject", "subject", "text"],
            ["Marks obtained", "marksObtained", "number"],
            ["Total marks", "totalMarks", "number"],
            ["Remarks", "remarks", "text"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                className={inputClass}
                type={type}
                value={marksForm[key]}
                onChange={(e) => setMarksForm((p) => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button className={`${btnPrimary} mt-4`} type="button" onClick={saveMarks}>
          Save marks
        </button>
      </PageCard>

      <PageCard title="Student results" subtitle="Look up results by student ID." icon={Award}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className={labelClass}>Student ID</label>
            <input className={inputClass} value={studentIdForResults} onChange={(e) => setStudentIdForResults(e.target.value)} />
          </div>
          <button className={btnSecondary} type="button" onClick={loadResults}>
            <Search className="h-4 w-4" /> Load results
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {results.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
            >
              <p className="font-bold text-slate-900">{item.subject}</p>
              <p className="mt-1 text-2xl font-bold text-brand-700">
                {item.marks}/{item.totalMarks}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {item.percentage}% · Grade <span className="font-semibold">{item.grade}</span>
              </p>
            </div>
          ))}
          {!results.length && <EmptyState icon={Award} title="No results loaded" message="Enter a student ID and load results." />}
        </div>
      </PageCard>
    </div>
  );
}

export default TeacherExamsMarksPage;
