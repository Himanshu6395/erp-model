import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarDays, FileText, List } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import {
  PageCard,
  PageHeader,
  InfoGrid,
  inputClass,
  labelClass,
  btnPrimary,
  btnSecondary,
} from "./studentPageUi";

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

  if (loading) return <Loader text="Loading profile…" />;

  const stu = profile;
  const className = stu?.classId?.name || stu?.classId?.section || "—";
  const section = stu?.section || "—";

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Leave"
        title="Apply for leave"
        subtitle="Request is sent to your class teacher for approval."
        actions={
          <Link to="/student/leaves" className={btnSecondary}>
            <List className="h-4 w-4" />
            View my leaves
          </Link>
        }
      />

      <PageCard title="Leave application" subtitle="Fields marked * are required. Dates use your local calendar day count." icon={FileText}>
        <form onSubmit={onSubmit} className="space-y-5">
          <InfoGrid
            items={[
              { label: "Student name", value: stu?.userId?.name },
              { label: "Student ID", value: stu?.rollNumber || String(stu?._id || "").slice(-8) },
              { label: "Class", value: className },
              { label: "Section", value: section },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Leave type *</label>
              <select
                className={inputClass}
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
            </div>
            <div>
              <label className={labelClass}>Total days</label>
              <div className={`${inputClass} flex items-center bg-slate-50`}>{totalDays || "—"}</div>
            </div>
            <div>
              <label className={labelClass}>From date *</label>
              <input
                type="date"
                className={inputClass}
                value={form.fromDate}
                onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={labelClass}>To date *</label>
              <input
                type="date"
                className={inputClass}
                value={form.toDate}
                onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {totalDays && totalDays !== "—" ? (
            <p className="text-sm font-medium text-brand-700">
              <CalendarDays className="mr-1 inline h-4 w-4" />
              {totalDays} day(s) selected
            </p>
          ) : null}

          <div>
            <label className={labelClass}>Reason *</label>
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              required
              placeholder="Describe why you need leave…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Contact number *</label>
              <input
                type="tel"
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Parent / guardian name *</label>
              <input
                className={inputClass}
                value={form.parentName}
                onChange={(e) => setForm((p) => ({ ...p, parentName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Attachment (optional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="mt-1 block w-full text-sm text-slate-600"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <span className="mt-1 block text-xs text-slate-500">PDF or image, max 5 MB (e.g. medical certificate)</span>
          </div>

          <button type="submit" className={btnPrimary} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit leave request"}
          </button>
        </form>
      </PageCard>
    </div>
  );
}

export default StudentLeaveApplyPage;
