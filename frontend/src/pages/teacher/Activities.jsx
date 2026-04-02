import { useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherActivitiesPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      setItems(await teacherService.getActivities());
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <FormCard title="Activity Logs" subtitle="Track attendance, homework and marks actions with timestamp and IP.">
      <button className="btn-secondary w-fit" type="button" onClick={load}>
        Load Activity Logs
      </button>
      <div className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
            <div className="font-medium text-gray-900">{item.action}</div>
            <div className="text-gray-600">
              {new Date(item.createdAt).toLocaleString()} | IP: {item.ipAddress || "-"}
            </div>
          </div>
        ))}
        {!items.length && <div className="text-gray-500">No activity logs loaded.</div>}
      </div>
    </FormCard>
  );
}

export default TeacherActivitiesPage;
