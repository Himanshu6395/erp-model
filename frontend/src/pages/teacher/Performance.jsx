import { useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherPerformancePage() {
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      setData(await teacherService.getPerformanceInsights());
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Student Performance Insights" subtitle="Weak-student identification using attendance + marks.">
        <button className="btn-secondary w-fit" type="button" onClick={load}>
          Generate Insights
        </button>
        {data && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2">Total students analyzed: {data.totalStudents}</div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2">AI Insight: {data.aiInsight}</div>
            {data.weakStudents.map((item) => (
              <div key={item.studentId} className="rounded border border-red-200 bg-red-50 px-3 py-2">
                {item.name} | Attendance {item.attendancePercentage}% | Avg Marks {item.averageMarks} | {item.insight}
              </div>
            ))}
            {!data.weakStudents.length && <div className="text-gray-500">No weak students detected by current criteria.</div>}
          </div>
        )}
      </FormCard>
    </div>
  );
}

export default TeacherPerformancePage;
