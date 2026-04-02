import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

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
      <FormCard title="Complaint / Grievances" subtitle="Raise complaint and track status.">
        <div className="grid gap-3">
          <input className="input" placeholder="Complaint Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="input min-h-24" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className="btn-primary w-fit" type="button" onClick={submit}>
            Raise Complaint
          </button>
        </div>
      </FormCard>

      <FormCard title="Complaint History" subtitle="Track complaint resolution status.">
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 p-3">
              <div className="font-semibold text-gray-900">{item.title}</div>
              <div className="text-gray-600">{item.description}</div>
              <div className="text-gray-500">
                Status: {item.status} | {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {!items.length && <div className="text-gray-500">No complaints found.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default StudentComplaintsPage;
