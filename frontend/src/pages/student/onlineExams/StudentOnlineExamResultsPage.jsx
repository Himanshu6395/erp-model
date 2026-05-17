import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamEmptyState, OnlineExamHero, OnlineExamSection } from "../../../components/onlineExams/onlineExamUi";
import { studentService } from "../../../services/studentService";

function StudentOnlineExamResultsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setRows(await studentService.getOnlineExamResults());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader text="Loading exam results..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero badge="Results" title="Check your online exam scores" subtitle="See marks, percentage, pass status, and evaluation progress once results become visible to students." />
      <OnlineExamSection title="Published results" subtitle="Only visible result records appear here after submission and publication.">
        {!rows.length ? (
          <OnlineExamEmptyState title="No results yet" message="Your result cards will appear here once an online exam has been submitted and published." />
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{row.examId?.title || "Exam"}</h3>
                      <OnlineExamBadge status={row.evaluationStatus} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{row.examId?.subjectName || "Subject"} | {row.obtainedMarks}/{row.totalMarks} | {row.percentage}%</p>
                    <p className="mt-1 text-sm text-slate-600">{row.passed ? "Passed" : "Failed"} | Correct {row.correctAnswers} | Wrong {row.wrongAnswers}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Rank</p>
                    <p className="text-2xl font-bold text-brand-700">{row.rank || "-"}</p>
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

export default StudentOnlineExamResultsPage;
