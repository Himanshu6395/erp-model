import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamEmptyState, OnlineExamHero, OnlineExamSection, formatExamDate } from "../../../components/onlineExams/onlineExamUi";
import { studentService } from "../../../services/studentService";

function StudentCompletedExamsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentService.getOnlineExams();
        setRows((data || []).filter((item) => item.bucket === "completed"));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader text="Loading completed exams..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero badge="Completed exams" title="Review closed exam windows" subtitle="Completed exams stay visible for reference, even after the live attempt period has ended." />
      <OnlineExamSection title="Closed exams" subtitle="Use this history to remember what has already been attempted or closed for your class.">
        {!rows.length ? (
          <OnlineExamEmptyState title="No completed exams" message="Completed online exams will collect here after the exam window closes." />
        ) : (
          <div className="space-y-4">
            {rows.map((exam) => (
              <div key={exam._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                      <OnlineExamBadge status={exam.computedStatus || exam.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{exam.subjectName || "Subject"} | {exam.totalMarks} marks</p>
                    <p className="mt-1 text-sm text-slate-600">Closed on {formatExamDate(exam.endDateTime, true)}</p>
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

export default StudentCompletedExamsPage;
