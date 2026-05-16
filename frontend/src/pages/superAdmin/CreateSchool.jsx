import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CreditCard,
  ListOrdered,
  Palette,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { superAdminService } from "../../services/superAdminService";

const INITIAL_FORM = {
  schoolName: "",
  schoolCode: "",
  email: "",
  phoneNumber: "",
  alternatePhone: "",
  website: "",
  establishedYear: "",
  schoolType: "Private",
  affiliationBoard: "CBSE",
  medium: "English",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  latitude: "",
  longitude: "",
  classesOffered: "",
  sectionsPerClass: "",
  totalCapacity: "",
  sessionStartMonth: "",
  sessionEndMonth: "",
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminPassword: "",
  maxTeachersAllowed: "",
  maxStaffAllowed: "",
  departments: "",
  maxStudentsAllowed: "",
  admissionPrefix: "",
  rollNumberFormat: "",
  planType: "Free",
  planPrice: "0",
  billingCycle: "Monthly",
  startDate: "",
  endDate: "",
  trialDays: "0",
  isActive: true,
  razorpayEnabled: false,
  stripeEnabled: false,
  cashEnabled: true,
  currency: "INR",
  schoolLogo: "",
  favicon: "",
  primaryColor: "#0ea5e9",
  secondaryColor: "#1f2937",
  attendanceModule: true,
  feesModule: true,
  examModule: true,
  transportModule: false,
  hostelModule: false,
  libraryModule: false,
  securityIsActive: true,
  isBlocked: false,
  loginAccess: true,
  allowedIPs: "",
  twoFactorAuthEnabled: false,
  smsEnabled: false,
  emailEnabled: true,
  whatsappEnabled: false,
  registrationCertificate: "",
  affiliationProof: "",
  otherDocuments: "",
  timezone: "Asia/Kolkata",
  language: "English",
  dateFormat: "DD-MM-YYYY",
  timeFormat: "24h",
};

const toArray = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const STEPS = [
  {
    id: "profile",
    title: "School & location",
    subtitle: "Registered identity, primary contacts, and postal address",
    icon: Building2,
  },
  {
    id: "academic",
    title: "Academic structure",
    subtitle: "Classes offered, capacity, and academic session",
    icon: BookOpen,
  },
  {
    id: "admin",
    title: "Administrator account",
    subtitle: "Initial school admin credentials (created with the tenant)",
    icon: UserCog,
  },
  {
    id: "operations",
    title: "Staff & enrollment",
    subtitle: "Headcount limits, departments, and student identifiers",
    icon: Users,
  },
  {
    id: "commercial",
    title: "Subscription & billing",
    subtitle: "Plan terms, contract dates, and payment preferences",
    icon: CreditCard,
  },
  {
    id: "polish",
    title: "Branding & governance",
    subtitle: "Visual identity, modules, access policy, and locale",
    icon: Palette,
  },
];

const FORM_GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
const INPUT_H = "h-14 min-h-[56px]";
const CONTROL_BASE = `w-full min-w-0 ${INPUT_H} rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`;
const CONTROL_ERROR = "border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/15";
const CHECKBOX_CARD =
  "flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300/70 hover:bg-slate-50/90 has-[:checked]:border-brand-500/60 has-[:checked]:bg-brand-50/50";

