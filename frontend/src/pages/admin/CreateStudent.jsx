import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Bus,
  Check,
  GraduationCap,
  HeartPulse,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { adminService } from "../../services/adminService";

const STEPS = [
  { id: 0, title: "Basic", hint: "Identity & contact", Icon: User },
  { id: 1, title: "Academic", hint: "Class & admission", Icon: BookOpen },
  { id: 2, title: "Family", hint: "Parents & address", Icon: Users },
  { id: 3, title: "Access & files", hint: "Login, photo, fees", Icon: KeyRound },
  { id: 4, title: "Transport & hostel", hint: "Optional services", Icon: Bus },
  { id: 5, title: "Health & other", hint: "Medical & metadata", Icon: HeartPulse },
];

const emptyForm = () => ({
  fullName: "",
  gender: "OTHER",
  dateOfBirth: "",
  email: "",
  mobileNumber: "",
  alternateMobile: "",
  classId: "",
  section: "",
  rollNumber: "",
  admissionNumber: "",
  admissionDate: "",
  fatherName: "",
  motherName: "",
  guardianName: "",
  parentMobile: "",
  parentEmail: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  password: "",
  profileImage: "",
  documents: [{ name: "", url: "" }],
  feeStructureId: "",
  feeAssignManualDiscount: "",
  feeDueDate: "",
  transportRequired: false,
  routeId: "",
  pickupPoint: "",
  hostelRequired: false,
  roomNumber: "",
  bloodGroup: "",
  allergies: "",
  medicalNotes: "",
  previousSchool: "",
  religion: "",
  category: "GENERAL",
  nationality: "",
  status: "ACTIVE",
});

