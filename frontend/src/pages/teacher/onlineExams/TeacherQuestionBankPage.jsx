import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bot, FileSpreadsheet, PlusCircle, Trash2 } from "lucide-react";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamEmptyState, OnlineExamHero, OnlineExamSection, examBtnPrimary, examBtnSecondary, examInputClass, examLabelClass } from "../../../components/onlineExams/onlineExamUi";
import { teacherService } from "../../../services/teacherService";

const emptyQuestion = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswers: "A",
  marks: 1,
  negativeMarks: 0,
  difficulty: "MEDIUM",
  topic: "",
  explanation: "",
};

function TeacherQuestionBankPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [question, setQuestion] = useState(emptyQuestion);
  const [filters, setFilters] = useState({ search: "" });
  const [csvText, setCsvText] = useState("");
  const [aiForm, setAiForm] = useState({ topic: "", count: 5, difficulty: "MEDIUM" });

  const load = async () => {
    try {
      const data = await teacherService.getOnlineQuestionBank({ limit: 100, search: filters.search });
      setRows(data.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [filters.search]);

  const createQuestion = async () => {
    setSaving(true);
    try {
      await teacherService.createOnlineQuestion(question);
      toast.success("Question added");
      setQuestion(emptyQuestion);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeQuestion = async (questionId) => {
    try {
      await teacherService.deleteOnlineQuestion(questionId);
      toast.success("Question deleted");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const importCsv = async () => {
    try {
      await teacherService.importOnlineQuestions({ csvText });
      toast.success("Questions imported");
      setCsvText("");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCsvFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  const generateAi = async () => {
    try {
      await teacherService.generateAiOnlineQuestions(aiForm);
      toast.success("AI questions generated");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader text="Loading question bank..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero
        badge="Question bank"
        title="Build a reusable MCQ repository"
        subtitle="Create standard MCQs, import them in bulk from CSV, or generate a starter set from a topic for faster online exam creation."
      />

      <OnlineExamSection
        title="Create MCQ"
        subtitle="Add question text, options, explanation, marks, and negative marks to reuse across multiple exams."
        actions={
          <button type="button" onClick={createQuestion} className={examBtnPrimary} disabled={saving}>
            <PlusCircle className="h-4 w-4" /> {saving ? "Saving..." : "Add question"}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:col-span-4">
            <label className={examLabelClass}>Question</label>
            <textarea className={`${examInputClass} min-h-24`} value={question.questionText} onChange={(e) => setQuestion((prev) => ({ ...prev, questionText: e.target.value }))} />
          </div>
          {["A", "B", "C", "D"].map((option) => (
            <div key={option}>
              <label className={examLabelClass}>Option {option}</label>
              <input className={examInputClass} value={question[`option${option}`]} onChange={(e) => setQuestion((prev) => ({ ...prev, [`option${option}`]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className={examLabelClass}>Correct answer</label>
            <select className={examInputClass} value={question.correctAnswers} onChange={(e) => setQuestion((prev) => ({ ...prev, correctAnswers: e.target.value }))}>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>
          <div>
            <label className={examLabelClass}>Marks</label>
            <input className={examInputClass} type="number" value={question.marks} onChange={(e) => setQuestion((prev) => ({ ...prev, marks: e.target.value }))} />
          </div>
          <div>
            <label className={examLabelClass}>Negative marks</label>
            <input className={examInputClass} type="number" step="0.25" value={question.negativeMarks} onChange={(e) => setQuestion((prev) => ({ ...prev, negativeMarks: e.target.value }))} />
          </div>
          <div>
            <label className={examLabelClass}>Difficulty</label>
            <select className={examInputClass} value={question.difficulty} onChange={(e) => setQuestion((prev) => ({ ...prev, difficulty: e.target.value }))}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label className={examLabelClass}>Topic</label>
            <input className={examInputClass} value={question.topic} onChange={(e) => setQuestion((prev) => ({ ...prev, topic: e.target.value }))} />
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <label className={examLabelClass}>Explanation</label>
            <textarea className={`${examInputClass} min-h-24`} value={question.explanation} onChange={(e) => setQuestion((prev) => ({ ...prev, explanation: e.target.value }))} />
          </div>
        </div>
      </OnlineExamSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <OnlineExamSection title="Import questions via CSV" subtitle="Paste or upload CSV content using the question and option columns you defined.">
          <div className="space-y-4">
            <input type="file" accept=".csv,text/csv" onChange={(e) => handleCsvFile(e.target.files?.[0])} className="block w-full text-sm text-slate-600" />
            <textarea className={`${examInputClass} min-h-56`} value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="Question,Option A,Option B,Option C,Option D,Correct Answer,Marks,Negative Marks" />
            <button type="button" onClick={importCsv} className={examBtnSecondary}>
              <FileSpreadsheet className="h-4 w-4" /> Import CSV
            </button>
          </div>
        </OnlineExamSection>

        <OnlineExamSection title="AI question generator" subtitle="Generate a first draft of MCQs from a topic to accelerate question bank growth.">
          <div className="grid gap-4">
            <div>
              <label className={examLabelClass}>Topic</label>
              <input className={examInputClass} value={aiForm.topic} onChange={(e) => setAiForm((prev) => ({ ...prev, topic: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={examLabelClass}>Number of questions</label>
                <input className={examInputClass} type="number" min="1" max="20" value={aiForm.count} onChange={(e) => setAiForm((prev) => ({ ...prev, count: e.target.value }))} />
              </div>
              <div>
                <label className={examLabelClass}>Difficulty</label>
                <select className={examInputClass} value={aiForm.difficulty} onChange={(e) => setAiForm((prev) => ({ ...prev, difficulty: e.target.value }))}>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
            <button type="button" onClick={generateAi} className={examBtnPrimary}>
              <Bot className="h-4 w-4" /> Generate questions
            </button>
          </div>
        </OnlineExamSection>
      </div>

      <OnlineExamSection title="My reusable questions" subtitle="Search and reuse previous MCQs by topic and difficulty.">
        <div className="mb-4">
          <input className={examInputClass} placeholder="Search questions or topics" value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} />
        </div>
        {!rows.length ? (
          <OnlineExamEmptyState title="Question bank is empty" message="Start by adding a question or importing a CSV file above." />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{row.questionText}</p>
                      <OnlineExamBadge status={row.sourceType} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {row.topic || "General"} | {row.difficulty} | {row.marks} marks | Negative {row.negativeMarks || 0}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeQuestion(row._id)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </OnlineExamSection>
    </div>
  );
}

export default TeacherQuestionBankPage;