function validateStep(stepIndex, form) {
  const errors = {};
  const y = new Date().getFullYear();

  const need = (key, msg) => {
    if (!String(form[key] ?? "").trim()) errors[key] = msg;
  };

  if (stepIndex === 0) {
    need("schoolName", "School name is required");
    need("schoolCode", "School code is required");
    need("email", "Official email is required");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email";
    need("phoneNumber", "Phone number is required");
    const est = parseInt(form.establishedYear, 10);
    if (!form.establishedYear?.toString().trim()) errors.establishedYear = "Established year is required";
    else if (!Number.isFinite(est) || est < 1800 || est > y + 1)
      errors.establishedYear = `Use a year between 1800 and ${y + 1}`;
    need("schoolType", "School type is required");
    need("affiliationBoard", "Board is required");
    need("medium", "Medium is required");
    need("addressLine1", "Address is required");
    need("city", "City is required");
    need("state", "State is required");
    need("country", "Country is required");
    need("pincode", "Pincode is required");
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (form.latitude === "" || form.latitude === undefined) errors.latitude = "Latitude is required";
    else if (!Number.isFinite(lat)) errors.latitude = "Enter a valid latitude";
    if (form.longitude === "" || form.longitude === undefined) errors.longitude = "Longitude is required";
    else if (!Number.isFinite(lng)) errors.longitude = "Enter a valid longitude";
  }

  if (stepIndex === 1) {
    if (toArray(form.classesOffered).length < 1) errors.classesOffered = "List at least one class (comma-separated)";
    const sec = parseInt(form.sectionsPerClass, 10);
    if (!form.sectionsPerClass?.toString().trim()) errors.sectionsPerClass = "Required";
    else if (!Number.isFinite(sec) || sec < 1) errors.sectionsPerClass = "Must be at least 1";
    const cap = parseInt(form.totalCapacity, 10);
    if (!form.totalCapacity?.toString().trim()) errors.totalCapacity = "Required";
    else if (!Number.isFinite(cap) || cap < 1) errors.totalCapacity = "Must be at least 1";
    need("sessionStartMonth", "Session start month is required");
    need("sessionEndMonth", "Session end month is required");
  }

  if (stepIndex === 2) {
    need("adminName", "Admin name is required");
    need("adminEmail", "Admin email is required");
    if (form.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail.trim())) errors.adminEmail = "Enter a valid email";
    need("adminPhone", "Admin phone is required");
    if (!form.adminPassword || form.adminPassword.length < 6)
      errors.adminPassword = "Password must be at least 6 characters";
  }

  if (stepIndex === 3) {
    const mt = parseInt(form.maxTeachersAllowed, 10);
    if (!form.maxTeachersAllowed?.toString().trim()) errors.maxTeachersAllowed = "Required";
    else if (!Number.isFinite(mt) || mt < 1) errors.maxTeachersAllowed = "At least 1";
    const ms = parseInt(form.maxStaffAllowed, 10);
    if (!form.maxStaffAllowed?.toString().trim()) errors.maxStaffAllowed = "Required";
    else if (!Number.isFinite(ms) || ms < 1) errors.maxStaffAllowed = "At least 1";
    if (toArray(form.departments).length < 1) errors.departments = "Add at least one department (comma-separated)";
    const mx = parseInt(form.maxStudentsAllowed, 10);
    if (!form.maxStudentsAllowed?.toString().trim()) errors.maxStudentsAllowed = "Required";
    else if (!Number.isFinite(mx) || mx < 1) errors.maxStudentsAllowed = "At least 1";
    need("admissionPrefix", "Admission prefix is required");
    need("rollNumberFormat", "Roll number format is required");
  }

  if (stepIndex === 4) {
    need("planType", "Plan type is required");
    const price = parseFloat(form.planPrice);
    if (form.planPrice === "" || form.planPrice === undefined) errors.planPrice = "Plan price is required";
    else if (!Number.isFinite(price) || price < 0) errors.planPrice = "Must be 0 or greater";
    need("billingCycle", "Billing cycle is required");
    need("startDate", "Start date is required");
    need("endDate", "End date is required");
    if (form.startDate && form.endDate && form.startDate > form.endDate) errors.endDate = "End date must be on or after start date";
    const td = parseInt(form.trialDays, 10);
    if (form.trialDays === "" || form.trialDays === undefined) errors.trialDays = "Trial days is required";
    else if (!Number.isFinite(td) || td < 0) errors.trialDays = "Must be 0 or more";
    need("currency", "Currency is required");
  }

  if (stepIndex === 5) {
    need("primaryColor", "Primary color is required");
    need("secondaryColor", "Secondary color is required");
    need("timezone", "Timezone is required");
    need("language", "Language is required");
    need("dateFormat", "Date format is required");
    need("timeFormat", "Time format is required");
  }

  return errors;
}

