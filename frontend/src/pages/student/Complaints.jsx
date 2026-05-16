import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, History } from "lucide-react";
import { studentService } from "../../services/studentService";
import { PageHeader, PageCard, EmptyState, inputClass, btnPrimary } from "./studentPageUi";

function StudentComplaintsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      setItems(await studentService.getComplaints());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      await studentService.createComplaint({ title, description });
      toast.success("Complaint raised");
      setTitle("");
      setDescription("");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader badge="Support" title="Complaints & grievances" subtitle="Raise a complaint and track resolution status." />

      <PageCard title="Raise complaint" subtitle="Describe your issue clearly for faster resolution." icon={AlertTriangle}>
        <div className="grid gap-4">
          <input className={inputClass} placeholder="Complaint title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={`${inputClass} min-h-24`} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className={`${btnPrimary} w-fit`} type="button" onClick={submit}>
            Raise complaint
          </button>
        </div>
      </PageCard>

      <PageCard title="Complaint history" subtitle="Track complaint resolution status." icon={History}>
        {!items.length ? (
          <EmptyState icon={History} title="No complaints found" message="Your raised complaints will appear here." />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="font-semibold text-slate-900">{item.title}</div>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Status: {item.status} · {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
}

export default StudentComplaintsPage;
