import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  GraduationCap,
  IdCard,
  Landmark,
  MapPin,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { adminService } from "../../services/adminService";

const emptyForm = {
  email: "",
  password: "",
  status: "ACTIVE",
  isVerified: true,
  firstName: "",
  lastName: "",
  phone: "",
  gender: "OTHER",
  dateOfBirth: "",
  profileImage: null,
  profileImageUrl: "",
  employeeId: "",
  subjectIds: [],
  department: "",
  qualification: "",
  joiningDate: "",
  experience: "",
  assignedClassIds: [],
  sections: [],
  timetableId: "",
  addressLine: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  salary: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  panCard: "",
  aadharNumber: "",
  resume: null,
  resumeUrl: "",
  certificates: [],
  certificateUrls: [],
  idProof: null,
  idProofUrl: "",
};

const sectionOptions = ["A", "B", "C", "D", "E", "F"];

function toDateInput(value) {
  return value ? String(value).slice(0, 10) : "";
}

function ToggleChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      } max-w-full break-words text-left`}
    >
      {label}
    </button>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-800">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      </div>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function AdminTeacherCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingTeacherId = location.state?.teacherId || null;

  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetables, setTimetables] = useState([]);

  useEffect(() => {
    const load = async () => {
      setBootstrapLoading(true);
      try {
        const [classData, subjectData, timetableData] = await Promise.all([
          adminService.getClasses(),
          adminService.getSubjects(),
          adminService.listTimetable({}),
        ]);

        setClasses(classData || []);
        setSubjects(subjectData || []);
        setTimetables(Array.isArray(timetableData?.items) ? timetableData.items : Array.isArray(timetableData) ? timetableData : []);

        if (editingTeacherId) {
          const teacher = await adminService.getTeacherById(editingTeacherId);
          setForm({
            email: teacher.userId?.email || "",
            password: "",
            status: teacher.userId?.status || "ACTIVE",
            isVerified: Boolean(teacher.userId?.isVerified),
            firstName: teacher.firstName || "",
            lastName: teacher.lastName || "",
            phone: teacher.phone || "",
            gender: teacher.gender || "OTHER",
            dateOfBirth: toDateInput(teacher.dateOfBirth),
            profileImage: null,
            profileImageUrl: teacher.profileImage || "",
            employeeId: teacher.employeeId || "",
            subjectIds: (teacher.subjects || []).map((item) => item._id),
            department: teacher.department || "",
            qualification: teacher.qualification || "",
            joiningDate: toDateInput(teacher.joiningDate),
            experience: teacher.experience ?? "",
            assignedClassIds: (teacher.assignedClasses || []).map((item) => item._id),
            sections: teacher.sections || [],
            timetableId: teacher.timetableId?._id || "",
            addressLine: teacher.addressLine || "",
            city: teacher.city || "",
            state: teacher.state || "",
            country: teacher.country || "India",
            pincode: teacher.pincode || "",
            salary: teacher.salary ?? "",
            bankName: teacher.bankName || "",
            accountNumber: teacher.accountNumber || "",
            ifscCode: teacher.ifscCode || "",
            panCard: teacher.panCard || "",
            aadharNumber: teacher.aadharNumber || "",
            resume: null,
            resumeUrl: teacher.documents?.resume || "",
            certificates: [],
            certificateUrls: teacher.documents?.certificates || [],
            idProof: null,
            idProofUrl: teacher.documents?.idProof || "",
          });
        } else {
          setForm(emptyForm);
        }
      } catch (error) {
        toast.error(error.message || "Could not load teacher form");
      } finally {
        setBootstrapLoading(false);
      }
    };

    load();
  }, [editingTeacherId]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(form.firstName.trim()),
      Boolean(form.lastName.trim()),
      Boolean(form.email.trim()),
      editingTeacherId ? true : Boolean(form.password.trim()),
      Boolean(form.phone.trim()),
      Boolean(form.department.trim()),
      Boolean(form.qualification.trim()),
      Boolean(form.joiningDate),
      form.subjectIds.length > 0,
      form.assignedClassIds.length > 0,
      Boolean(form.addressLine.trim()),
      Boolean(form.salary !== ""),
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [editingTeacherId, form]);

  const onChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === "file") {
      if (name === "certificates") {
        setForm((prev) => ({ ...prev, certificates: Array.from(files || []) }));
      } else {
        setForm((prev) => ({ ...prev, [name]: files?.[0] || null }));
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleArrayValue = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("email", form.email);
      if (form.password) data.append("password", form.password);
      data.append("status", form.status);
      data.append("isVerified", String(form.isVerified));
      data.append("firstName", form.firstName);
      data.append("lastName", form.lastName);
      data.append("phone", form.phone);
      data.append("gender", form.gender);
      data.append("dateOfBirth", form.dateOfBirth);
      data.append("employeeId", form.employeeId);
      data.append("department", form.department);
      data.append("qualification", form.qualification);
      data.append("joiningDate", form.joiningDate);
      data.append("experience", String(form.experience || 0));
      data.append("timetableId", form.timetableId || "");
      data.append("addressLine", form.addressLine);
      data.append("city", form.city);
      data.append("state", form.state);
      data.append("country", form.country);
      data.append("pincode", form.pincode);
      data.append("salary", String(form.salary || 0));
      data.append("bankName", form.bankName);
      data.append("accountNumber", form.accountNumber);
      data.append("ifscCode", form.ifscCode);
      data.append("panCard", form.panCard);
      data.append("aadharNumber", form.aadharNumber);
      data.append("subjects", JSON.stringify(form.subjectIds));
      data.append("assignedClasses", JSON.stringify(form.assignedClassIds));
      data.append("sections", JSON.stringify(form.sections));
      data.append("certificates", JSON.stringify(form.certificateUrls));
      data.append("resume", form.resumeUrl || "");
      data.append("idProof", form.idProofUrl || "");
      data.append("profileImage", form.profileImageUrl || "");

      if (form.profileImage) data.set("profileImage", form.profileImage);
      if (form.resume) data.set("resume", form.resume);
      if (form.idProof) data.set("idProof", form.idProof);
      form.certificates.forEach((file) => data.append("certificates", file));

      if (editingTeacherId) {
        await adminService.updateTeacher(editingTeacherId, data);
        toast.success("Teacher updated successfully");
        navigate("/admin/teachers/registered");
      } else {
        await adminService.createTeacher(data);
        toast.success("Teacher created successfully");
        setForm(emptyForm);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (bootstrapLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)]">
        Loading teacher management form...
      </div>
    );
  }

  const selectedSubjectNames = subjects.filter((item) => form.subjectIds.includes(item._id)).map((item) => item.name);

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_100%)] px-6 py-6 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-sky-100">Teacher management</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {editingTeacherId ? "Update teacher profile" : "Create a complete teacher record"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                Capture authentication, profile, academic assignment, salary, bank, and document details in one guided admin flow.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm lg:min-w-[220px] lg:w-auto">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
                <span>Form completion</span>
                <span>{completion}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-200">Fill the core profile to finish the faculty record faster.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-2">
          <section className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Authentication</h2>
                <p className="text-sm text-slate-500">Secure teacher login credentials and account state.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" required>
                <input className="input" name="email" type="email" value={form.email} onChange={onChange} required />
              </Field>
              <Field label="Password" required={!editingTeacherId} hint={editingTeacherId ? "Leave blank to keep the current password." : "Minimum 6 characters."}>
                <input className="input" name="password" type="password" value={form.password} onChange={onChange} required={!editingTeacherId} />
              </Field>
              <Field label="Role">
                <div className="input flex items-center bg-slate-100 font-semibold text-slate-600">TEACHER</div>
              </Field>
              <Field label="Status">
                <select className="input" name="status" value={form.status} onChange={onChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </Field>
              <Field label="Verification">
                <label className="flex min-h-[44px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" name="isVerified" checked={form.isVerified} onChange={onChange} />
                  Mark this teacher account as verified
                </label>
              </Field>
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white">
                <UserRound className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Basic details</h2>
                <p className="text-sm text-slate-500">Personal information visible in teacher records.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" required>
                <input className="input" name="firstName" value={form.firstName} onChange={onChange} required />
              </Field>
              <Field label="Last name" required>
                <input className="input" name="lastName" value={form.lastName} onChange={onChange} required />
              </Field>
              <Field label="Phone number" required>
                <input className="input" name="phone" value={form.phone} onChange={onChange} required />
              </Field>
              <Field label="Gender">
                <select className="input" name="gender" value={form.gender} onChange={onChange}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Date of birth">
                <input className="input" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={onChange} />
              </Field>
              <Field label="Profile image">
                <input className="input py-2" name="profileImage" type="file" accept="image/*" onChange={onChange} />
              </Field>
            </div>
            {form.profileImageUrl ? <p className="text-xs text-slate-500">Current profile image: {form.profileImageUrl}</p> : null}
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <BriefcaseBusiness className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Professional details</h2>
                <p className="text-sm text-slate-500">Employment identifiers, department, experience, and joining data.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Employee ID" hint="Leave blank to auto-generate.">
                <input className="input" name="employeeId" value={form.employeeId} onChange={onChange} />
              </Field>
              <Field label="Department" required>
                <input className="input" name="department" value={form.department} onChange={onChange} required />
              </Field>
              <Field label="Qualification" required>
                <input className="input" name="qualification" value={form.qualification} onChange={onChange} required />
              </Field>
              <Field label="Joining date" required>
                <input className="input" name="joiningDate" type="date" value={form.joiningDate} onChange={onChange} required />
              </Field>
              <Field label="Experience (years)">
                <input className="input" name="experience" type="number" min="0" step="0.1" value={form.experience} onChange={onChange} />
              </Field>
            </div>
            <Field label="Subjects" required hint="Select one or more teaching subjects.">
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <ToggleChip
                    key={subject._id}
                    active={form.subjectIds.includes(subject._id)}
                    label={subject.name}
                    onClick={() => toggleArrayValue("subjectIds", subject._id)}
                  />
                ))}
              </div>
            </Field>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Academic and teaching info</h2>
                <p className="text-sm text-slate-500">Map teachers to subjects, class assignments, sections, and timetable.</p>
              </div>
            </div>
            <Field label="Assigned classes" required>
              <div className="flex flex-wrap gap-2">
                {classes.map((item) => {
                  const label = `${item.name}${item.section ? ` - ${item.section}` : ""}`;
                  return (
                    <ToggleChip
                      key={item._id}
                      active={form.assignedClassIds.includes(item._id)}
                      label={label}
                      onClick={() => toggleArrayValue("assignedClassIds", item._id)}
                    />
                  );
                })}
              </div>
            </Field>
            <Field label="Sections">
              <div className="flex flex-wrap gap-2">
                {sectionOptions.map((section) => (
                  <ToggleChip
                    key={section}
                    active={form.sections.includes(section)}
                    label={section}
                    onClick={() => toggleArrayValue("sections", section)}
                  />
                ))}
              </div>
            </Field>
            <Field label="Timetable ID reference">
              <select className="input" name="timetableId" value={form.timetableId} onChange={onChange}>
                <option value="">Select timetable row</option>
                {timetables.slice(0, 150).map((item) => (
                  <option key={item._id} value={item._id}>
                    {[item.day, item.startTime, item.endTime, item.subjectLabel || item.subjectId?.name || selectedSubjectNames[0], item.section]
                      .filter(Boolean)
                      .join(" | ")}
                  </option>
                ))}
              </select>
            </Field>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Address details</h2>
                <p className="text-sm text-slate-500">Home and location information for the teacher profile.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address line" required>
                <input className="input sm:col-span-2" name="addressLine" value={form.addressLine} onChange={onChange} required />
              </Field>
              <Field label="City">
                <input className="input" name="city" value={form.city} onChange={onChange} />
              </Field>
              <Field label="State">
                <input className="input" name="state" value={form.state} onChange={onChange} />
              </Field>
              <Field label="Country">
                <input className="input" name="country" value={form.country} onChange={onChange} />
              </Field>
              <Field label="Pincode">
                <input className="input" name="pincode" value={form.pincode} onChange={onChange} />
              </Field>
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
                <Landmark className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Salary and bank</h2>
                <p className="text-sm text-slate-500">Advanced ERP payroll and compliance information.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Salary" required>
                <input className="input" name="salary" type="number" min="0" value={form.salary} onChange={onChange} required />
              </Field>
              <Field label="Bank name">
                <input className="input" name="bankName" value={form.bankName} onChange={onChange} />
              </Field>
              <Field label="Account number">
                <input className="input" name="accountNumber" value={form.accountNumber} onChange={onChange} />
              </Field>
              <Field label="IFSC code">
                <input className="input" name="ifscCode" value={form.ifscCode} onChange={onChange} />
              </Field>
              <Field label="PAN card">
                <input className="input" name="panCard" value={form.panCard} onChange={onChange} />
              </Field>
              <Field label="Aadhar number">
                <input className="input" name="aadharNumber" value={form.aadharNumber} onChange={onChange} />
              </Field>
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Documents upload</h2>
                <p className="text-sm text-slate-500">Upload faculty resume, certificates, and ID proof from the admin portal.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Resume">
                <input className="input py-2" name="resume" type="file" accept=".pdf,.doc,.docx,image/*" onChange={onChange} />
                {form.resumeUrl ? <p className="text-xs text-slate-500">Current: {form.resumeUrl}</p> : null}
              </Field>
              <Field label="Certificates">
                <input className="input py-2" name="certificates" type="file" multiple accept=".pdf,.doc,.docx,image/*" onChange={onChange} />
                {!!form.certificateUrls.length ? <p className="text-xs text-slate-500">Saved files: {form.certificateUrls.length}</p> : null}
              </Field>
              <Field label="ID proof">
                <input className="input py-2" name="idProof" type="file" accept=".pdf,.doc,.docx,image/*" onChange={onChange} />
                {form.idProofUrl ? <p className="text-xs text-slate-500">Current: {form.idProofUrl}</p> : null}
              </Field>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:justify-between sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Password is secured in the backend and the teacher role is fixed automatically.
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              onClick={() => navigate("/admin/teachers/registered")}
            >
              <IdCard className="h-4 w-4" />
              View all teachers
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : editingTeacherId ? "Update teacher" : "Create teacher"}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}

export default AdminTeacherCreatePage;
