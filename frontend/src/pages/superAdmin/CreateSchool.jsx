import { useState } from "react";
import toast from "react-hot-toast";
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
  planPrice: "",
  billingCycle: "Monthly",
  startDate: "",
  endDate: "",
  trialDays: "",
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
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const sectionClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6";
const sectionTitleClass = "text-base font-semibold text-slate-900 sm:text-lg";
const sectionHintClass = "mt-1 text-xs text-slate-500 sm:text-sm";
const fieldsGridClass = "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600";
const inputClass = "input transition duration-200 hover:border-slate-400 focus:shadow-sm";
const checkboxGridClass = "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3";
const checkboxCardClass =
  "flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50";

function CreateSchoolPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        classesOffered: toArray(form.classesOffered),
        departments: toArray(form.departments),
        allowedIPs: toArray(form.allowedIPs),
        otherDocuments: toArray(form.otherDocuments),
      };
      const response = await superAdminService.createSchool(payload);
      toast.success(`School created. Admin: ${response.schoolAdmin?.email || form.adminEmail}`);
      setForm(INITIAL_FORM);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-7 text-white shadow-lg sm:px-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Create School</h2>
        <p className="mt-2 text-sm text-slate-200 sm:text-base">
          Configure a complete school profile and automatically create the SCHOOL_ADMIN account.
        </p>
      </header>

      <form className="space-y-5 sm:space-y-6" onSubmit={onSubmit}>
        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>1. Basic School Information</h3>
          <p className={sectionHintClass}>Primary identity and contact details.</p>
          <div className={fieldsGridClass}>
            <div>
              <label className={labelClass}>School Name</label>
              <input className={inputClass} name="schoolName" value={form.schoolName} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>School Code</label>
              <input className={inputClass} name="schoolCode" value={form.schoolCode} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} name="email" type="email" value={form.email} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input className={inputClass} name="phoneNumber" value={form.phoneNumber} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Alternate Phone</label>
              <input className={inputClass} name="alternatePhone" value={form.alternatePhone} onChange={onChange} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input className={inputClass} name="website" value={form.website} onChange={onChange} />
            </div>
            <div>
              <label className={labelClass}>Established Year</label>
              <input className={inputClass} name="establishedYear" type="number" value={form.establishedYear} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>School Type</label>
              <select className={inputClass} name="schoolType" value={form.schoolType} onChange={onChange}>
                <option>Private</option>
                <option>Government</option>
                <option>Semi-Govt</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Affiliation Board</label>
              <select className={inputClass} name="affiliationBoard" value={form.affiliationBoard} onChange={onChange}>
                <option>CBSE</option>
                <option>ICSE</option>
                <option>State Board</option>
                <option>IB</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Medium</label>
              <select className={inputClass} name="medium" value={form.medium} onChange={onChange}>
                <option>English</option>
                <option>Hindi</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>2. Address Details</h3>
          <p className={sectionHintClass}>Location and map-ready coordinates.</p>
          <div className={fieldsGridClass}>
            <div className="sm:col-span-2 xl:col-span-2">
              <label className={labelClass}>Address Line 1</label>
              <input className={inputClass} name="addressLine1" value={form.addressLine1} onChange={onChange} required />
            </div>
            <div className="sm:col-span-2 xl:col-span-1">
              <label className={labelClass}>Address Line 2</label>
              <input className={inputClass} name="addressLine2" value={form.addressLine2} onChange={onChange} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input className={inputClass} name="city" value={form.city} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input className={inputClass} name="state" value={form.state} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input className={inputClass} name="country" value={form.country} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Pincode</label>
              <input className={inputClass} name="pincode" value={form.pincode} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Latitude</label>
              <input className={inputClass} name="latitude" type="number" step="any" value={form.latitude} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input className={inputClass} name="longitude" type="number" step="any" value={form.longitude} onChange={onChange} required />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>3. Academic Structure</h3>
          <p className={sectionHintClass}>Class and session capacity details.</p>
          <div className={fieldsGridClass}>
            <div className="sm:col-span-2 xl:col-span-3">
              <label className={labelClass}>Classes Offered (comma-separated)</label>
              <input
                className={inputClass}
                name="classesOffered"
                value={form.classesOffered}
                onChange={onChange}
                placeholder="Nursery, KG, 1, 2, ... 12"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Sections Per Class</label>
              <input className={inputClass} name="sectionsPerClass" type="number" value={form.sectionsPerClass} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Total Capacity</label>
              <input className={inputClass} name="totalCapacity" type="number" value={form.totalCapacity} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Session Start Month</label>
              <input className={inputClass} name="sessionStartMonth" value={form.sessionStartMonth} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Session End Month</label>
              <input className={inputClass} name="sessionEndMonth" value={form.sessionEndMonth} onChange={onChange} required />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>4. School Admin Details (Auto Create)</h3>
          <p className={sectionHintClass}>A SCHOOL_ADMIN account is created automatically after school creation.</p>
          <div className={fieldsGridClass}>
            <div>
              <label className={labelClass}>Admin Name</label>
              <input className={inputClass} name="adminName" value={form.adminName} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Admin Email</label>
              <input className={inputClass} name="adminEmail" type="email" value={form.adminEmail} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Admin Phone</label>
              <input className={inputClass} name="adminPhone" value={form.adminPhone} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Admin Password</label>
              <input className={inputClass} name="adminPassword" type="password" value={form.adminPassword} onChange={onChange} required />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>5. Staff Configuration</h3>
          <p className={sectionHintClass}>Teacher and staff capacity planning.</p>
          <div className={fieldsGridClass}>
            <div>
              <label className={labelClass}>Max Teachers Allowed</label>
              <input className={inputClass} name="maxTeachersAllowed" type="number" value={form.maxTeachersAllowed} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Max Staff Allowed</label>
              <input className={inputClass} name="maxStaffAllowed" type="number" value={form.maxStaffAllowed} onChange={onChange} required />
            </div>
            <div className="sm:col-span-2 xl:col-span-3">
              <label className={labelClass}>Departments (comma-separated)</label>
              <input
                className={inputClass}
                name="departments"
                value={form.departments}
                onChange={onChange}
                placeholder="Science, Commerce, Arts"
                required
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>6. Student Configuration</h3>
          <p className={sectionHintClass}>Enrollment and roll-number strategy.</p>
          <div className={fieldsGridClass}>
            <div>
              <label className={labelClass}>Max Students Allowed</label>
              <input className={inputClass} name="maxStudentsAllowed" type="number" value={form.maxStudentsAllowed} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Admission Prefix</label>
              <input className={inputClass} name="admissionPrefix" value={form.admissionPrefix} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Roll Number Format</label>
              <input className={inputClass} name="rollNumberFormat" value={form.rollNumberFormat} onChange={onChange} required />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>7. Subscription / Plan Details</h3>
          <p className={sectionHintClass}>Plan lifecycle and billing configuration.</p>
          <div className={fieldsGridClass}>
            <div>
              <label className={labelClass}>Plan Type</label>
              <select className={inputClass} name="planType" value={form.planType} onChange={onChange}>
                <option>Free</option>
                <option>Basic</option>
                <option>Premium</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Plan Price</label>
              <input className={inputClass} name="planPrice" type="number" step="0.01" value={form.planPrice} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Billing Cycle</label>
              <select className={inputClass} name="billingCycle" value={form.billingCycle} onChange={onChange}>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Start Date</label>
              <input className={inputClass} name="startDate" type="date" value={form.startDate} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input className={inputClass} name="endDate" type="date" value={form.endDate} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Trial Days</label>
              <input className={inputClass} name="trialDays" type="number" value={form.trialDays} onChange={onChange} required />
            </div>
          </div>
          <div className={checkboxGridClass}>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} />
              Subscription Active
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>8. Payment Settings</h3>
          <p className={sectionHintClass}>Payment methods and currency selection.</p>
          <div className={checkboxGridClass}>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="razorpayEnabled" checked={form.razorpayEnabled} onChange={onChange} />
              Razorpay
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="stripeEnabled" checked={form.stripeEnabled} onChange={onChange} />
              Stripe
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="cashEnabled" checked={form.cashEnabled} onChange={onChange} />
              Cash
            </label>
          </div>
          <div className={fieldsGridClass}>
            <div>
              <label className={labelClass}>Currency</label>
              <select className={inputClass} name="currency" value={form.currency} onChange={onChange}>
                <option>INR</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>9. Branding</h3>
          <p className={sectionHintClass}>Theme and visual identity customization.</p>
          <div className={fieldsGridClass}>
            <div>
              <label className={labelClass}>School Logo URL</label>
              <input className={inputClass} name="schoolLogo" value={form.schoolLogo} onChange={onChange} />
            </div>
            <div>
              <label className={labelClass}>Favicon URL</label>
              <input className={inputClass} name="favicon" value={form.favicon} onChange={onChange} />
            </div>
            <div>
              <label className={labelClass}>Primary Color</label>
              <input className={`${inputClass} h-11 p-1`} name="primaryColor" type="color" value={form.primaryColor} onChange={onChange} />
            </div>
            <div>
              <label className={labelClass}>Secondary Color</label>
              <input className={`${inputClass} h-11 p-1`} name="secondaryColor" type="color" value={form.secondaryColor} onChange={onChange} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>10. Feature Controls</h3>
          <p className={sectionHintClass}>Enable or disable school-level modules.</p>
          <div className={checkboxGridClass}>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="attendanceModule" checked={form.attendanceModule} onChange={onChange} />
              Attendance Module
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="feesModule" checked={form.feesModule} onChange={onChange} />
              Fees Module
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="examModule" checked={form.examModule} onChange={onChange} />
              Exam Module
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="transportModule" checked={form.transportModule} onChange={onChange} />
              Transport Module
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="hostelModule" checked={form.hostelModule} onChange={onChange} />
              Hostel Module
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="libraryModule" checked={form.libraryModule} onChange={onChange} />
              Library Module
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>11. Security Settings</h3>
          <p className={sectionHintClass}>Access controls and security restrictions.</p>
          <div className={checkboxGridClass}>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="securityIsActive" checked={form.securityIsActive} onChange={onChange} />
              School Active
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="isBlocked" checked={form.isBlocked} onChange={onChange} />
              Blocked
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="loginAccess" checked={form.loginAccess} onChange={onChange} />
              Login Access
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="twoFactorAuthEnabled" checked={form.twoFactorAuthEnabled} onChange={onChange} />
              Two Factor Auth
            </label>
          </div>
          <div className={fieldsGridClass}>
            <div className="sm:col-span-2 xl:col-span-3">
              <label className={labelClass}>Allowed IPs (comma-separated)</label>
              <input className={inputClass} name="allowedIPs" value={form.allowedIPs} onChange={onChange} placeholder="192.168.1.1, 10.0.0.2" />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>12. Communication Settings</h3>
          <p className={sectionHintClass}>Channels available for school-wide communication.</p>
          <div className={checkboxGridClass}>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="smsEnabled" checked={form.smsEnabled} onChange={onChange} />
              SMS Enabled
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="emailEnabled" checked={form.emailEnabled} onChange={onChange} />
              Email Enabled
            </label>
            <label className={checkboxCardClass}>
              <input type="checkbox" name="whatsappEnabled" checked={form.whatsappEnabled} onChange={onChange} />
              WhatsApp Enabled
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>13. Documents</h3>
          <p className={sectionHintClass}>Optional verification and support document URLs.</p>
          <div className={fieldsGridClass}>
            <div className="sm:col-span-2 xl:col-span-3">
              <label className={labelClass}>Registration Certificate URL</label>
              <input className={inputClass} name="registrationCertificate" value={form.registrationCertificate} onChange={onChange} />
            </div>
            <div className="sm:col-span-2 xl:col-span-3">
              <label className={labelClass}>Affiliation Proof URL</label>
              <input className={inputClass} name="affiliationProof" value={form.affiliationProof} onChange={onChange} />
            </div>
            <div className="sm:col-span-2 xl:col-span-3">
              <label className={labelClass}>Other Documents URLs (comma-separated)</label>
              <input className={inputClass} name="otherDocuments" value={form.otherDocuments} onChange={onChange} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>14. Extra Preferences</h3>
          <p className={sectionHintClass}>Localization and date/time preferences.</p>
          <div className={fieldsGridClass}>
            <div>
              <label className={labelClass}>Timezone</label>
              <input className={inputClass} name="timezone" value={form.timezone} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Language</label>
              <input className={inputClass} name="language" value={form.language} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Date Format</label>
              <input className={inputClass} name="dateFormat" value={form.dateFormat} onChange={onChange} required />
            </div>
            <div>
              <label className={labelClass}>Time Format</label>
              <select className={inputClass} name="timeFormat" value={form.timeFormat} onChange={onChange}>
                <option value="24h">24h</option>
                <option value="12h">12h</option>
              </select>
            </div>
          </div>
        </section>

        <div className="sticky bottom-3 z-10 flex justify-end rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur">
          <button type="submit" className="btn-primary min-w-40 px-6 py-2.5 text-sm shadow-sm hover:shadow-md" disabled={loading}>
            {loading ? "Creating..." : "Create School"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSchoolPage;
