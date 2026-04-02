import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherLeavesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ leaveType: "", startDate: "", endDate: "", reason: "" });

  const load = async () => {
    try {
      setItems(await teacherService.getLeaves());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async () => {
    try {
      await teacherService.applyLeave(form);
      toast.success("Leave applied");
      setForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancel = async (leaveId) => {
    try {
      await teacherService.cancelLeave(leaveId);
      toast.success("Leave cancelled");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Apply Leave" subtitle="Submit leave request and track status.">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Leave Type" value={form.leaveType} onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value }))} />
          <input className="input" type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
          <input className="input" type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          <input className="input" placeholder="Reason" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
        </div>
        <button className="btn-primary mt-3 w-fit" type="button" onClick={apply}>
          Apply Leave
        </button>
      </FormCard>

      <FormCard title="Leave History" subtitle="Cancel leave while pending/active.">
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              {item.leaveType} | {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()} | {item.status}
              {item.status !== "CANCELLED" && (
                <button className="btn-secondary ml-3 px-2 py-1 text-xs" type="button" onClick={() => cancel(item._id)}>
                  Cancel
                </button>
              )}
            </div>
          ))}
          {!items.length && <div className="text-gray-500">No leave records.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherLeavesPage;