function Field({ label, required, error, hint, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-rose-500" title="Required">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

function SubsectionTitle({ children, className = "" }) {
  return (
    <div className={`mb-4 mt-1 first:mt-0 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{children}</h3>
      <div className="mt-2 h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" aria-hidden />
    </div>
  );
}

function FormSection({ children }) {
  return <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5">{children}</div>;
}

function railStepClass({ active, completed, locked }) {
  if (active) return "border-brand-500 bg-brand-50/80 shadow-sm ring-2 ring-brand-500/20";
  if (completed) return "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 hover:bg-emerald-50";
  if (locked) return "cursor-not-allowed border-slate-200 bg-slate-50/80 opacity-50";
  return "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";
}

function CreateSchoolPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [maxReached, setMaxReached] = useState(0);

  const progressPercent = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const goNext = () => {
    const errs = validateStep(step, form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Resolve the highlighted fields before continuing.");
      return;
    }
    setMaxReached((m) => Math.max(m, step + 1));
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    setFieldErrors({});
  };

  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
    setFieldErrors({});
  };

  const goToStep = (target) => {
    if (target <= maxReached) {
      setStep(target);
      setFieldErrors({});
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const allErrors = {};
    let firstInvalid = null;
    for (let i = 0; i < STEPS.length; i += 1) {
      const stepErrs = validateStep(i, form);
      if (firstInvalid === null && Object.keys(stepErrs).length > 0) firstInvalid = i;
      Object.assign(allErrors, stepErrs);
    }
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      if (firstInvalid != null) setStep(firstInvalid);
      toast.error("Required information is incomplete. Review the form and try again.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        planPrice: form.planPrice === "" ? 0 : Number(form.planPrice),
        trialDays: form.trialDays === "" ? 0 : parseInt(form.trialDays, 10),
        classesOffered: toArray(form.classesOffered),
        departments: toArray(form.departments),
        allowedIPs: toArray(form.allowedIPs),
        otherDocuments: toArray(form.otherDocuments),
        startDate: form.startDate ? new Date(form.startDate).toISOString() : form.startDate,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : form.endDate,
      };
      const response = await superAdminService.createSchool(payload);
      toast.success(`School created. Admin: ${response.schoolAdmin?.email || form.adminEmail}`);
      setForm(INITIAL_FORM);
      setStep(0);
      setMaxReached(0);
      setFieldErrors({});
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const err = (name) => fieldErrors[name];
  const controlClass = (name) => `${CONTROL_BASE} ${err(name) ? CONTROL_ERROR : ""}`;
  const checkboxClass = CHECKBOX_CARD;

  const StepIcon = STEPS[step].icon;

  const renderStepFields = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <FormSection>
              <SubsectionTitle>School identity</SubsectionTitle>
              <div className={FORM_GRID}>
            <Field label="School name" required error={err("schoolName")}>
              <input className={controlClass("schoolName")} name="schoolName" value={form.schoolName} onChange={onChange} />
            </Field>
            <Field label="School code" required error={err("schoolCode")}>
              <input className={controlClass("schoolCode")} name="schoolCode" value={form.schoolCode} onChange={onChange} />
            </Field>
            <Field label="Official email" required error={err("email")}>
              <input className={controlClass("email")} name="email" type="email" value={form.email} onChange={onChange} />
            </Field>
            <Field label="Phone" required error={err("phoneNumber")}>
              <input className={controlClass("phoneNumber")} name="phoneNumber" value={form.phoneNumber} onChange={onChange} />
            </Field>
            <Field label="Alternate phone" error={err("alternatePhone")}>
              <input className={controlClass("alternatePhone")} name="alternatePhone" value={form.alternatePhone} onChange={onChange} />
            </Field>
            <Field label="Website" error={err("website")}>
              <input className={controlClass("website")} name="website" value={form.website} onChange={onChange} placeholder="https://" />
            </Field>
            <Field label="Established year" required error={err("establishedYear")}>
              <input
                className={controlClass("establishedYear")}
                name="establishedYear"
                type="number"
                value={form.establishedYear}
                onChange={onChange}
              />
            </Field>
            <Field label="School type" required error={err("schoolType")}>
              <select className={controlClass("schoolType")} name="schoolType" value={form.schoolType} onChange={onChange}>
                <option>Private</option>
                <option>Government</option>
                <option>Semi-Govt</option>
              </select>
            </Field>
            <Field label="Affiliation board" required error={err("affiliationBoard")}>
              <select className={controlClass("affiliationBoard")} name="affiliationBoard" value={form.affiliationBoard} onChange={onChange}>
                <option>CBSE</option>
                <option>ICSE</option>
                <option>State Board</option>
                <option>IB</option>
              </select>
            </Field>
            <Field label="Medium" required error={err("medium")}>
              <select className={controlClass("medium")} name="medium" value={form.medium} onChange={onChange}>
                <option>English</option>
                <option>Hindi</option>
                <option>Other</option>
              </select>
            </Field>
              </div>
            </FormSection>
            <FormSection>
              <SubsectionTitle>Location</SubsectionTitle>
              <div className={FORM_GRID}>
                <Field label="Address line 1" required error={err("addressLine1")} className="sm:col-span-2 xl:col-span-2">
                  <input className={controlClass("addressLine1")} name="addressLine1" value={form.addressLine1} onChange={onChange} />
                </Field>
                <Field label="Address line 2" error={err("addressLine2")} className="sm:col-span-2 xl:col-span-2">
                  <input className={controlClass("addressLine2")} name="addressLine2" value={form.addressLine2} onChange={onChange} />
                </Field>
                <Field label="City" required error={err("city")}>
                  <input className={controlClass("city")} name="city" value={form.city} onChange={onChange} />
                </Field>
                <Field label="State" required error={err("state")}>
                  <input className={controlClass("state")} name="state" value={form.state} onChange={onChange} />
                </Field>
                <Field label="Country" required error={err("country")}>
                  <input className={controlClass("country")} name="country" value={form.country} onChange={onChange} />
                </Field>
                <Field label="Pincode" required error={err("pincode")}>
                  <input className={controlClass("pincode")} name="pincode" value={form.pincode} onChange={onChange} />
                </Field>
                <Field label="Latitude" required error={err("latitude")}>
                  <input className={controlClass("latitude")} name="latitude" type="number" step="any" value={form.latitude} onChange={onChange} />
                </Field>
                <Field label="Longitude" required error={err("longitude")}>
                  <input className={controlClass("longitude")} name="longitude" type="number" step="any" value={form.longitude} onChange={onChange} />
                </Field>
              </div>
            </FormSection>
          </div>
        );
      case 1:
        return (
          <FormSection>
            <div className={FORM_GRID}>
              <Field label="Classes offered (comma-separated)" required error={err("classesOffered")} className="sm:col-span-2 xl:col-span-4">
                <input
                  className={controlClass("classesOffered")}
                  name="classesOffered"
                  value={form.classesOffered}
                  onChange={onChange}
                  placeholder="Nursery, KG, 1, 2 … 12"
                />
              </Field>
              <Field label="Sections per class" required error={err("sectionsPerClass")}>
              <input
                className={controlClass("sectionsPerClass")}
                name="sectionsPerClass"
                type="number"
                min={1}
                value={form.sectionsPerClass}
                onChange={onChange}
              />
            </Field>
            <Field label="Total capacity" required error={err("totalCapacity")}>
              <input className={controlClass("totalCapacity")} name="totalCapacity" type="number" min={1} value={form.totalCapacity} onChange={onChange} />
            </Field>
            <Field label="Session start month" required error={err("sessionStartMonth")}>
              <input className={controlClass("sessionStartMonth")} name="sessionStartMonth" value={form.sessionStartMonth} onChange={onChange} placeholder="April" />
            </Field>
              <Field label="Session end month" required error={err("sessionEndMonth")}>
                <input className={controlClass("sessionEndMonth")} name="sessionEndMonth" value={form.sessionEndMonth} onChange={onChange} placeholder="March" />
              </Field>
            </div>
          </FormSection>
        );
      case 2:
        return (
          <FormSection>
            <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-950">
              <strong className="font-semibold text-slate-900">School administrator</strong> — this user is created as{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200">SCHOOL_ADMIN</code>{" "}
              for the new tenant. Transmit credentials through a secure channel after provisioning.
            </div>
            <div className={FORM_GRID}>
            <Field label="Admin full name" required error={err("adminName")}>
              <input className={controlClass("adminName")} name="adminName" value={form.adminName} onChange={onChange} />
            </Field>
            <Field label="Admin email" required error={err("adminEmail")}>
              <input className={controlClass("adminEmail")} name="adminEmail" type="email" value={form.adminEmail} onChange={onChange} />
            </Field>
            <Field label="Admin phone" required error={err("adminPhone")}>
              <input className={controlClass("adminPhone")} name="adminPhone" value={form.adminPhone} onChange={onChange} />
            </Field>
            <Field label="Admin password" required error={err("adminPassword")}>
              <input
                className={controlClass("adminPassword")}
                name="adminPassword"
                type="password"
                value={form.adminPassword}
                onChange={onChange}
                autoComplete="new-password"
              />
            </Field>
            </div>
          </FormSection>
        );
      case 3:
        return (
          <FormSection>
          <div className={FORM_GRID}>
            <Field label="Max teachers" required error={err("maxTeachersAllowed")}>
              <input
                className={controlClass("maxTeachersAllowed")}
                name="maxTeachersAllowed"
                type="number"
                min={1}
                value={form.maxTeachersAllowed}
                onChange={onChange}
              />
            </Field>
            <Field label="Max staff" required error={err("maxStaffAllowed")}>
              <input className={controlClass("maxStaffAllowed")} name="maxStaffAllowed" type="number" min={1} value={form.maxStaffAllowed} onChange={onChange} />
            </Field>
              <Field label="Departments (comma-separated)" required error={err("departments")} className="sm:col-span-2 xl:col-span-4">
                <input
                  className={controlClass("departments")}
                  name="departments"
                  value={form.departments}
                  onChange={onChange}
                  placeholder="Science, Commerce, Arts"
                />
              </Field>
            <Field label="Max students" required error={err("maxStudentsAllowed")}>
              <input
                className={controlClass("maxStudentsAllowed")}
                name="maxStudentsAllowed"
                type="number"
                min={1}
                value={form.maxStudentsAllowed}
                onChange={onChange}
              />
            </Field>
            <Field label="Admission prefix" required error={err("admissionPrefix")}>
              <input className={controlClass("admissionPrefix")} name="admissionPrefix" value={form.admissionPrefix} onChange={onChange} placeholder="ADM" />
            </Field>
            <Field label="Roll number format" required error={err("rollNumberFormat")}>
              <input
                className={controlClass("rollNumberFormat")}
                name="rollNumberFormat"
                value={form.rollNumberFormat}
                onChange={onChange}
                placeholder="e.g. {CLASS}-{ROLL}"
              />
            </Field>
          </div>
          </FormSection>
        );
      case 4:
        return (
          <FormSection>
            <div className="space-y-4">
            <div className={FORM_GRID}>
              <Field label="Plan type" required error={err("planType")}>
                <select className={controlClass("planType")} name="planType" value={form.planType} onChange={onChange}>
                  <option>Free</option>
                  <option>Basic</option>
                  <option>Premium</option>
                </select>
              </Field>
              <Field label="Plan price" required error={err("planPrice")}>
                <input className={controlClass("planPrice")} name="planPrice" type="number" step="0.01" min={0} value={form.planPrice} onChange={onChange} />
              </Field>
              <Field label="Billing cycle" required error={err("billingCycle")}>
                <select className={controlClass("billingCycle")} name="billingCycle" value={form.billingCycle} onChange={onChange}>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </Field>
              <Field label="Start date" required error={err("startDate")}>
                <input className={controlClass("startDate")} name="startDate" type="date" value={form.startDate} onChange={onChange} />
              </Field>
              <Field label="End date" required error={err("endDate")}>
                <input className={controlClass("endDate")} name="endDate" type="date" value={form.endDate} onChange={onChange} />
              </Field>
              <Field label="Trial days" required error={err("trialDays")}>
                <input className={controlClass("trialDays")} name="trialDays" type="number" min={0} value={form.trialDays} onChange={onChange} />
              </Field>
              <Field label="Currency" required error={err("currency")}>
                <select className={controlClass("currency")} name="currency" value={form.currency} onChange={onChange}>
                  <option>INR</option>
                  <option>USD</option>
                </select>
              </Field>
            </div>
            <label className={checkboxClass}>
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
              Subscription active
            </label>
            <p className="text-xs text-slate-500">Payment channels — enable the methods this school will accept at settlement.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className={checkboxClass}>
                <input type="checkbox" name="razorpayEnabled" checked={form.razorpayEnabled} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                Razorpay
              </label>
              <label className={checkboxClass}>
                <input type="checkbox" name="stripeEnabled" checked={form.stripeEnabled} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                Stripe
              </label>
              <label className={checkboxClass}>
                <input type="checkbox" name="cashEnabled" checked={form.cashEnabled} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                Cash
              </label>
            </div>
          </div>
          </FormSection>
        );
      case 5:
        return (
          <div className="space-y-8">
            <div>
              <SubsectionTitle>Branding</SubsectionTitle>
              <div className={FORM_GRID}>
                <Field label="Logo URL" error={err("schoolLogo")}>
                  <input className={controlClass("schoolLogo")} name="schoolLogo" value={form.schoolLogo} onChange={onChange} />
                </Field>
                <Field label="Favicon URL" error={err("favicon")}>
                  <input className={controlClass("favicon")} name="favicon" value={form.favicon} onChange={onChange} />
                </Field>
                <Field label="Primary color" required error={err("primaryColor")}>
                  <input className={`${controlClass("primaryColor")} ${INPUT_H} cursor-pointer p-1`} name="primaryColor" type="color" value={form.primaryColor} onChange={onChange} />
                </Field>
                <Field label="Secondary color" required error={err("secondaryColor")}>
                  <input
                    className={`${controlClass("secondaryColor")} ${INPUT_H} cursor-pointer p-1`}
                    name="secondaryColor"
                    type="color"
                    value={form.secondaryColor}
                    onChange={onChange}
                  />
                </Field>
              </div>
            </div>
            <div>
              <SubsectionTitle>Modules</SubsectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["attendanceModule", "Attendance"],
                  ["feesModule", "Fees"],
                  ["examModule", "Exams"],
                  ["transportModule", "Transport"],
                  ["hostelModule", "Hostel"],
                  ["libraryModule", "Library"],
                ].map(([name, label]) => (
                  <label key={name} className={checkboxClass}>
                    <input
                      type="checkbox"
                      name={name}
                      checked={form[name]}
                      onChange={onChange}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <SubsectionTitle>Security & access</SubsectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className={checkboxClass}>
                  <input type="checkbox" name="securityIsActive" checked={form.securityIsActive} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  School active
                </label>
                <label className={checkboxClass}>
                  <input type="checkbox" name="isBlocked" checked={form.isBlocked} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  Blocked
                </label>
                <label className={checkboxClass}>
                  <input type="checkbox" name="loginAccess" checked={form.loginAccess} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  Login access
                </label>
                <label className={checkboxClass}>
                  <input
                    type="checkbox"
                    name="twoFactorAuthEnabled"
                    checked={form.twoFactorAuthEnabled}
                    onChange={onChange}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                  Two-factor auth
                </label>
              </div>
              <div className="mt-3">
                <Field label="Allowed IPs (comma-separated)" error={err("allowedIPs")}>
                  <input className={controlClass("allowedIPs")} name="allowedIPs" value={form.allowedIPs} onChange={onChange} placeholder="Optional" />
                </Field>
              </div>
            </div>
            <div>
              <SubsectionTitle>Communication</SubsectionTitle>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className={checkboxClass}>
                  <input type="checkbox" name="smsEnabled" checked={form.smsEnabled} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  SMS
                </label>
                <label className={checkboxClass}>
                  <input type="checkbox" name="emailEnabled" checked={form.emailEnabled} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  Email
                </label>
                <label className={checkboxClass}>
                  <input type="checkbox" name="whatsappEnabled" checked={form.whatsappEnabled} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  WhatsApp
                </label>
              </div>
            </div>
            <div>
              <SubsectionTitle>Compliance documents (optional)</SubsectionTitle>
              <div className="grid gap-4 sm:grid-cols-1">
                <Field label="Registration certificate URL" error={err("registrationCertificate")}>
                  <input className={controlClass("registrationCertificate")} name="registrationCertificate" value={form.registrationCertificate} onChange={onChange} />
                </Field>
                <Field label="Affiliation proof URL" error={err("affiliationProof")}>
                  <input className={controlClass("affiliationProof")} name="affiliationProof" value={form.affiliationProof} onChange={onChange} />
                </Field>
                <Field label="Other documents (comma-separated URLs)" error={err("otherDocuments")}>
                  <input className={controlClass("otherDocuments")} name="otherDocuments" value={form.otherDocuments} onChange={onChange} />
                </Field>
              </div>
            </div>
            <div>
              <SubsectionTitle>Locale & formats</SubsectionTitle>
              <div className={FORM_GRID}>
                <Field label="Timezone" required error={err("timezone")}>
                  <input className={controlClass("timezone")} name="timezone" value={form.timezone} onChange={onChange} />
                </Field>
                <Field label="Language" required error={err("language")}>
                  <input className={controlClass("language")} name="language" value={form.language} onChange={onChange} />
                </Field>
                <Field label="Date format" required error={err("dateFormat")}>
                  <input className={controlClass("dateFormat")} name="dateFormat" value={form.dateFormat} onChange={onChange} />
                </Field>
                <Field label="Time format" required error={err("timeFormat")}>
                  <select className={controlClass("timeFormat")} name="timeFormat" value={form.timeFormat} onChange={onChange}>
                    <option value="24h">24h</option>
                    <option value="12h">12h</option>
                  </select>
                </Field>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const stepMeta = STEPS[step];

  return (
    <div className="relative w-full max-w-7xl space-y-6 pb-28">
      <div
        className="pointer-events-none absolute -right-20 -top-4 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl md:right-0"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/4 top-96 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl lg:top-64"
        aria-hidden
      />

      <header className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500" aria-hidden />
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <Link
            to="/super-admin/schools"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to schools
          </Link>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-800">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden />
              Tenant provisioning
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create school workspace</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Use the workflow steps to provision a new tenant. Fields marked{" "}
              <span className="font-semibold text-rose-600">*</span> are required by the API.
            </p>
          </div>
          <div className="flex flex-wrap items-stretch gap-4 lg:flex-col lg:items-stretch">
            <div className="min-w-[130px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center lg:flex-initial">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completion</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{progressPercent}%</p>
            </div>
            <div className="min-w-[130px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center lg:flex-initial">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active step</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                {step + 1}
                <span className="text-slate-400"> / </span>
                {STEPS.length}
              </p>
            </div>
          </div>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
              <span>Overall progress</span>
              <span className="tabular-nums">{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <aside className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3" aria-label="Workflow steps">
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="p-4 sm:p-5 lg:sticky lg:top-20">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <ListOrdered className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Workflow</h2>
                  <p className="text-xs text-slate-500">Select a section</p>
                </div>
              </div>
              <ol className="mt-4 space-y-2">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const completed = i < step;
                  const active = i === step;
                  const locked = i > maxReached;
                  const railClass = railStepClass({ active, completed, locked });
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => goToStep(i)}
                        disabled={locked}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${railClass}`}
                      >
                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                            active ? "bg-brand-600 text-white" : completed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {completed ? <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden /> : <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
                        </span>
                        <span className="min-w-0 pt-0.5">
                          <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Step {i + 1}</span>
                          <span className={`block text-sm font-bold leading-snug ${active ? "text-slate-900" : "text-slate-700"}`}>{s.title}</span>
                          <span className="mt-0.5 line-clamp-2 text-xs text-slate-500">{s.subtitle}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
          <div className="mt-4 hidden rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-brand-50/40 p-4 text-sm leading-relaxed text-slate-700 shadow-md shadow-cyan-500/5 lg:block">
            <p className="font-semibold text-cyan-900">Tip</p>
            <p className="mt-1 text-xs text-slate-600">
              Validate each step with <span className="font-semibold text-brand-700">Continue</span> before submitting—this mirrors how
              production APIs enforce required data.
            </p>
          </div>
        </aside>

        <div className="order-1 min-w-0 lg:order-2 lg:col-span-8 xl:col-span-9">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-indigo-900/[0.08] ring-1 ring-slate-100/80">
              <div className={`border-b border-slate-100 bg-slate-50/90 px-6 py-5 sm:px-8 sm:py-6`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                    <StepIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Section {step + 1} of {STEPS.length}</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{stepMeta.title}</h2>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{stepMeta.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/60 to-white p-6 sm:p-8">{renderStepFields()}</div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_32px_-8px_rgba(15,23,42,0.12)] backdrop-blur-md sm:px-6 md:left-64">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-xs text-slate-600 sm:text-left">
                  <span className="bg-gradient-to-r from-violet-600 to-brand-600 bg-clip-text font-bold text-transparent">{stepMeta.title}</span>
                  <span className="text-slate-400"> · </span>
                  {Object.keys(validateStep(step, form)).length === 0 ? (
                    <span className="text-emerald-700">Section valid — ready to continue.</span>
                  ) : (
                    <span className="text-amber-700">Complete required fields to proceed.</span>
                  )}
                </p>
                <div className="flex justify-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 0}
                    className={`inline-flex ${INPUT_H} items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Back
                  </button>
                  {step < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className={`inline-flex ${INPUT_H} items-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700`}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`inline-flex ${INPUT_H} items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60`}
                    >
                      {loading ? "Creating…" : "Create school"}
                      <Check className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSchoolPage;