const inp =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const lab = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function StepCard({ Icon, title, subtitle, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/40 p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] sm:p-6 ${className}`}
    >
      <div className="mb-5 flex items-start gap-4">
        {Icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/12 via-teal-500/8 to-brand-600/10 text-brand-600 ring-1 ring-brand-500/15">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        ) : null}
        <div className="min-w-0 pt-1">
          <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm leading-snug text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function validateStep(step, form, editingId) {
  if (step === 0) {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.mobileNumber.trim()) return "Mobile number is required.";
  }
  if (step === 1) {
    if (!form.classId) return "Select a class.";
    if (!form.section.trim()) return "Section is required.";
    if (!form.rollNumber.trim()) return "Roll number is required.";
  }
  if (step === 3 && !editingId) {
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
  }
  return null;
}

function buildPayload(form, editingId) {
  const documents = (form.documents || [])
    .filter((d) => String(d.url || "").trim())
    .map((d) => ({ name: String(d.name || "").trim() || "Document", url: String(d.url || "").trim() }));
  const payload = {
    name: form.fullName.trim(),
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    gender: form.gender,
    dateOfBirth: form.dateOfBirth || undefined,
    phone: form.mobileNumber,
    mobileNumber: form.mobileNumber,
    alternateMobile: form.alternateMobile || undefined,
    classId: form.classId,
    section: form.section.trim(),
    rollNumber: form.rollNumber.trim(),
    admissionNumber: form.admissionNumber || undefined,
    admissionDate: form.admissionDate || undefined,
    fatherName: form.fatherName || undefined,
    motherName: form.motherName || undefined,
    guardianName: form.guardianName || undefined,
    parentMobile: form.parentMobile || undefined,
    parentPhone: form.parentMobile || undefined,
    parentEmail: form.parentEmail || undefined,
    parentName: form.fatherName || form.guardianName || undefined,
    address: form.address || undefined,
    city: form.city || undefined,
    state: form.state || undefined,
    pincode: form.pincode || undefined,
    profileImage: form.profileImage || undefined,
    documents,
    feeStructureId: form.feeStructureId || undefined,
    feeAssignManualDiscount: form.feeAssignManualDiscount ? Number(form.feeAssignManualDiscount) : undefined,
    feeAssignDueDate: form.feeDueDate || undefined,
    transportRequired: Boolean(form.transportRequired),
    transportRouteId: form.routeId || undefined,
    routeId: form.routeId || undefined,
    pickupPoint: form.pickupPoint || undefined,
    hostelRequired: Boolean(form.hostelRequired),
    hostelRoomNumber: form.roomNumber || undefined,
    roomNumber: form.roomNumber || undefined,
    bloodGroup: form.bloodGroup || undefined,
    allergies: form.allergies || undefined,
    medicalNotes: form.medicalNotes || undefined,
    previousSchool: form.previousSchool || undefined,
    religion: form.religion || undefined,
    category: form.category || undefined,
    nationality: form.nationality || undefined,
    status: form.status || "ACTIVE",
  };
  if (!editingId) payload.password = form.password;
  return payload;
}

function formFromStudent(item) {
  const f = emptyForm();
  f.fullName = item.userId?.name || "";
  f.email = item.userId?.email || "";
  f.mobileNumber = item.phone || "";
  f.alternateMobile = item.alternatePhone || "";
  f.gender = item.gender || "OTHER";
  f.dateOfBirth = item.dateOfBirth ? item.dateOfBirth.slice(0, 10) : "";
  f.classId = item.classId?._id || "";
  f.section = item.section || "";
  f.rollNumber = item.rollNumber || "";
  f.admissionNumber = item.admissionNumber || "";
  f.admissionDate = item.admissionDate ? item.admissionDate.slice(0, 10) : "";
  f.fatherName = item.fatherName || "";
  f.motherName = item.motherName || "";
  f.guardianName = item.guardianName || "";
  f.parentMobile = item.parentPhone || "";
  f.parentEmail = item.parentEmail || "";
  f.address = item.address || "";
  f.city = item.city || "";
  f.state = item.state || "";
  f.pincode = item.pincode || "";
  f.profileImage = item.profileImage || "";
  f.documents =
    Array.isArray(item.documents) && item.documents.length
      ? item.documents.map((d) => (typeof d === "string" ? { name: "", url: d } : { name: d.name || "", url: d.url || "" }))
      : [{ name: "", url: "" }];
  f.transportRequired = Boolean(item.transportRequired);
  f.routeId = item.transportRouteId || "";
  f.pickupPoint = item.pickupPoint || "";
  f.hostelRequired = Boolean(item.hostelRequired);
  f.roomNumber = item.hostelRoomNumber || "";
  f.bloodGroup = item.bloodGroup || "";
  f.allergies = item.allergies || "";
  f.medicalNotes = item.medicalNotes || "";
  f.previousSchool = item.previousSchool || "";
  f.religion = item.religion || "";
  f.category = item.category || "GENERAL";
  f.nationality = item.nationality || "";
  f.status = item.status || "ACTIVE";
  f.password = "";
  return f;
}

function CreateStudentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);

  const fetchClasses = async () => {
    try {
      setClasses(await adminService.getClasses());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      setFeeStructures(await adminService.getFeeStructures());
    } catch {
      setFeeStructures([]);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchFeeStructures();
  }, []);

  useEffect(() => {
    const editId = location.state?.editId;
    if (!editId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const item = await adminService.getStudentById(editId);
        if (cancelled) return;
        setEditingId(item._id);
        setForm(formFromStudent(item));
        setStep(0);
        navigate(".", { replace: true, state: {} });
      } catch (error) {
        if (!cancelled) toast.error(error.message);
        navigate(".", { replace: true, state: {} });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.state?.editId, navigate]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setStep(0);
    setForm(emptyForm());
  };

  const goNext = () => {
    const err = validateStep(step, form, editingId);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async () => {
    const err = validateStep(step, form, editingId);
    if (err) {
      toast.error(err);
      return;
    }
    for (let s = 0; s < STEPS.length; s += 1) {
      const e = validateStep(s, form, editingId);
      if (e) {
        toast.error(e);
        setStep(s);
        return;
      }
    }
    setLoading(true);
    try {
      const payload = buildPayload(form, editingId);
      if (editingId) {
        await adminService.updateStudent(editingId, payload);
        toast.success("Student updated");
      } else {
        await adminService.createStudent(payload);
        toast.success("Student created");
      }
      resetForm();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const importCSV = async () => {
    if (!csvText.trim()) return toast.error("Paste CSV text first");
    try {
      const result = await adminService.bulkImportStudents(csvText);
      toast.success(`Imported: ${result.created}, skipped: ${result.skipped}. View them under All registered.`);
      setCsvText("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addDocRow = () => setForm((p) => ({ ...p, documents: [...p.documents, { name: "", url: "" }] }));
  const removeDocRow = (i) =>
    setForm((p) => ({ ...p, documents: p.documents.filter((_, idx) => idx !== i) || [{ name: "", url: "" }] }));

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  const CurrentIcon = STEPS[step].Icon;

  const toggleWrap =
    "flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/20";

  return (
    <div className="w-full max-w-7xl space-y-10 pb-12">
      {/* Hero + stepper */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-slate-900 via-brand-950 to-teal-950 px-6 py-8 text-white shadow-2xl shadow-slate-900/20 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-brand-500/20 blur-2xl" aria-hidden />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-teal-200/95">
              <UserPlus className="h-3.5 w-3.5" />
              Admissions
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {editingId ? "Edit student record" : "Enrol a new student"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
              Six guided steps from identity to health & category. Portal login uses email and password (student role). Fee packages
              can be attached on the access step when creating.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <GraduationCap className="h-7 w-7 text-teal-300" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Progress</p>
              <p className="text-2xl font-bold tabular-nums">
                {step + 1}<span className="text-slate-500">/{STEPS.length}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-8">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 via-brand-400 to-cyan-300 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {STEPS.map((s, i) => {
              const Done = i < step;
              const Active = i === step;
              const Icon = s.Icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (i < step) setStep(i);
                  }}
                  disabled={i > step}
                  className={`group flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition sm:px-3 ${
                    Active
                      ? "border-white/40 bg-white text-brand-900 shadow-lg shadow-black/10"
                      : Done
                        ? "cursor-pointer border-white/20 bg-white/15 text-white hover:bg-white/25"
                        : "cursor-not-allowed border-white/5 bg-white/5 text-slate-500"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      Active ? "bg-brand-100 text-brand-700" : Done ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {Done ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Icon className="h-5 w-5" />}
                  </span>
                  <span className="w-full truncate text-[0.7rem] font-bold uppercase tracking-wide">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main form */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100/90">
        <div className="relative border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-teal-50/30 px-6 py-6 sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-lg shadow-brand-500/25">
                <CurrentIcon className="h-7 w-7" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step {step + 1}</p>
                <h2 className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">{STEPS[step].title}</h2>
                <p className="mt-1 text-sm text-slate-600">{STEPS[step].hint}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-slate-50/40 p-6 sm:p-10">
          {step === 0 && (
            <div className="space-y-6">
              <StepCard Icon={User} title="Student identity" subtitle="Full legal name, gender, and date of birth.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={lab}>Full name</label>
                    <input className={inp} name="fullName" value={form.fullName} onChange={onChange} required placeholder="As on certificates" />
                  </div>
                  <div>
                    <label className={lab}>Gender</label>
                    <select className={inp} name="gender" value={form.gender} onChange={onChange}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={lab}>Date of birth</label>
                    <input className={inp} type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} />
                  </div>
                </div>
              </StepCard>
              <StepCard Icon={Mail} title="Contact & login email" subtitle="Email is used for the student portal username.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={lab}>Email (login)</label>
                    <input className={inp} type="email" name="email" value={form.email} onChange={onChange} required placeholder="student@school.com" />
                  </div>
                  <div>
                    <label className={lab}>Mobile</label>
                    <input className={inp} name="mobileNumber" value={form.mobileNumber} onChange={onChange} placeholder="+91 …" />
                  </div>
                  <div>
                    <label className={lab}>Alternate mobile</label>
                    <input className={inp} name="alternateMobile" value={form.alternateMobile} onChange={onChange} />
                  </div>
                </div>
              </StepCard>
            </div>
          )}

          {step === 1 && (
            <StepCard Icon={BookOpen} title="Academic placement" subtitle="Class, section, roll, and admission metadata.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={lab}>Class</label>
                  <select className={inp} name="classId" value={form.classId} onChange={onChange} required>
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} — {c.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lab}>Section</label>
                  <input className={inp} name="section" value={form.section} onChange={onChange} placeholder="A, B, …" />
                </div>
                <div>
                  <label className={lab}>Roll number</label>
                  <input className={inp} name="rollNumber" value={form.rollNumber} onChange={onChange} />
                </div>
                <div>
                  <label className={lab}>Admission number</label>
                  <input className={inp} name="admissionNumber" value={form.admissionNumber} onChange={onChange} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lab}>Admission date</label>
                  <input className={inp} type="date" name="admissionDate" value={form.admissionDate} onChange={onChange} />
                </div>
              </div>
            </StepCard>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <StepCard Icon={Users} title="Parents & guardian" subtitle="Primary contacts for communication.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={lab}>Father&apos;s name</label>
                    <input className={inp} name="fatherName" value={form.fatherName} onChange={onChange} />
                  </div>
                  <div>
                    <label className={lab}>Mother&apos;s name</label>
                    <input className={inp} name="motherName" value={form.motherName} onChange={onChange} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lab}>Guardian</label>
                    <input className={inp} name="guardianName" value={form.guardianName} onChange={onChange} />
                  </div>
                  <div>
                    <label className={lab}>Parent mobile</label>
                    <input className={inp} name="parentMobile" value={form.parentMobile} onChange={onChange} />
                  </div>
                  <div>
                    <label className={lab}>Parent email</label>
                    <input className={inp} type="email" name="parentEmail" value={form.parentEmail} onChange={onChange} />
                  </div>
                </div>
              </StepCard>
              <StepCard Icon={MapPin} title="Address" subtitle="Residential address for records and correspondence.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={lab}>Street address</label>
                    <input className={inp} name="address" value={form.address} onChange={onChange} placeholder="House, street, locality" />
                  </div>
                  <div>
                    <label className={lab}>City</label>
                    <input className={inp} name="city" value={form.city} onChange={onChange} />
                  </div>
                  <div>
                    <label className={lab}>State</label>
                    <input className={inp} name="state" value={form.state} onChange={onChange} />
                  </div>
                  <div className="sm:col-span-2 sm:max-w-xs">
                    <label className={lab}>PIN code</label>
                    <input className={inp} name="pincode" value={form.pincode} onChange={onChange} />
                  </div>
                </div>
              </StepCard>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <StepCard Icon={KeyRound} title="Portal access & profile" subtitle="Password for new students; photo URL for ID and profile.">
                <div className="grid gap-4 sm:grid-cols-2">
                  {!editingId ? (
                    <div>
                      <label className={lab}>Password</label>
                      <input
                        className={inp}
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        autoComplete="new-password"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 px-4 py-4 text-sm text-amber-950 sm:col-span-2">
                      <KeyRound className="mr-3 h-8 w-8 shrink-0 text-amber-600 opacity-80" />
                      <p>
                        Password cannot be changed here. Use your school&apos;s user-management or reset flow if you need to update
                        credentials.
                      </p>
                    </div>
                  )}
                  <div className={!editingId ? "" : "sm:col-span-2"}>
                    <label className={lab}>Profile image URL</label>
                    <input className={inp} name="profileImage" value={form.profileImage} onChange={onChange} placeholder="https://…" />
                  </div>
                </div>
                <p className="mt-4 rounded-xl bg-slate-100/80 px-3 py-2 text-xs text-slate-600">
                  Login role is always <strong className="text-slate-800">Student</strong> — email acts as the username.
                </p>
              </StepCard>

              <StepCard Icon={Upload} title="Documents" subtitle="Admission certificates, transfer papers, or other file links.">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attachments</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700"
                    onClick={addDocRow}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add row
                  </button>
                </div>
                <div className="space-y-3">
                  {form.documents.map((d, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 sm:flex-row sm:items-end"
                    >
                      <div className="min-w-0 flex-1">
                        <label className={lab}>Label</label>
                        <input
                          className={inp}
                          placeholder="e.g. Birth certificate"
                          value={d.name}
                          onChange={(e) => {
                            const next = [...form.documents];
                            next[i] = { ...next[i], name: e.target.value };
                            setForm((p) => ({ ...p, documents: next }));
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-[2]">
                        <label className={lab}>URL</label>
                        <input
                          className={inp}
                          placeholder="https://…"
                          value={d.url}
                          onChange={(e) => {
                            const next = [...form.documents];
                            next[i] = { ...next[i], url: e.target.value };
                            setForm((p) => ({ ...p, documents: next }));
                          }}
                        />
                      </div>
                      {form.documents.length > 1 ? (
                        <button
                          type="button"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                          onClick={() => removeDocRow(i)}
                          aria-label="Remove row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </StepCard>

              {!editingId ? (
                <StepCard Icon={GraduationCap} title="Fee package (optional)" subtitle="Override default class rules for this admission.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={lab}>Assign fee structure</label>
                      <select className={inp} name="feeStructureId" value={form.feeStructureId} onChange={onChange}>
                        <option value="">— Use automatic class rules —</option>
                        {feeStructures.map((fs) => (
                          <option key={fs._id} value={fs._id}>
                            {fs.title} · {fs.academicYear}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={lab}>Extra discount (₹)</label>
                      <input className={inp} type="number" name="feeAssignManualDiscount" value={form.feeAssignManualDiscount} onChange={onChange} />
                    </div>
                    <div>
                      <label className={lab}>Due date</label>
                      <input className={inp} type="date" name="feeDueDate" value={form.feeDueDate} onChange={onChange} />
                    </div>
                  </div>
                </StepCard>
              ) : null}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <StepCard Icon={Bus} title="Transport" subtitle="Enable if the student uses school bus or van.">
                <label className={`${toggleWrap} mb-4`}>
                  <input type="checkbox" name="transportRequired" checked={form.transportRequired} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm font-semibold text-slate-800">Transport required</span>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={lab}>Route / bus ID</label>
                    <input className={inp} name="routeId" value={form.routeId} onChange={onChange} disabled={!form.transportRequired} />
                  </div>
                  <div>
                    <label className={lab}>Pickup point</label>
                    <input className={inp} name="pickupPoint" value={form.pickupPoint} onChange={onChange} disabled={!form.transportRequired} />
                  </div>
                </div>
              </StepCard>
              <StepCard Icon={Building2} title="Hostel" subtitle="Residential campus allocation if applicable.">
                <label className={`${toggleWrap} mb-4`}>
                  <input type="checkbox" name="hostelRequired" checked={form.hostelRequired} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm font-semibold text-slate-800">Hostel required</span>
                </label>
                <div>
                  <label className={lab}>Room number</label>
                  <input className={inp} name="roomNumber" value={form.roomNumber} onChange={onChange} disabled={!form.hostelRequired} />
                </div>
              </StepCard>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <StepCard Icon={HeartPulse} title="Medical" subtitle="Information for nurses and emergency contacts.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={lab}>Blood group</label>
                    <input className={inp} name="bloodGroup" value={form.bloodGroup} onChange={onChange} placeholder="e.g. O+" />
                  </div>
                  <div>
                    <label className={lab}>Allergies</label>
                    <input className={inp} name="allergies" value={form.allergies} onChange={onChange} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lab}>Medical notes</label>
                    <textarea className={`${inp} min-h-[88px] resize-y`} rows={3} name="medicalNotes" value={form.medicalNotes} onChange={onChange} />
                  </div>
                </div>
              </StepCard>
              <StepCard Icon={User} title="Background & record status" subtitle="Demographics and lifecycle state of the record.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={lab}>Previous school</label>
                    <input className={inp} name="previousSchool" value={form.previousSchool} onChange={onChange} />
                  </div>
                  <div>
                    <label className={lab}>Religion</label>
                    <input className={inp} name="religion" value={form.religion} onChange={onChange} />
                  </div>
                  <div>
                    <label className={lab}>Category</label>
                    <select className={inp} name="category" value={form.category} onChange={onChange}>
                      <option value="GENERAL">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={lab}>Nationality</label>
                    <input className={inp} name="nationality" value={form.nationality} onChange={onChange} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lab}>Record status</label>
                    <select className={inp} name="status" value={form.status} onChange={onChange}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PASSED">Passed / alumni</option>
                      <option value="TRANSFERRED">Transferred</option>
                    </select>
                  </div>
                </div>
              </StepCard>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={goPrev}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex flex-wrap justify-end gap-3">
              {editingId ? (
                <button
                  type="button"
                  className="rounded-2xl border-2 border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  onClick={resetForm}
                >
                  Cancel edit
                </button>
              ) : null}
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-700 hover:to-brand-600"
                  onClick={goNext}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 via-brand-600 to-brand-700 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={onSubmit}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" strokeWidth={2.5} />}
                  {editingId ? "Save changes" : "Create student"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk import */}
      <div className="overflow-hidden rounded-3xl border border-dashed border-slate-300/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bulk import (CSV)</h3>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Paste comma-separated rows below. Expected headers include{" "}
                <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-xs font-mono text-slate-800">name</code>,{" "}
                <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-xs font-mono text-slate-800">email</code>,{" "}
                <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-xs font-mono text-slate-800">password</code>, class fields,
                and roll number.
              </p>
            </div>
          </div>
        </div>
        <textarea
          className={`${inp} mt-5 min-h-32 font-mono text-xs leading-relaxed`}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="Paste CSV here…"
        />
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
          onClick={importCSV}
        >
          <Upload className="h-4 w-4" />
          Run import
        </button>
      </div>
    </div>
  );
}

export default CreateStudentPage;
