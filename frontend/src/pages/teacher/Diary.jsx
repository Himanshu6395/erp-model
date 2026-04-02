import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherDiaryPage() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ date: "", classId: "", subject: "", notes: "" });

  const load = async () => {
    try {
      setEntries(await teacherService.getDiary());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await teacherService.createDiary(form);
      toast.success("Diary entry saved");
      setForm({ date: "", classId: "", subject: "", notes: "" });
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Teacher Diary / Notes" subtitle="Daily notes and lesson planning.">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          <input className="input" placeholder="Class ID" value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} />
          <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
          <textarea className="input min-h-24 sm:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        </div>
        <button className="btn-primary mt-3 w-fit" type="button" onClick={save}>
          Save Notes
        </button>
      </FormCard>

      <FormCard title="Diary Entries" subtitle="Recent teaching notes.">
        <div className="space-y-2 text-sm">
          {entries.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              {new Date(item.date).toLocaleDateString()} | {item.subject} | {item.classId?.name}-{item.classId?.section}
              <div className="text-gray-600">{item.notes}</div>
            </div>
          ))}
          {!entries.length && <div className="text-gray-500">No diary notes.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherDiaryPage;
