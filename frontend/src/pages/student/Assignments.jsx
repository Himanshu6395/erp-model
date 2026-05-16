import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, Send } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { PageHeader, PageCard, EmptyState, inputClass, btnSecondary } from "./studentPageUi";

function StudentAssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submissionText, setSubmissionText] = useState({});

  const fetchData = async () => {
    try {
      const result = await studentService.getAssignments();
      setAssignments(result);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submit = async (assignmentId) => {
    try {
      await studentService.submitAssignment({
        assignmentId,
        submissionText: submissionText[assignmentId] || "",
        attachments: [],
      });
      toast.success("Homework submitted");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader text="Loading assignments..." />;

  return (
    <div className="space-y-6">
      <PageHeader badge="Academics" title="Assignments" subtitle="View homework, download attachments, and submit your work." />

      {!assignments.length ? (
        <EmptyState icon={BookOpen} title="No assignments available" message="New tasks from your teachers will appear here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((item) => (
            <PageCard key={item._id} title={item.title} subtitle={`Subject: ${item.subject || "—"}`} icon={BookOpen}>
              <p className="text-sm text-slate-600">{item.description || "—"}</p>
              <p className="mt-2 text-sm text-slate-600">
                Due: <span className="font-semibold text-slate-800">{new Date(item.dueDate).toLocaleDateString()}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-700">Status: {item.submissionStatus}</p>
              {(item.attachments || []).map((url) => (
                <a key={url} className="mt-2 block text-sm font-medium text-brand-600 hover:underline" href={url} target="_blank" rel="noreferrer">
                  Download attachment
                </a>
              ))}
              {item.submissionStatus !== "SUBMITTED" && (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <textarea
                    className={`${inputClass} min-h-20`}
                    placeholder="Write submission note"
                    value={submissionText[item._id] || ""}
                    onChange={(e) => setSubmissionText((prev) => ({ ...prev, [item._id]: e.target.value }))}
                  />
                  <button className={btnSecondary} type="button" onClick={() => submit(item._id)}>
                    <Send className="h-4 w-4" />
                    Submit homework
                  </button>
                </div>
              )}
            </PageCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentAssignmentsPage;
