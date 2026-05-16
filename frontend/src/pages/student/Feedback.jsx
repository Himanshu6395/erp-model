import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MessageSquare, Star } from "lucide-react";
import { studentService } from "../../services/studentService";
import { PageHeader, PageCard, EmptyState, inputClass, btnPrimary } from "./studentPageUi";

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
      <PageHeader badge="Support" title="Feedback" subtitle="Share your experience and view previous submissions." />

      <PageCard title="Submit feedback" subtitle="Your feedback helps us improve the portal." icon={MessageSquare}>
        <div className="grid gap-4">
          <textarea className={`${inputClass} min-h-24`} placeholder="Write feedback" value={message} onChange={(e) => setMessage(e.target.value)} />
          <select className={`${inputClass} w-40`} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                Rating {r}
              </option>
            ))}
          </select>
          <button className={`${btnPrimary} w-fit`} type="button" onClick={submit}>
            Submit feedback
          </button>
        </div>
      </PageCard>

      <PageCard title="Previous feedback" subtitle="Your submitted feedback history." icon={Star}>
        {!history.length ? (
          <EmptyState icon={Star} title="No feedback yet" message="Your submissions will appear here." />
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="font-semibold text-slate-900">Rating: {item.rating}/5</div>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
}

export default StudentFeedbackPage;
