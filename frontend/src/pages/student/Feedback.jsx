import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

function StudentFeedbackPage() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [history, setHistory] = useState([]);

  const load = async () => {
    try {
      setHistory(await studentService.getFeedbackHistory());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      await studentService.submitFeedback({ message, rating });
      toast.success("Feedback submitted");
      setMessage("");
      setRating(5);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Feedback" subtitle="Submit feedback and view previous entries.">
        <div className="grid gap-3">
          <textarea className="input min-h-24" placeholder="Write feedback" value={message} onChange={(e) => setMessage(e.target.value)} />
          <select className="input w-40" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                Rating {r}
              </option>
            ))}
          </select>
          <button className="btn-primary w-fit" type="button" onClick={submit}>
            Submit Feedback
          </button>
        </div>
      </FormCard>

      <FormCard title="Previous Feedback" subtitle="Your submitted feedback history.">
        <div className="space-y-2 text-sm">
          {history.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 p-3">
              <div className="font-medium text-gray-900">Rating: {item.rating}/5</div>
              <div className="text-gray-600">{item.message}</div>
              <div className="text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {!history.length && <div className="text-gray-500">No feedback yet.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default StudentFeedbackPage;
