import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import { studentService } from "../../services/studentService";
import { PageHeader, PageCard, EmptyState, btnSecondary } from "./studentPageUi";

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
    <div className="space-y-6">
      <PageHeader badge="Notifications" title="Alerts" subtitle="Real-time updates and announcement alerts." />

      <PageCard title="All notifications" subtitle="Mark items as read once you've seen them." icon={Bell}>
        {!alerts.length ? (
          <EmptyState icon={Bell} title="No alerts available" message="You're all caught up — check back later." />
        ) : (
          <div className="space-y-3">
            {alerts.map((item) => (
              <div
                key={item._id}
                className={`rounded-2xl border p-4 transition ${
                  item.isRead ? "border-slate-100 bg-slate-50/80" : "border-brand-200 bg-brand-50/60 ring-1 ring-brand-100"
                }`}
              >
                <div className="font-semibold text-slate-900">{item.title}</div>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                {!item.isRead && (
                  <button className={`${btnSecondary} mt-3 px-3 py-1.5 text-xs`} type="button" onClick={() => markRead(item._id)}>
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
}

export default StudentAlertsPage;
