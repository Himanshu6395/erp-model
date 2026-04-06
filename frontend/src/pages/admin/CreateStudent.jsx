import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Bus, Check, GraduationCap, HeartPulse, KeyRound, Loader2, Mail, MapPin, Plus, Trash2, Upload, User, UserPlus, Users } from "lucide-react";
import { adminService } from "../../services/adminService";

const STEPS = [
  { id: 0, title: "Basic", hint: "Identity and contact", Icon: User },
  { id: 1, title: "Academic", hint: "Class and admission", Icon: BookOpen },
  { id: 2, title: "Family", hint: "Parents and address", Icon: Users },
  { id: 3, title: "Access", hint: "Login, profile, fees", Icon: KeyRound },
  { id: 4, title: "Services", hint: "Transport and hostel", Icon: Bus },
  { id: 5, title: "Health", hint: "Medical and status", Icon: HeartPulse },
];

const inputClass = "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12";
const labelClass = "mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500";

const emptyForm = () => ({
  fullName: "", gender: "OTHER", dateOfBirth: "", email: "", mobileNumber: "", alternateMobile: "", classId: "", section: "", rollNumber: "",
  admissionNumber: "", admissionDate: "", fatherName: "", motherName: "", guardianName: "", parentMobile: "", parentEmail: "", address: "",
  city: "", state: "", pincode: "", password: "", profileImage: "", documents: [{ name: "", url: "" }], feeStructureId: "",
  feeAssignManualDiscount: "", feeDueDate: "", transportRequired: false, routeId: "", pickupPoint: "", hostelRequired: false, roomNumber: "",
  bloodGroup: "", allergies: "", medicalNotes: "", previousSchool: "", religion: "", category: "GENERAL", nationality: "", status: "ACTIVE",
});

