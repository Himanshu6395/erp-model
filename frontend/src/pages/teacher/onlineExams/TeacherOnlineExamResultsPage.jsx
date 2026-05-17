import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamEmptyState, OnlineExamHero, OnlineExamSection, examBtnPrimary, examInputClass } from "../../../components/onlineExams/onlineExamUi";
import { teacherService } from "../../../services/teacherService";

function TeacherOnlineExamResultsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [manualMarks, setManualMarks] = useState({});

  const load = async () => {
    try {
      const data = await teacherService.getOnlineExamResults();
      setRows(data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const applyManualMarks = async (resultId) => {
    try {
      await teacherService.gradeOnlineExamResult(resultId, { additionalMarks: Number(manualMarks[resultId] || 0), resolvedCount: 1 });
      toast.success("Manual grading applied");
      setManualMarks((prev) => ({ ...prev, [resultId]: "" }));
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader text="Loading result center..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero
        badge="Results"
        title="Review scores, pass status, and pending manual grading"
        subtitle="Objective questions are auto-evaluated, while descriptive adjustments can be applied here when needed."
      />

      <OnlineExamSection title="Student attempts" subtitle="All available online exam results created from your own papers appear here.">
        {!rows.length ? (
          <OnlineExamEmptyState title="No student attempts yet" message="Results will appear once students submit online exams." />
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{row.studentId?.userId?.name || "Student"}</h3>
                      <OnlineExamBadge status={row.evaluationStatus} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {row.examId?.title || "Exam"} | Score {row.obtainedMarks}/{row.totalMarks} | {row.percentage}% | {row.passed ? "Passed" : "Failed"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Correct {row.correctAnswers} | Wrong {row.wrongAnswers} | Pending descriptive {row.descriptivePendingCount || 0}
                    </p>
                  </div>
                  {row.evaluationStatus === "PENDING_MANUAL" ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        className={examInputClass}
                        type="number"
                        placeholder="Additional marks"
                        value={manualMarks[row._id] || ""}
                        onChange={(e) => setManualMarks((prev) => ({ ...prev, [row._id]: e.target.value }))}
                      />
                      <button type="button" className={examBtnPrimary} onClick={() => applyManualMarks(row._id)}>
                        Apply grading
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </OnlineExamSection>
    </div>
  );
}

export default TeacherOnlineExamResultsPage;
