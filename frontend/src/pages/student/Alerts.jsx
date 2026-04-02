import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

function StudentAlertsPage() {
  const [alerts, setAlerts] = useState([]);

  const load = async () => {
    try {
      setAlerts(await studentService.getAlerts());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await studentService.markAlertRead(id);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <FormCard title="Alerts / Notifications" subtitle="Real-time updates and announcement alerts.">
      <div className="space-y-2 text-sm">
        {alerts.map((item) => (
          <div key={item._id} className={`rounded border p-3 ${item.isRead ? "border-gray-100 bg-gray-50" : "border-brand-200 bg-brand-50"}`}>
            <div className="font-semibold text-gray-900">{item.title}</div>
            <div className="text-gray-600">{item.message}</div>
            {!item.isRead && (
              <button className="btn-secondary mt-2 px-2 py-1 text-xs" type="button" onClick={() => markRead(item._id)}>
                Mark as read
              </button>
            )}
          </div>
        ))}
        {!alerts.length && <div className="text-gray-500">No alerts available.</div>}
      </div>
    </FormCard>
  );
}

export default StudentAlertsPage;
