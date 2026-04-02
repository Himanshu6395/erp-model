import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherDoubtsPage() {
  const [items, setItems] = useState([]);
  const [answerMap, setAnswerMap] = useState({});

  const load = async () => {
    try {
      setItems(await teacherService.getDoubts());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitAnswer = async (doubtId) => {
    const answer = answerMap[doubtId] || "";
    if (!answer.trim()) return toast.error("Answer is required");
    try {
      await teacherService.answerDoubt(doubtId, answer);
      toast.success("Answer submitted");
      setAnswerMap((prev) => ({ ...prev, [doubtId]: "" }));
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Doubt / Query System" subtitle="Reply to student doubts.">
        <div className="space-y-3 text-sm">
          {items.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 p-3">
              <div className="font-medium text-gray-900">Student: {item.studentId?.userId?.name || "-"}</div>
              <div className="mt-1 text-gray-700">Q: {item.question}</div>
              <div className="mt-1 text-gray-700">A: {item.answer || "-"}</div>
              <div className="mt-2 flex gap-2">
                <input
                  className="input"
                  placeholder="Write answer"
                  value={answerMap[item._id] || ""}
                  onChange={(e) => setAnswerMap((prev) => ({ ...prev, [item._id]: e.target.value }))}
                />
                <button className="btn-secondary" type="button" onClick={() => submitAnswer(item._id)}>
                  Reply
                </button>
              </div>
            </div>
          ))}
          {!items.length && <div className="text-gray-500">No doubts available.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherDoubtsPage;
