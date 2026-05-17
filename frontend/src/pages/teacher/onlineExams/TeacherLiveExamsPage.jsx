import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PlayCircle, Send, StopCircle } from "lucide-react";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamEmptyState, OnlineExamHero, OnlineExamSection, examBtnPrimary, examBtnSecondary, formatExamDate } from "../../../components/onlineExams/onlineExamUi";
import { teacherService } from "../../../services/teacherService";

function TeacherLiveExamsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      const data = await teacherService.getOnlineExams({ limit: 100 });
      setRows(data.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const requestApproval = async (examId) => {
    try {
      await teacherService.submitOnlineExamForApproval(examId);
      toast.success("Approval requested");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const startExam = async (exam) => {
    try {
      await teacherService.updateOnlineExam(exam._id, { startDateTime: new Date().toISOString(), status: "APPROVED" });
      await teacherService.publishOnlineExam(exam._id);
      toast.success("Exam started");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const endExam = async (exam) => {
    try {
      await teacherService.updateOnlineExam(exam._id, { endDateTime: new Date().toISOString(), status: "COMPLETED" });
      toast.success("Exam ended");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader text="Loading live exam workspace..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero
        badge="Live exam management"
        title="Start, publish, and close timed class exams"
        subtitle="Move exams from draft to approval to live delivery, while keeping teacher control over the real exam window."
      />

      <OnlineExamSection title="Exam operations" subtitle="Only approved exams should be published to students.">
        {!rows.length ? (
          <OnlineExamEmptyState title="No exams available" message="Create at least one exam before using live controls." />
        ) : (
          <div className="space-y-4">
            {rows.map((exam) => (
              <div key={exam._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                      <OnlineExamBadge status={exam.computedStatus || exam.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {exam.className} {exam.section ? `- ${exam.section}` : ""} | {exam.subjectName || "Subject"} | {exam.durationMinutes} min
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatExamDate(exam.startDateTime, true)} to {formatExamDate(exam.endDateTime, true)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exam.status === "DRAFT" ? (
                      <button type="button" className={examBtnSecondary} onClick={() => requestApproval(exam._id)}>
                        <Send className="h-4 w-4" /> Request approval
                      </button>
                    ) : null}
                    {["APPROVED", "PENDING_APPROVAL"].includes(exam.computedStatus || exam.status) ? (
                      <button type="button" className={examBtnPrimary} onClick={() => startExam(exam)}>
                        <PlayCircle className="h-4 w-4" /> Start exam
                      </button>
                    ) : null}
                    {(exam.computedStatus || exam.status) === "LIVE" ? (
                      <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md" onClick={() => endExam(exam)}>
                        <StopCircle className="h-4 w-4" /> End exam
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </OnlineExamSection>
    </div>
  );
}

export default TeacherLiveExamsPage;
