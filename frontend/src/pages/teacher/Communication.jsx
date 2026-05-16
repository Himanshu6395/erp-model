import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, MessageSquare, Send, Smartphone } from "lucide-react";
import { teacherService } from "../../services/teacherService";
import { EmptyState, inputClass, labelClass, PageCard, PageHeader } from "./teacherPageUi";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110";
const CHANNELS = [
  { id: "EMAIL", label: "Email", icon: Mail },
  { id: "SMS", label: "SMS", icon: Smartphone },
  { id: "WHATSAPP", label: "WhatsApp", icon: MessageSquare },
];

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
    <div className="space-y-8">
      <PageHeader
        badge="Outreach"
        title="Communication"
        subtitle="Send messages to classes, students, or parents via email, SMS, or WhatsApp."
      />

      <PageCard title="Compose message" subtitle="Class-wise or individual receivers." icon={Send}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Title</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Receiver type</label>
            <select className={inputClass} value={form.receiverType} onChange={(e) => setForm((p) => ({ ...p, receiverType: e.target.value }))}>
              <option value="class">Class</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Message</label>
            <textarea className={`${inputClass} min-h-28`} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Receiver IDs</label>
            <input
              className={inputClass}
              placeholder="Comma-separated IDs"
              value={form.receiverIds}
              onChange={(e) => setForm((p) => ({ ...p, receiverIds: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Channels</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CHANNELS.map(({ id, label, icon: Icon }) => {
                const on = form.channels.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleChannel(id)}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                      on
                        ? "border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <button className={`${btnPrimary} mt-4`} type="button" onClick={submit}>
          <Send className="h-4 w-4" /> Send message
        </button>
      </PageCard>

      <PageCard title="History" subtitle="Sent notifications and delivery channels." icon={MessageSquare}>
        {!history.length ? (
          <EmptyState icon={Mail} title="No messages yet" message="Your sent communications will appear here." />
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <article key={item._id} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900">
                    {item.title}{" "}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{item.receiverType}</span>
                  </h3>
                  <time className="text-xs text-slate-500">{new Date(item.sentAt).toLocaleString()}</time>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                <p className="mt-2 text-xs font-medium text-slate-500">{(item.channels || []).join(" · ")}</p>
              </article>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
}

export default TeacherCommunicationPage;
