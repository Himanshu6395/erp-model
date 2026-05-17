import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Clock3, Flag, Save } from "lucide-react";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamHero, OnlineExamSection, examBtnPrimary, examBtnSecondary } from "../../../components/onlineExams/onlineExamUi";
import { studentService } from "../../../services/studentService";

function StudentOnlineExamAttemptPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [attemptState, setAttemptState] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        setDetail(await studentService.getOnlineExamDetail(examId));
      } catch (error) {
        toast.error(error.message);
        navigate("/student/online-exams/live");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId, navigate]);

  useEffect(() => {
    if (!started || !attemptState?.attempt?.expiresAt) return undefined;
    const tick = () => {
      const seconds = Math.max(0, Math.floor((new Date(attemptState.attempt.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(seconds);
      if (seconds === 0 && !autoSubmitRef.current) {
        autoSubmitRef.current = true;
        submitExam(true);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [started, attemptState]);

  useEffect(() => {
    if (!started || !attemptState?.attempt?._id) return undefined;
    const attemptId = attemptState.attempt._id;
    const onVisibility = () => {
      if (document.hidden) {
        studentService.logOnlineExamActivity(attemptId, { type: "TAB_SWITCH", message: "Student switched browser tab" }).catch(() => {});
      }
    };
    const onContextMenu = (event) => {
      event.preventDefault();
      studentService.logOnlineExamActivity(attemptId, { type: "RIGHT_CLICK_BLOCKED", message: "Right click blocked" }).catch(() => {});
    };
    const onCopyPaste = (event) => {
      event.preventDefault();
      studentService.logOnlineExamActivity(attemptId, { type: "COPY_PASTE_BLOCKED", message: "Copy/paste blocked" }).catch(() => {});
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        studentService.logOnlineExamActivity(attemptId, { type: "FULL_SCREEN_EXIT", message: "Fullscreen exited" }).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopyPaste);
    document.addEventListener("paste", onCopyPaste);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopyPaste);
      document.removeEventListener("paste", onCopyPaste);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [started, attemptState]);

  const activeQuestion = attemptState?.questions?.[activeIndex];
  const answeredCount = useMemo(() => (attemptState?.attempt?.answers || []).filter((answer) => (answer.selectedOptions?.length || 0) > 0 || answer.textAnswer).length, [attemptState]);

  const formatCountdown = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const startExam = async () => {
    try {
      const response = await studentService.startOnlineExam(examId);
      setAttemptState(response);
      setStarted(true);
      await document.documentElement.requestFullscreen?.().catch(() => {});
      toast.success("Exam started");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const patchAnswerState = (updater) => {
    setAttemptState((current) => {
      if (!current) return current;
      const answers = current.attempt.answers.map((answer, index) => (index === activeIndex ? { ...answer, ...updater(answer) } : answer));
      return { ...current, attempt: { ...current.attempt, answers } };
    });
  };

  const saveCurrentAnswer = async ({ next = false, markForReview = false } = {}) => {
    if (!attemptState?.attempt?._id || !activeQuestion) return;
    const currentAnswer = attemptState.attempt.answers[activeIndex];
    try {
      const payload = {
        questionId: activeQuestion._id,
        selectedOptions: currentAnswer.selectedOptions || [],
        textAnswer: currentAnswer.textAnswer || "",
        isMarkedForReview: markForReview ? true : currentAnswer.isMarkedForReview,
      };
      await studentService.saveOnlineExamAnswer(attemptState.attempt._id, payload);
      patchAnswerState(() => ({ isMarkedForReview: payload.isMarkedForReview, isVisited: true }));
      if (next && activeIndex < attemptState.questions.length - 1) setActiveIndex((index) => index + 1);
      toast.success(markForReview ? "Marked for review" : "Answer saved");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submitExam = async (autoSubmitted = false) => {
    if (!attemptState?.attempt?._id) return;
    setSubmitting(true);
    try {
      await studentService.submitOnlineExam(attemptState.attempt._id, { autoSubmitted });
      toast.success(autoSubmitted ? "Time is up. Exam auto-submitted." : "Exam submitted successfully");
      if (document.fullscreenElement) {
        await document.exitFullscreen?.().catch(() => {});
      }
      navigate("/student/online-exams/results");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading exam instructions..." />;
  if (!detail?.exam) return null;

  if (!started || !attemptState) {
    return (
      <div className="space-y-8">
        <OnlineExamHero badge="Exam instructions" title={detail.exam.title} subtitle={detail.exam.instructions || "Read the instructions carefully. Your timer begins once you enter the live exam interface."} actions={<OnlineExamBadge status={detail.exam.computedStatus || detail.exam.status} />} />
        <OnlineExamSection title="Before you begin" subtitle="Review the rules and prepare your device for a smooth online exam attempt.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total questions</p><p className="mt-2 text-3xl font-bold text-slate-950">{detail.questions.length}</p></div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Duration</p><p className="mt-2 text-3xl font-bold text-slate-950">{detail.exam.durationMinutes} min</p></div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total marks</p><p className="mt-2 text-3xl font-bold text-slate-950">{detail.exam.totalMarks}</p></div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Passing marks</p><p className="mt-2 text-3xl font-bold text-slate-950">{detail.exam.passingMarks}</p></div>
          </div>
          <div className="mt-6 space-y-3 rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-900">
            <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>Tab switching, right click, and copy/paste are tracked. Stay in full-screen mode for the best attempt experience.</p></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><p>Answers are saved as you move. Use “Mark for review” if you want to revisit a question later.</p></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className={examBtnPrimary} onClick={startExam}>Start exam</button>
            <button type="button" className={examBtnSecondary} onClick={() => navigate("/student/online-exams/upcoming")}>Back to list</button>
          </div>
        </OnlineExamSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-3 z-20 rounded-[2rem] border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{detail.exam.subjectName || "Online exam"}</p>
            <h1 className="text-2xl font-bold text-slate-950">{detail.exam.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"><Clock3 className="h-4 w-4" /> {formatCountdown(timeLeft)}</span>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">Answered {answeredCount}/{attemptState.questions.length}</span>
            <button type="button" className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md" onClick={() => submitExam(false)} disabled={submitting}>Submit exam</button>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500" style={{ width: `${((answeredCount || 0) / attemptState.questions.length) * 100}%` }} /></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[260px,minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-900">Question palette</h2><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{attemptState.questions.length} total</span></div>
          <div className="grid grid-cols-4 gap-2">
            {attemptState.questions.map((question, index) => {
              const answer = attemptState.attempt.answers[index];
              const answered = (answer?.selectedOptions?.length || 0) > 0 || answer?.textAnswer;
              const review = answer?.isMarkedForReview;
              return (
                <button key={question._id} type="button" onClick={() => setActiveIndex(index)} className={`flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold transition ${index === activeIndex ? "bg-brand-600 text-white" : review ? "bg-amber-100 text-amber-800" : answered ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>
        <OnlineExamSection title={`Question ${activeIndex + 1}`} subtitle={`${activeQuestion?.questionType || "MCQ"} | ${activeQuestion?.marks || 0} marks`}>
          {activeQuestion ? (
            <div className="space-y-6">
              <p className="text-lg font-semibold leading-relaxed text-slate-900">{activeQuestion.questionText}</p>
              <div className="space-y-3">
                {(activeQuestion.options || []).map((option) => {
                  const selected = (attemptState.attempt.answers[activeIndex]?.selectedOptions || []).includes(option.key);
                  return (
                    <label key={option.key} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${selected ? "border-brand-300 bg-brand-50/80" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                      <input type="radio" name={`question-${activeQuestion._id}`} checked={selected} onChange={() => patchAnswerState(() => ({ selectedOptions: [option.key], textAnswer: "" }))} className="mt-1" />
                      <div><p className="font-semibold text-slate-900">{option.key}. {option.text}</p></div>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className={examBtnSecondary} onClick={() => saveCurrentAnswer({ markForReview: true })}><Flag className="h-4 w-4" /> Mark for review</button>
                <button type="button" className={examBtnSecondary} onClick={() => saveCurrentAnswer()}><Save className="h-4 w-4" /> Save answer</button>
                <button type="button" className={examBtnPrimary} onClick={() => saveCurrentAnswer({ next: true })}>Save & next</button>
              </div>
            </div>
          ) : null}
        </OnlineExamSection>
      </div>
    </div>
  );
}

export default StudentOnlineExamAttemptPage;
