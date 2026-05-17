import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { OnlineExamBadge, OnlineExamEmptyState, OnlineExamHero, OnlineExamSection, examInputClass, formatExamDate } from "../../../components/onlineExams/onlineExamUi";
import { teacherService } from "../../../services/teacherService";

function TeacherMyExamsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await teacherService.getOnlineExams({ search, limit: 100 });
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
  }, [search]);

  const requestApproval = async (examId) => {
    try {
      await teacherService.submitOnlineExamForApproval(examId);
      toast.success("Approval request sent");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader text="Loading your exams..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero
        badge="My exams"
        title="Track every exam you have created"
        subtitle="Search through draft, scheduled, live, and completed exams with quick approval actions for your own classes."
      />

      <OnlineExamSection title="Exam list" subtitle="Only exams created by you are visible here.">
        <div className="mb-4">
          <input className={examInputClass} placeholder="Search by exam, class, or subject" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {!rows.length ? (
          <OnlineExamEmptyState title="No exams yet" message="Create your first online exam to start managing this module." />
        ) : (
          <div className="space-y-3">
            {rows.map((exam) => (
              <div key={exam._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                      <OnlineExamBadge status={exam.computedStatus || exam.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {exam.subjectName || "Subject not mapped"} | {exam.className} {exam.section ? `- ${exam.section}` : ""} | {exam.totalMarks} marks | {exam.durationMinutes} minutes
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Starts {formatExamDate(exam.startDateTime, true)} | Ends {formatExamDate(exam.endDateTime, true)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exam.status === "DRAFT" ? (
                      <button type="button" onClick={() => requestApproval(exam._id)} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
                        Submit for approval
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

export default TeacherMyExamsPage;