function Field({ label, required, children, className = "", hint }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}{required ? <span className="ml-1 text-rose-500">*</span> : null}</label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Card({ Icon, title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/80 sm:p-6">
      <div className="mb-5 flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-600 text-white shadow-lg shadow-brand-500/20 sm:h-12 sm:w-12">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function validateStep(step, form, editingId) {
  if (step === 0 && (!form.fullName.trim() || !form.email.trim() || !form.mobileNumber.trim())) return "Basic student details are required.";
  if (step === 1 && (!form.classId || !form.section.trim() || !form.rollNumber.trim())) return "Academic details are required.";
  if (step === 3 && !editingId && (!form.password || form.password.length < 6)) return "Password must be at least 6 characters.";
  return null;
}

function buildPayload(form, editingId) {
  const documents = form.documents.filter((d) => String(d.url || "").trim()).map((d) => ({ name: String(d.name || "").trim() || "Document", url: String(d.url || "").trim() }));
  const payload = {
    name: form.fullName.trim(), fullName: form.fullName.trim(), email: form.email.trim(), gender: form.gender, dateOfBirth: form.dateOfBirth || undefined,
    phone: form.mobileNumber, mobileNumber: form.mobileNumber, alternateMobile: form.alternateMobile || undefined, classId: form.classId, section: form.section.trim(),
    rollNumber: form.rollNumber.trim(), admissionNumber: form.admissionNumber || undefined, admissionDate: form.admissionDate || undefined,
    fatherName: form.fatherName || undefined, motherName: form.motherName || undefined, guardianName: form.guardianName || undefined,
    parentMobile: form.parentMobile || undefined, parentPhone: form.parentMobile || undefined, parentEmail: form.parentEmail || undefined,
    parentName: form.fatherName || form.guardianName || undefined, address: form.address || undefined, city: form.city || undefined, state: form.state || undefined,
    pincode: form.pincode || undefined, profileImage: form.profileImage || undefined, documents, feeStructureId: form.feeStructureId || undefined,
    feeAssignManualDiscount: form.feeAssignManualDiscount ? Number(form.feeAssignManualDiscount) : undefined, feeAssignDueDate: form.feeDueDate || undefined,
    transportRequired: Boolean(form.transportRequired), transportRouteId: form.routeId || undefined, routeId: form.routeId || undefined, pickupPoint: form.pickupPoint || undefined,
    hostelRequired: Boolean(form.hostelRequired), hostelRoomNumber: form.roomNumber || undefined, roomNumber: form.roomNumber || undefined,
    bloodGroup: form.bloodGroup || undefined, allergies: form.allergies || undefined, medicalNotes: form.medicalNotes || undefined,
    previousSchool: form.previousSchool || undefined, religion: form.religion || undefined, category: form.category || undefined, nationality: form.nationality || undefined,
    status: form.status || "ACTIVE",
  };
  if (!editingId) payload.password = form.password;
  return payload;
}

function formFromStudent(item) {
  const f = emptyForm();
  Object.assign(f, {
    fullName: item.userId?.name || "", email: item.userId?.email || "", mobileNumber: item.phone || "", alternateMobile: item.alternatePhone || "",
    gender: item.gender || "OTHER", dateOfBirth: item.dateOfBirth ? item.dateOfBirth.slice(0, 10) : "", classId: item.classId?._id || "", section: item.section || "",
    rollNumber: item.rollNumber || "", admissionNumber: item.admissionNumber || "", admissionDate: item.admissionDate ? item.admissionDate.slice(0, 10) : "",
    fatherName: item.fatherName || "", motherName: item.motherName || "", guardianName: item.guardianName || "", parentMobile: item.parentPhone || "",
    parentEmail: item.parentEmail || "", address: item.address || "", city: item.city || "", state: item.state || "", pincode: item.pincode || "",
    profileImage: item.profileImage || "", transportRequired: Boolean(item.transportRequired), routeId: item.transportRouteId || "", pickupPoint: item.pickupPoint || "",
    hostelRequired: Boolean(item.hostelRequired), roomNumber: item.hostelRoomNumber || "", bloodGroup: item.bloodGroup || "", allergies: item.allergies || "",
    medicalNotes: item.medicalNotes || "", previousSchool: item.previousSchool || "", religion: item.religion || "", category: item.category || "GENERAL",
    nationality: item.nationality || "", status: item.status || "ACTIVE",
    documents: Array.isArray(item.documents) && item.documents.length ? item.documents.map((d) => (typeof d === "string" ? { name: "", url: d } : { name: d.name || "", url: d.url || "" })) : [{ name: "", url: "" }],
  });
  return f;
}

export default function CreateStudentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { (async () => { try { setClasses(await adminService.getClasses()); } catch (e) { toast.error(e.message); } })(); (async () => { try { setFeeStructures(await adminService.getFeeStructures()); } catch { setFeeStructures([]); } })(); }, []);

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
    return () => { cancelled = true; };
  }, [location.state?.editId, navigate]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const resetForm = () => { setEditingId(null); setStep(0); setForm(emptyForm()); };
  const addDocRow = () => setForm((p) => ({ ...p, documents: [...p.documents, { name: "", url: "" }] }));
  const removeDocRow = (i) => setForm((p) => ({ ...p, documents: p.documents.filter((_, idx) => idx !== i) || [{ name: "", url: "" }] }));
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  const completion = useMemo(() => Math.round(([form.fullName, form.email, form.mobileNumber, form.classId, form.section, form.rollNumber, editingId ? "ok" : form.password].filter(Boolean).length / 7) * 100), [editingId, form]);
  const CurrentIcon = STEPS[step].Icon;

  const goNext = () => { const err = validateStep(step, form, editingId); if (err) return toast.error(err); setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async () => {
    for (let s = 0; s < STEPS.length; s += 1) { const err = validateStep(s, form, editingId); if (err) { setStep(s); return toast.error(err); } }
    setLoading(true);
    try {
      const payload = buildPayload(form, editingId);
      if (editingId) { await adminService.updateStudent(editingId, payload); toast.success("Student updated"); }
      else { await adminService.createStudent(payload); toast.success("Student created"); }
      resetForm();
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  const importCSV = async () => {
    if (!csvText.trim()) return toast.error("Paste CSV text first");
    try { const result = await adminService.bulkImportStudents(csvText); toast.success(`Imported: ${result.created}, skipped: ${result.skipped}. View them under All registered.`); setCsvText(""); }
    catch (error) { toast.error(error.message); }
  };

  const renderStep = () => {
    if (step === 0) return (
      <div className="space-y-6">
        <Card Icon={User} title="Student identity" subtitle="Full name, gender, and date of birth.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required className="sm:col-span-2"><input className={inputClass} name="fullName" value={form.fullName} onChange={onChange} placeholder="As on certificates" /></Field>
            <Field label="Gender"><select className={inputClass} name="gender" value={form.gender} onChange={onChange}><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></Field>
            <Field label="Date of birth"><input className={inputClass} type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} /></Field>
          </div>
        </Card>
        <Card Icon={Mail} title="Contact and login email" subtitle="Email is used as the student portal username.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email (login)" required className="sm:col-span-2"><input className={inputClass} type="email" name="email" value={form.email} onChange={onChange} placeholder="student@school.com" /></Field>
            <Field label="Mobile" required><input className={inputClass} name="mobileNumber" value={form.mobileNumber} onChange={onChange} placeholder="+91 ..." /></Field>
            <Field label="Alternate mobile"><input className={inputClass} name="alternateMobile" value={form.alternateMobile} onChange={onChange} /></Field>
          </div>
        </Card>
      </div>
    );
    if (step === 1) return (
      <Card Icon={BookOpen} title="Academic placement" subtitle="Class, section, roll number, and admission data.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class" required><select className={inputClass} name="classId" value={form.classId} onChange={onChange}><option value="">Select class</option>{classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}</select></Field>
          <Field label="Section" required><input className={inputClass} name="section" value={form.section} onChange={onChange} placeholder="A, B, C" /></Field>
          <Field label="Roll number" required><input className={inputClass} name="rollNumber" value={form.rollNumber} onChange={onChange} /></Field>
          <Field label="Admission number"><input className={inputClass} name="admissionNumber" value={form.admissionNumber} onChange={onChange} /></Field>
          <Field label="Admission date" className="sm:col-span-2"><input className={inputClass} type="date" name="admissionDate" value={form.admissionDate} onChange={onChange} /></Field>
        </div>
      </Card>
    );
    if (step === 2) return (
      <div className="space-y-6">
        <Card Icon={Users} title="Parents and guardian" subtitle="Primary family contacts for communication.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Father's name"><input className={inputClass} name="fatherName" value={form.fatherName} onChange={onChange} /></Field>
            <Field label="Mother's name"><input className={inputClass} name="motherName" value={form.motherName} onChange={onChange} /></Field>
            <Field label="Guardian" className="sm:col-span-2"><input className={inputClass} name="guardianName" value={form.guardianName} onChange={onChange} /></Field>
            <Field label="Parent mobile"><input className={inputClass} name="parentMobile" value={form.parentMobile} onChange={onChange} /></Field>
            <Field label="Parent email"><input className={inputClass} type="email" name="parentEmail" value={form.parentEmail} onChange={onChange} /></Field>
          </div>
        </Card>
        <Card Icon={MapPin} title="Address" subtitle="Residential address for records and correspondence.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Street address" className="sm:col-span-2"><input className={inputClass} name="address" value={form.address} onChange={onChange} placeholder="House, street, locality" /></Field>
            <Field label="City"><input className={inputClass} name="city" value={form.city} onChange={onChange} /></Field>
            <Field label="State"><input className={inputClass} name="state" value={form.state} onChange={onChange} /></Field>
            <Field label="PIN code" className="sm:col-span-2 sm:max-w-xs"><input className={inputClass} name="pincode" value={form.pincode} onChange={onChange} /></Field>
          </div>
        </Card>
      </div>
    );
    if (step === 3) return (
      <div className="space-y-6">
        <Card Icon={KeyRound} title="Portal access and profile" subtitle="Password for new students, profile image link, and fee package.">
          <div className="grid gap-4 sm:grid-cols-2">
            {!editingId ? <Field label="Password" required><input className={inputClass} type="password" name="password" value={form.password} onChange={onChange} autoComplete="new-password" placeholder="Minimum 6 characters" /></Field> : <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 px-4 py-4 text-sm text-amber-950 sm:col-span-2">Password cannot be changed here. Use the reset flow if credentials need to be updated.</div>}
            <Field label="Profile image URL" className={!editingId ? "" : "sm:col-span-2"}><input className={inputClass} name="profileImage" value={form.profileImage} onChange={onChange} placeholder="https://..." /></Field>
          </div>
          <p className="mt-4 rounded-xl bg-slate-100/80 px-3 py-2 text-xs text-slate-600">Login role is always <strong className="text-slate-800">Student</strong> - email acts as the username.</p>
        </Card>
        <Card Icon={Upload} title="Documents" subtitle="Admission certificates, transfer papers, or other document links.">
          <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attachments</span><button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700" onClick={addDocRow}><Plus className="h-3.5 w-3.5" /> Add row</button></div>
          <div className="space-y-3">{form.documents.map((d, i) => <div key={i} className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:flex-row sm:items-end"><Field label="Label" className="min-w-0 flex-1"><input className={inputClass} value={d.name} onChange={(e) => { const next = [...form.documents]; next[i] = { ...next[i], name: e.target.value }; setForm((p) => ({ ...p, documents: next })); }} /></Field><Field label="URL" className="min-w-0 flex-[2]"><input className={inputClass} value={d.url} onChange={(e) => { const next = [...form.documents]; next[i] = { ...next[i], url: e.target.value }; setForm((p) => ({ ...p, documents: next })); }} placeholder="https://..." /></Field>{form.documents.length > 1 ? <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50" onClick={() => removeDocRow(i)}><Trash2 className="h-4 w-4" /></button> : null}</div>)}</div>
        </Card>
        {!editingId ? <Card Icon={GraduationCap} title="Fee package" subtitle="Optional fee structure assignment during enrolment."><div className="grid gap-4 sm:grid-cols-2"><Field label="Assign fee structure" className="sm:col-span-2"><select className={inputClass} name="feeStructureId" value={form.feeStructureId} onChange={onChange}><option value="">- Use automatic class rules -</option>{feeStructures.map((fs) => <option key={fs._id} value={fs._id}>{fs.title} · {fs.academicYear}</option>)}</select></Field><Field label="Extra discount (Rs)"><input className={inputClass} type="number" name="feeAssignManualDiscount" value={form.feeAssignManualDiscount} onChange={onChange} /></Field><Field label="Due date"><input className={inputClass} type="date" name="feeDueDate" value={form.feeDueDate} onChange={onChange} /></Field></div></Card> : null}
      </div>
    );
    if (step === 4) return (
      <div className="space-y-6">
        <Card Icon={Bus} title="Transport" subtitle="Enable if the student uses school transport."><label className="mb-4 flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/20"><input type="checkbox" name="transportRequired" checked={form.transportRequired} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /><span className="text-sm font-semibold text-slate-800">Transport required</span></label><div className="grid gap-4 sm:grid-cols-2"><Field label="Route / bus ID"><input className={inputClass} name="routeId" value={form.routeId} onChange={onChange} disabled={!form.transportRequired} /></Field><Field label="Pickup point"><input className={inputClass} name="pickupPoint" value={form.pickupPoint} onChange={onChange} disabled={!form.transportRequired} /></Field></div></Card>
        <Card Icon={Bus} title="Hostel" subtitle="Residential hostel allocation if applicable."><label className="mb-4 flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/20"><input type="checkbox" name="hostelRequired" checked={form.hostelRequired} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /><span className="text-sm font-semibold text-slate-800">Hostel required</span></label><Field label="Room number"><input className={inputClass} name="roomNumber" value={form.roomNumber} onChange={onChange} disabled={!form.hostelRequired} /></Field></Card>
      </div>
    );
    return (
      <div className="space-y-6">
        <Card Icon={HeartPulse} title="Medical" subtitle="Information for health and emergency handling."><div className="grid gap-4 sm:grid-cols-2"><Field label="Blood group"><input className={inputClass} name="bloodGroup" value={form.bloodGroup} onChange={onChange} placeholder="e.g. O+" /></Field><Field label="Allergies"><input className={inputClass} name="allergies" value={form.allergies} onChange={onChange} /></Field><Field label="Medical notes" className="sm:col-span-2"><textarea className={`${inputClass} min-h-[88px] resize-y`} rows={3} name="medicalNotes" value={form.medicalNotes} onChange={onChange} /></Field></div></Card>
        <Card Icon={User} title="Background and record status" subtitle="Student metadata and lifecycle status."><div className="grid gap-4 sm:grid-cols-2"><Field label="Previous school"><input className={inputClass} name="previousSchool" value={form.previousSchool} onChange={onChange} /></Field><Field label="Religion"><input className={inputClass} name="religion" value={form.religion} onChange={onChange} /></Field><Field label="Category"><select className={inputClass} name="category" value={form.category} onChange={onChange}><option value="GENERAL">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option><option value="OTHER">Other</option></select></Field><Field label="Nationality"><input className={inputClass} name="nationality" value={form.nationality} onChange={onChange} /></Field><Field label="Record status" className="sm:col-span-2"><select className={inputClass} name="status" value={form.status} onChange={onChange}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="PASSED">Passed / alumni</option><option value="TRANSFERRED">Transferred</option></select></Field></div></Card>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl space-y-10 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-gradient-to-r from-slate-950 via-brand-950 to-teal-800 px-6 py-8 text-white shadow-[0_30px_80px_-34px_rgba(15,23,42,0.55)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-brand-500/20 blur-2xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-teal-200/95"><UserPlus className="h-3.5 w-3.5" /> Admissions</p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl">{editingId ? "Update student profile" : "Create a student record"}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">A guided six-step workflow for identity, academics, family, access, optional services, and health records.</p>
          </div>
          <div className="flex w-full items-center gap-4 rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm sm:w-auto sm:px-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 sm:h-14 sm:w-14"><GraduationCap className="h-6 w-6 text-teal-300 sm:h-7 sm:w-7" /></div>
            <div><p className="text-xs font-medium text-slate-400">Completion</p><p className="text-2xl font-bold tabular-nums">{completion}%</p><p className="text-xs text-slate-300">Student onboarding form</p></div>
          </div>
        </div>
        <div className="relative mt-8"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-teal-400 via-brand-400 to-cyan-300 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} /></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{STEPS.map((s, i) => { const done = i < step; const active = i === step; const Icon = s.Icon; return <button key={s.id} type="button" onClick={() => { if (i < step) setStep(i); }} disabled={i > step} className={`group min-w-0 flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition sm:px-3 ${active ? "border-white/40 bg-white text-brand-900 shadow-lg shadow-black/10" : done ? "cursor-pointer border-white/20 bg-white/15 text-white hover:bg-white/25" : "cursor-not-allowed border-white/5 bg-white/5 text-slate-500"}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-brand-100 text-brand-700" : done ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"}`}>{done ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Icon className="h-5 w-5" />}</span><span className="w-full truncate text-[0.68rem] font-bold uppercase tracking-wide">{s.title}</span></button>; })}</div></div>
      </section>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-teal-50/30 px-6 py-6 sm:px-10"><div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-lg shadow-brand-500/25"><CurrentIcon className="h-7 w-7" strokeWidth={2} /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step {step + 1}</p><h2 className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">{STEPS[step].title}</h2><p className="mt-1 text-sm text-slate-600">{STEPS[step].hint}</p></div></div></div>
        <div className="space-y-6 bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_35%,#f1f5f9_100%)] p-6 sm:p-10">
          {renderStep()}
          <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto" onClick={goPrev} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> Back</button>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
              {editingId ? <button type="button" className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto" onClick={resetForm}>Cancel edit</button> : null}
              {step < STEPS.length - 1 ? <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-brand-700 sm:w-auto" onClick={goNext}>Continue <ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-600 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto" onClick={onSubmit}>{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" strokeWidth={2.5} />}{editingId ? "Save changes" : "Create student"}</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-dashed border-slate-300/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.12)] sm:p-8">
        <div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white"><Upload className="h-6 w-6" /></div><div><h3 className="text-lg font-bold text-slate-900">Bulk import (CSV)</h3><p className="mt-1 max-w-xl text-sm text-slate-600">Paste comma-separated rows below. Expected headers include <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-xs font-mono text-slate-800">name</code>, <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-xs font-mono text-slate-800">email</code>, <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-xs font-mono text-slate-800">password</code>, class fields, and roll number.</p></div></div>
        <textarea className={`${inputClass} mt-5 min-h-32 font-mono text-xs leading-relaxed`} value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="Paste CSV here..." />
        <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800" onClick={importCSV}><Upload className="h-4 w-4" /> Run import</button>
      </div>
    </div>
  );
}
