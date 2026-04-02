import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((item) => (
          <div key={item._id} className="card">
            <p className="text-lg font-semibold text-gray-900">{item.title}</p>
            <p className="mt-1 text-sm text-gray-600">Subject: {item.subject || "-"}</p>
            <p className="mt-1 text-sm text-gray-600">Description: {item.description || "-"}</p>
            <p className="mt-1 text-sm text-gray-600">Due Date: {new Date(item.dueDate).toLocaleDateString()}</p>
            <p className="mt-1 text-sm font-medium">Submission: {item.submissionStatus}</p>
            {(item.attachments || []).map((url) => (
              <a key={url} className="mt-1 block text-sm text-brand-700 underline" href={url} target="_blank" rel="noreferrer">
                Download Attachment
              </a>
            ))}
            {item.submissionStatus !== "SUBMITTED" && (
              <div className="mt-3 space-y-2">
                <textarea
                  className="input min-h-20"
                  placeholder="Write submission note"
                  value={submissionText[item._id] || ""}
                  onChange={(e) => setSubmissionText((prev) => ({ ...prev, [item._id]: e.target.value }))}
                />
                <button className="btn-secondary" type="button" onClick={() => submit(item._id)}>
                  Submit Homework
                </button>
              </div>
            )}
          </div>
        ))}
        {!assignments.length && <p className="text-sm text-gray-500">No assignments available.</p>}
      </div>
    </div>
  );
}

export default StudentAssignmentsPage;
