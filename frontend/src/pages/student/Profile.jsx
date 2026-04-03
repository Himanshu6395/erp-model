import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaFileAlt, FaIdCard } from "react-icons/fa";
import FormCard from "../../components/FormCard";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function formatMoney(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return "—";
  return x.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-gray-900 break-words">{value ?? "—"}</div>
    </div>
  );
}

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-700 ring-gray-200",
  PASSED: "bg-blue-50 text-blue-800 ring-blue-200",
  TRANSFERRED: "bg-amber-50 text-amber-900 ring-amber-200",
};

function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    alternateMobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    parentPhone: "",
    profileImage: "",
  });

  const load = async () => {
    try {
      const data = await studentService.getProfile();
      setProfile(data);
      setForm({
        name: data.userId?.name || "",
        phone: data.phone || data.userId?.phone || "",
        alternateMobile: data.alternatePhone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        parentPhone: data.parentPhone || "",
        profileImage: data.profileImage || "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const documents = useMemo(() => {
    const raw = profile?.documents;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((d) => {
        if (typeof d === "string") return d.trim() ? { name: "Document", url: d.trim() } : null;
        const url = String(d?.url || d?.documentUrl || "").trim();
        const name = String(d?.name || d?.documentName || "").trim();
        return url ? { name: name || "Document", url } : null;
      })
      .filter(Boolean);
  }, [profile]);

  const save = async () => {
    setSaving(true);
    try {
      await studentService.updateProfile({
        name: form.name,
        phone: form.phone,
        mobileNumber: form.phone,
        alternateMobile: form.alternateMobile,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        parentPhone: form.parentPhone,
        profileImage: form.profileImage,
      });
      toast.success("Profile updated");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading your profile..." />;
  if (!profile) return <p className="text-sm text-gray-500">Profile could not be loaded.</p>;

  const user = profile.userId;
  const status = profile.status || "ACTIVE";
  const statusClass = STATUS_STYLES[status] || STATUS_STYLES.INACTIVE;
  const fee = profile.feeSummary || {};
  const displayName = user?.name || "Student";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-indigo-500/20" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {form.profileImage ? (
              <img
                src={form.profileImage}
                alt=""
                className="h-20 w-20 rounded-2xl border-2 border-white/20 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 text-2xl font-bold text-white/90">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
              <p className="mt-1 text-sm text-slate-300">{user?.email || "—"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass}`}>
                  {status}
                </span>
                {profile.studentCode ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-white/20">
                    <FaIdCard className="opacity-80" />
                    {profile.studentCode}
                  </span>
                ) : null}
                <span className="text-xs text-slate-400">Record ID: {profile._id}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm md:text-right">
            <div>
              <div className="text-slate-400">Attendance</div>
              <div className="font-semibold">{profile.attendanceSummary?.percentage ?? 0}%</div>
              <div className="text-xs text-slate-500">
                {profile.attendanceSummary?.presentDays ?? 0} / {profile.attendanceSummary?.totalDays ?? 0} days
              </div>
            </div>
            <div>
              <div className="text-slate-400">Avg. marks</div>
              <div className="font-semibold">{profile.performanceSummary?.averageMarks ?? 0}</div>
              <div className="text-xs text-slate-500">{profile.performanceSummary?.examsCount ?? 0} exams</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Total fees</div>
          <div className="mt-1 text-xl font-bold text-gray-900">₹{formatMoney(fee.total)}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Paid</div>
          <div className="mt-1 text-xl font-bold text-emerald-700">₹{formatMoney(fee.paid)}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Pending</div>
          <div className="mt-1 text-xl font-bold text-amber-700">₹{formatMoney(fee.pending)}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Fine</div>
          <div className="mt-1 text-xl font-bold text-gray-800">₹{formatMoney(fee.fine)}</div>
        </div>
      </div>

      <FormCard title="Academic" subtitle="Enrolment and roll information (read-only).">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Class" value={profile.classId?.name} />
          <Field label="Section" value={profile.section} />
          <Field label="Roll number" value={profile.rollNumber} />
          <Field label="Admission number" value={profile.admissionNumber} />
          <Field label="Admission date" value={formatDate(profile.admissionDate)} />
          <Field label="Date of birth" value={formatDate(profile.dateOfBirth)} />
          <Field label="Gender" value={profile.gender} />
        </div>
      </FormCard>

      <FormCard title="Family & contact" subtitle="Parent and guardian details on record.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Father" value={profile.fatherName} />
          <Field label="Mother" value={profile.motherName} />
          <Field label="Guardian" value={profile.guardianName} />
          <Field label="Parent / guardian (legacy)" value={profile.parentName} />
          <Field label="Parent email" value={profile.parentEmail} />
        </div>
      </FormCard>

      <FormCard title="Transport & hostel" subtitle="Optional services assigned by the school.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Transport required" value={profile.transportRequired ? "Yes" : "No"} />
          <Field label="Route" value={profile.transportRouteId} />
          <Field label="Pickup point" value={profile.pickupPoint} />
          <Field label="Hostel required" value={profile.hostelRequired ? "Yes" : "No"} />
          <Field label="Room number" value={profile.hostelRoomNumber} />
        </div>
      </FormCard>

      <FormCard title="Medical" subtitle="Share updates with the office if anything changes.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Blood group" value={profile.bloodGroup} />
          <Field label="Allergies" value={profile.allergies} />
          <Field label="Notes" value={profile.medicalNotes} />
        </div>
      </FormCard>

      <FormCard title="Other" subtitle="Demographic and prior school information.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Previous school" value={profile.previousSchool} />
          <Field label="Religion" value={profile.religion} />
          <Field label="Category" value={profile.category} />
          <Field label="Nationality" value={profile.nationality} />
        </div>
      </FormCard>

      <FormCard title="Documents" subtitle="Files uploaded during admission (view only).">
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents on file.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
            {documents.map((doc, i) => (
              <li key={`${doc.url}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2 font-medium text-gray-800">
                  <FaFileAlt className="text-gray-400" />
                  {doc.name}
                </span>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-indigo-600 hover:underline">
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </FormCard>

      <FormCard
        title="Update your details"
        subtitle="You can edit contact, address, and profile photo URL. Other fields are maintained by the school."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="input" placeholder="Mobile number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          <input
            className="input"
            placeholder="Alternate mobile"
            value={form.alternateMobile}
            onChange={(e) => setForm((p) => ({ ...p, alternateMobile: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Parent / guardian phone"
            value={form.parentPhone}
            onChange={(e) => setForm((p) => ({ ...p, parentPhone: e.target.value }))}
          />
          <input className="input sm:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
          <input className="input" placeholder="State" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
          <input className="input" placeholder="PIN code" value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} />
          <input
            className="input sm:col-span-2"
            placeholder="Profile image URL"
            value={form.profileImage}
            onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))}
          />
        </div>
        <button className="btn-primary mt-4 w-fit disabled:opacity-60" type="button" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </FormCard>
    </div>
  );
}

export default StudentProfilePage;
