import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

const LEAVE_TYPES = [
  { value: "SICK", label: "Sick" },
  { value: "CASUAL", label: "Casual" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "OTHER", label: "Other" },
];

function inclusiveDays(fromStr, toStr) {
  if (!fromStr || !toStr) return "";
  const a = new Date(fromStr);
  const b = new Date(toStr);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  if (b < a) return "—";
  return String(Math.round((b - a) / 86400000) + 1);
}

function StudentLeaveApplyPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    leaveType: "SICK",
    fromDate: "",
    toDate: "",
    reason: "",
    contactPhone: "",
    parentName: "",
  });

  useEffect(() => {
    const run = async () => {
      try {
        const data = await studentService.getProfile();
        setProfile(data);
        setForm((p) => ({
          ...p,
          parentName: data?.parentName || "",
          contactPhone: data?.parentPhone || data?.phone || "",
        }));
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const totalDays = useMemo(() => inclusiveDays(form.fromDate, form.toDate), [form.fromDate, form.toDate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("leaveType", form.leaveType);
      fd.append("fromDate", form.fromDate);
      fd.append("toDate", form.toDate);
      fd.append("reason", form.reason.trim());
      fd.append("parentName", form.parentName.trim());
      fd.append("contactPhone", form.contactPhone.trim());
      if (file) fd.append("attachment", file);
      await studentService.applyLeave(fd);
      toast.success("Leave request submitted to your class teacher");
      setForm((p) => ({
        ...p,
        fromDate: "",
        toDate: "",
        reason: "",
      }));
      setFile(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading profile…</p>;

  const stu = profile;
  const className = stu?.classId?.name || stu?.classId?.section || "—";
  const section = stu?.section || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apply for leave</h1>
          <p className="text-sm text-gray-600">Request is sent to your class teacher for approval.</p>
        </div>
        <Link to="/student/leaves" className="btn-secondary w-fit text-sm">
          View my leaves
        </Link>
      </div>

      <FormCard title="Leave application" subtitle="Fields marked * are required. Dates use your local calendar day count.">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Student name</p>
              <p className="font-medium text-gray-900">{stu?.userId?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Student ID</p>
              <p className="font-medium text-gray-900">{stu?.rollNumber || String(stu?._id || "").slice(-8) || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Class</p>
              <p className="font-medium text-gray-900">{className}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Section</p>
              <p className="font-medium text-gray-900">{section}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Leave type *</span>
              <select
                className="input mt-1 w-full"
                value={form.leaveType}
                onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value }))}
                required
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="block text-sm">
              <span className="font-medium text-gray-700">Total days</span>
              <div className="input mt-1 flex items-center bg-white text-gray-800">{totalDays || "—"}</div>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">From date *</span>
              <input
                type="date"
                className="input mt-1 w-full"
                value={form.fromDate}
                onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">To date *</span>
              <input
                type="date"
                className="input mt-1 w-full"
                value={form.toDate}
                onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))}
                required
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">Reason *</span>
            <textarea
              className="input mt-1 min-h-[100px] w-full"
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              required
              placeholder="Describe why you need leave…"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Contact number *</span>
              <input
                type="tel"
                className="input mt-1 w-full"
                value={form.contactPhone}
                onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Parent / guardian name *</span>
              <input
                className="input mt-1 w-full"
                value={form.parentName}
                onChange={(e) => setForm((p) => ({ ...p, parentName: e.target.value }))}
                required
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">Attachment (optional)</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="mt-1 block w-full text-sm text-gray-600"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <span className="text-xs text-gray-500">PDF or image, max 5 MB (e.g. medical certificate)</span>
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit leave request"}
          </button>
        </form>
      </FormCard>
    </div>
  );
}

export default StudentLeaveApplyPage;
