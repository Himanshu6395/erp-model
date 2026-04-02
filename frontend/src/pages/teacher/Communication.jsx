import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherCommunicationPage() {
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    receiverType: "class",
    receiverIds: "",
    channels: ["EMAIL"],
  });

  const load = async () => {
    try {
      const data = await teacherService.getCommunicationHistory();
      setHistory(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      await teacherService.sendCommunication({
        ...form,
        receiverIds: form.receiverIds
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      toast.success("Message sent");
      setForm({ title: "", message: "", receiverType: "class", receiverIds: "", channels: ["EMAIL"] });
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleChannel = (channel) => {
    setForm((prev) => {
      const has = prev.channels.includes(channel);
      return { ...prev, channels: has ? prev.channels.filter((c) => c !== channel) : [...prev.channels, channel] };
    });
  };

  return (
    <div className="space-y-6">
      <FormCard title="Send Communication" subtitle="Send message class-wise or to individual receivers.">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <select className="input" value={form.receiverType} onChange={(e) => setForm((p) => ({ ...p, receiverType: e.target.value }))}>
            <option value="class">class</option>
            <option value="student">student</option>
            <option value="parent">parent</option>
          </select>
          <textarea className="input min-h-24 sm:col-span-2" placeholder="Message" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
          <input className="input sm:col-span-2" placeholder="Receiver IDs comma-separated" value={form.receiverIds} onChange={(e) => setForm((p) => ({ ...p, receiverIds: e.target.value }))} />
          <div className="sm:col-span-2 flex flex-wrap gap-3 text-sm">
            {["EMAIL", "SMS", "WHATSAPP"].map((channel) => (
              <label key={channel} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.channels.includes(channel)} onChange={() => toggleChannel(channel)} />
                {channel}
              </label>
            ))}
          </div>
        </div>
        <button className="btn-primary mt-3 w-fit" type="button" onClick={submit}>
          Send Message
        </button>
      </FormCard>

      <FormCard title="Communication History" subtitle="Track sent notifications and channels.">
        <div className="space-y-2 text-sm">
          {history.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              <div className="font-medium text-gray-900">
                {item.title} ({item.receiverType})
              </div>
              <div className="text-gray-600">{item.message}</div>
              <div className="text-gray-500">
                Channels: {(item.channels || []).join(", ")} | {new Date(item.sentAt).toLocaleString()}
              </div>
            </div>
          ))}
          {!history.length && <div className="text-gray-500">No communication history.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherCommunicationPage;
