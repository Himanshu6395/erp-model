import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import Loader from "../../../components/Loader";
import { OnlineExamHero, OnlineExamSection, examBtnPrimary, examInputClass, examLabelClass } from "../../../components/onlineExams/onlineExamUi";
import { teacherService } from "../../../services/teacherService";

const initialForm = {
  title: "",
  subjectId: "",
  classId: "",
  section: "",
  instructions: "",
  totalMarks: "",
  durationMinutes: 60,
  passingMarks: "",
  startDateTime: "",
  endDateTime: "",
  negativeMarkingEnabled: false,
  negativeMarkPerQuestion: 0,
  randomQuestionsEnabled: true,
  shuffleOptionsEnabled: true,
  autoSubmitEnabled: true,
};

function TeacherCreateExamPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [context, setContext] = useState({ classes: [], subjects: [] });
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const load = async () => {
      try {
        const [contextData, questions] = await Promise.all([
          teacherService.getOnlineExamContext(),
          teacherService.getOnlineQuestionBank({ limit: 100 }),
        ]);
        setContext(contextData);
        setQuestionBank(questions.data || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const classSections = useMemo(() => {
    const selectedClass = context.classes.find((item) => item._id === form.classId);
    return selectedClass ? [selectedClass.section].filter(Boolean) : [];
  }, [context.classes, form.classId]);

  const filteredQuestions = useMemo(
    () =>
      questionBank.filter((question) => {
        if (form.subjectId && String(question.subjectId) !== String(form.subjectId)) return false;
        if (form.classId && String(question.classId) !== String(form.classId)) return false;
        return true;
      }),
    [form.classId, form.subjectId, questionBank]
  );

  const derivedMarks = useMemo(
    () =>
      filteredQuestions
        .filter((question) => selectedQuestionIds.includes(question._id))
        .reduce((sum, question) => sum + Number(question.marks || 0), 0),
    [filteredQuestions, selectedQuestionIds]
  );

  const toggleQuestion = (questionId) => {
    setSelectedQuestionIds((current) => (current.includes(questionId) ? current.filter((item) => item !== questionId) : [...current, questionId]));
  };

  const submit = async () => {
    if (!selectedQuestionIds.length) {
      toast.error("Select at least one question");
      return;
    }
    setSaving(true);
    try {
      await teacherService.createOnlineExam({
        ...form,
        totalMarks: Number(form.totalMarks || derivedMarks || 0),
        passingMarks: Number(form.passingMarks || 0),
        durationMinutes: Number(form.durationMinutes || 60),
        questionIds: selectedQuestionIds,
      });
      toast.success("Online exam created");
      setForm(initialForm);
      setSelectedQuestionIds([]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading exam builder..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero
        badge="Create exam"
        title="Build timed online exams for assigned classes"
        subtitle="Choose only from your connected classes, sections, subjects, and reusable MCQ bank so every exam stays mapped to your teaching workload."
      />

      <OnlineExamSection
        title="Exam configuration"
        subtitle="Set the schedule, marks, timer, and anti-cheating rules before assigning the question set."
        actions={
          <button type="button" onClick={submit} className={examBtnPrimary} disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Create exam"}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Exam Title", "title", "text"],
            ["Total Marks", "totalMarks", "number"],
            ["Duration (minutes)", "durationMinutes", "number"],
            ["Passing Marks", "passingMarks", "number"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className={examLabelClass}>{label}</label>
              <input className={examInputClass} type={type} value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} />
            </div>
          ))}

          <div>
            <label className={examLabelClass}>Subject</label>
            <select className={examInputClass} value={form.subjectId} onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}>
              <option value="">Select subject</option>
              {context.subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={examLabelClass}>Class</label>
            <select className={examInputClass} value={form.classId} onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value, section: "" }))}>
              <option value="">Select class</option>
              {context.classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={examLabelClass}>Section</label>
            <select className={examInputClass} value={form.section} onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}>
              <option value="">Select section</option>
              {classSections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={examLabelClass}>Start date & time</label>
            <input className={examInputClass} type="datetime-local" value={form.startDateTime} onChange={(e) => setForm((prev) => ({ ...prev, startDateTime: e.target.value }))} />
          </div>
          <div>
            <label className={examLabelClass}>End date & time</label>
            <input className={examInputClass} type="datetime-local" value={form.endDateTime} onChange={(e) => setForm((prev) => ({ ...prev, endDateTime: e.target.value }))} />
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <label className={examLabelClass}>Exam description / instructions</label>
            <textarea className={`${examInputClass} min-h-32`} value={form.instructions} onChange={(e) => setForm((prev) => ({ ...prev, instructions: e.target.value }))} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Negative marking", "negativeMarkingEnabled"],
            ["Random question order", "randomQuestionsEnabled"],
            ["Random options order", "shuffleOptionsEnabled"],
            ["Auto submit on timeout", "autoSubmitEnabled"],
          ].map(([label, key]) => (
            <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700">
              <span>{label}</span>
              <input type="checkbox" checked={!!form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.checked }))} />
            </label>
          ))}
          <div>
            <label className={examLabelClass}>Negative marks per wrong answer</label>
            <input className={examInputClass} type="number" min="0" step="0.25" value={form.negativeMarkPerQuestion} onChange={(e) => setForm((prev) => ({ ...prev, negativeMarkPerQuestion: e.target.value }))} />
          </div>
        </div>
      </OnlineExamSection>

      <OnlineExamSection title="Attach question set" subtitle="Select reusable MCQs from your bank. Total marks auto-calculate from selected questions.">
        <div className="mb-4 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm text-brand-800">
          Selected questions: <span className="font-bold">{selectedQuestionIds.length}</span> | Derived marks: <span className="font-bold">{derivedMarks}</span>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {filteredQuestions.map((question) => (
            <label key={question._id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <input type="checkbox" checked={selectedQuestionIds.includes(question._id)} onChange={() => toggleQuestion(question._id)} className="mt-1" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{question.questionText}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {question.topic || "General"} | {question.difficulty} | {question.questionType} | {question.marks} marks
                </p>
              </div>
            </label>
          ))}
        </div>
        {!filteredQuestions.length ? <p className="text-sm text-slate-500">No questions match the selected subject/class yet. Add them in Question Bank.</p> : null}
      </OnlineExamSection>
    </div>
  );
}

export default TeacherCreateExamPage;
