import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherNotificationsPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      setItems(await teacherService.getNotifications());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (notificationId) => {
    try {
      await teacherService.markNotificationRead(notificationId);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <FormCard title="Notifications" subtitle="Real-time alerts with read/unread status.">
      <div className="space-y-2 text-sm">
        {items.map((item) => (
          <div key={item._id} className={`rounded border px-3 py-2 ${item.isRead ? "border-gray-100 bg-gray-50" : "border-brand-200 bg-brand-50"}`}>
            <div className="font-medium text-gray-900">{item.title}</div>
            <div className="text-gray-600">{item.message}</div>
            <div className="mt-1 text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
            {!item.isRead && (
              <button className="btn-secondary mt-2 px-2 py-1 text-xs" type="button" onClick={() => markRead(item._id)}>
                Mark as read
              </button>
            )}
          </div>
        ))}
        {!items.length && <div className="text-gray-500">No notifications.</div>}
      </div>
    </FormCard>
  );
}

export default TeacherNotificationsPage;
