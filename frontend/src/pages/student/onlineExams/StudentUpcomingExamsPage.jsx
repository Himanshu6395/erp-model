import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamEmptyState, OnlineExamHero, OnlineExamSection, examBtnSecondary, formatExamDate } from "../../../components/onlineExams/onlineExamUi";
import { studentService } from "../../../services/studentService";

function StudentUpcomingExamsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentService.getOnlineExams();
        setRows((data || []).filter((item) => item.bucket === "upcoming"));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader text="Loading upcoming exams..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero badge="Upcoming exams" title="See what is scheduled for your class" subtitle="Every upcoming online exam is already mapped to your class and section with the timing, duration, and marks visible before exam day." />
      <OnlineExamSection title="Scheduled exams" subtitle="Prepare in advance with exam timing, marks, and instructions.">
        {!rows.length ? (
          <OnlineExamEmptyState title="No upcoming exams" message="New online exams assigned to your class will appear here automatically." />
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
                    <p className="mt-2 text-sm text-slate-500">{exam.subjectName || "Subject"} | {exam.totalMarks} marks | {exam.durationMinutes} minutes</p>
                    <p className="mt-1 text-sm text-slate-600">Starts {formatExamDate(exam.startDateTime, true)}</p>
                  </div>
                  <Link to={`/student/online-exams/live/${exam._id}/attempt`} className={examBtnSecondary}>
                    View instructions
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

export default StudentUpcomingExamsPage;
