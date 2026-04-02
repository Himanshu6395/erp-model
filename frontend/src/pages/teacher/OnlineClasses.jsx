import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherOnlineClassesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ classId: "", subject: "", date: "", meetingLink: "" });

  const load = async () => {
    try {
      setItems(await teacherService.getOnlineClasses());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await teacherService.scheduleOnlineClass(form);
      toast.success("Online class scheduled");
      setForm({ classId: "", subject: "", date: "", meetingLink: "" });
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Schedule Online Class" subtitle="Add Google Meet / Zoom links for classes.">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Class ID" value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} />
          <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
          <input className="input" type="datetime-local" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          <input className="input" placeholder="Meeting Link" value={form.meetingLink} onChange={(e) => setForm((p) => ({ ...p, meetingLink: e.target.value }))} />
        </div>
        <button className="btn-primary mt-3 w-fit" type="button" onClick={save}>
          Schedule
        </button>
      </FormCard>

      <FormCard title="Scheduled Online Classes" subtitle="Upcoming and past sessions.">
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              {new Date(item.date).toLocaleString()} | {item.subject} | {item.classId?.name}-{item.classId?.section} |{" "}
              <a className="text-brand-700 underline" href={item.meetingLink} target="_blank" rel="noreferrer">
                Join Link
              </a>
            </div>
          ))}
          {!items.length && <div className="text-gray-500">No online classes scheduled.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherOnlineClassesPage;
