import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

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
    <div className="space-y-6">
      <FormCard title="Exams" subtitle="Create upcoming exams for assigned classes.">
        <div className="grid gap-3 sm:grid-cols-4">
          <input className="input" placeholder="Exam Title" value={examForm.title} onChange={(e) => setExamForm((p) => ({ ...p, title: e.target.value }))} />
          <input className="input" placeholder="Class ID" value={examForm.classId} onChange={(e) => setExamForm((p) => ({ ...p, classId: e.target.value }))} />
          <input className="input" placeholder="Section" value={examForm.section} onChange={(e) => setExamForm((p) => ({ ...p, section: e.target.value }))} />
          <input className="input" type="date" value={examForm.examDate} onChange={(e) => setExamForm((p) => ({ ...p, examDate: e.target.value }))} />
        </div>
        <button className="btn-primary mt-3 w-fit" type="button" onClick={createExam}>
          Create Exam
        </button>
        <div className="mt-4 space-y-2 text-sm">
          {exams.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              {item.title} | {item.classId?.name}-{item.section} | {new Date(item.examDate).toLocaleDateString()}
            </div>
          ))}
          {!exams.length && <div className="text-gray-500">No exams found.</div>}
        </div>
      </FormCard>

      <FormCard title="Marks Entry" subtitle="Enter or update marks with auto grade calculation.">
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="input" placeholder="Student ID" value={marksForm.studentId} onChange={(e) => setMarksForm((p) => ({ ...p, studentId: e.target.value }))} />
          <input className="input" placeholder="Exam ID" value={marksForm.examId} onChange={(e) => setMarksForm((p) => ({ ...p, examId: e.target.value }))} />
          <input className="input" placeholder="Subject" value={marksForm.subject} onChange={(e) => setMarksForm((p) => ({ ...p, subject: e.target.value }))} />
          <input className="input" type="number" placeholder="Marks Obtained" value={marksForm.marksObtained} onChange={(e) => setMarksForm((p) => ({ ...p, marksObtained: e.target.value }))} />
          <input className="input" type="number" placeholder="Total Marks" value={marksForm.totalMarks} onChange={(e) => setMarksForm((p) => ({ ...p, totalMarks: e.target.value }))} />
          <input className="input" placeholder="Remarks" value={marksForm.remarks} onChange={(e) => setMarksForm((p) => ({ ...p, remarks: e.target.value }))} />
        </div>
        <button className="btn-primary mt-3 w-fit" type="button" onClick={saveMarks}>
          Save Marks
        </button>
      </FormCard>

      <FormCard title="Student Results" subtitle="View results of a selected student.">
        <div className="flex gap-2">
          <input className="input" placeholder="Student ID" value={studentIdForResults} onChange={(e) => setStudentIdForResults(e.target.value)} />
          <button className="btn-secondary" type="button" onClick={loadResults}>
            Load Results
          </button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {results.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              {item.subject}: {item.marks}/{item.totalMarks} ({item.percentage}%) Grade {item.grade}
            </div>
          ))}
          {!results.length && <div className="text-gray-500">No results loaded.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherExamsMarksPage;
