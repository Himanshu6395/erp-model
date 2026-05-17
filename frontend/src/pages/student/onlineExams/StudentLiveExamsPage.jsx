import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamEmptyState, OnlineExamHero, OnlineExamSection, examBtnPrimary, formatExamDate } from "../../../components/onlineExams/onlineExamUi";
import { studentService } from "../../../services/studentService";

function StudentLiveExamsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentService.getOnlineExams();
        setRows((data || []).filter((item) => item.bucket === "live"));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader text="Loading live exams..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero badge="Live exams" title="Enter active CBT exams with a focused attempt interface" subtitle="Live exams include autosave, review marking, timer tracking, and exam security checks for a cleaner digital test experience." />
      <OnlineExamSection title="Attempt now" subtitle="Only exams currently within the live time window can be started.">
        {!rows.length ? (
          <OnlineExamEmptyState title="No live exams" message="When an exam goes live for your class, it will appear here instantly." />
        ) : (
          <div className="space-y-4">
            {rows.map((exam) => (
              <div key={exam._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                      <OnlineExamBadge status="LIVE" />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{exam.subjectName || "Subject"} | {exam.totalMarks} marks | {exam.durationMinutes} minutes</p>
                    <p className="mt-1 text-sm text-slate-600">Ends {formatExamDate(exam.endDateTime, true)}</p>
                  </div>
                  <Link to={`/student/online-exams/live/${exam._id}/attempt`} className={examBtnPrimary}>
                    Start exam
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </OnlineExamSection>
    </div>
  );
}

export default StudentLiveExamsPage;
