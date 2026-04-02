import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { superAdminService } from "../../services/superAdminService";

const toStringArray = (value) => (Array.isArray(value) ? value.join(", ") : "");

const mapSchoolToForm = (school) => ({
  schoolName: school?.basicInfo?.schoolName || school?.name || "",
  schoolCode: school?.basicInfo?.schoolCode || school?.code || "",
  email: school?.basicInfo?.email || "",
  phoneNumber: school?.basicInfo?.phoneNumber || "",
  alternatePhone: school?.basicInfo?.alternatePhone || "",
  website: school?.basicInfo?.website || "",
  establishedYear: school?.basicInfo?.establishedYear || "",
  schoolType: school?.basicInfo?.schoolType || "Private",
  affiliationBoard: school?.basicInfo?.affiliationBoard || "CBSE",
  medium: school?.basicInfo?.medium || "English",
  addressLine1: school?.addressDetails?.addressLine1 || "",
  addressLine2: school?.addressDetails?.addressLine2 || "",
  city: school?.addressDetails?.city || "",
  state: school?.addressDetails?.state || "",
  country: school?.addressDetails?.country || "",
  pincode: school?.addressDetails?.pincode || "",
  latitude: school?.addressDetails?.latitude || "",
  longitude: school?.addressDetails?.longitude || "",
  classesOffered: toStringArray(school?.academicStructure?.classesOffered),
  sectionsPerClass: school?.academicStructure?.sectionsPerClass || "",
  totalCapacity: school?.academicStructure?.totalCapacity || "",
  sessionStartMonth: school?.academicStructure?.sessionStartMonth || "",
  sessionEndMonth: school?.academicStructure?.sessionEndMonth || "",
  adminName: school?.schoolAdmin?.adminName || "",
  adminEmail: school?.schoolAdmin?.adminEmail || "",
  adminPhone: school?.schoolAdmin?.adminPhone || "",
  planType: school?.subscription?.planType || "Free",
  planPrice: school?.subscription?.planPrice || 0,
  billingCycle: school?.subscription?.billingCycle || "Monthly",
  startDate: school?.subscription?.startDate ? school.subscription.startDate.slice(0, 10) : "",
  endDate: school?.subscription?.endDate ? school.subscription.endDate.slice(0, 10) : "",
  trialDays: school?.subscription?.trialDays || 0,
  subscriptionIsActive: Boolean(school?.subscription?.isActive),
  attendanceModule: Boolean(school?.features?.attendanceModule),
  feesModule: Boolean(school?.features?.feesModule),
  examModule: Boolean(school?.features?.examModule),
  transportModule: Boolean(school?.features?.transportModule),
  hostelModule: Boolean(school?.features?.hostelModule),
  libraryModule: Boolean(school?.features?.libraryModule),
  securityIsActive: Boolean(school?.security?.isActive ?? school?.isActive),
  isBlocked: Boolean(school?.security?.isBlocked),
  loginAccess: Boolean(school?.security?.loginAccess),
  allowedIPs: toStringArray(school?.security?.allowedIPs),
  twoFactorAuthEnabled: Boolean(school?.security?.twoFactorAuthEnabled),
});

function SchoolViewPage() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [school, setSchool] = useState(null);
  const [form, setForm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await superAdminService.getSchoolById(schoolId);
      setSchool(data);
      setForm(mapSchoolToForm(data));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [schoolId]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await superAdminService.updateSchoolById(schoolId, {
        ...form,
        classesOffered: form.classesOffered
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        allowedIPs: form.allowedIPs
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      toast.success("School updated successfully");
      setEditMode(false);
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setForm(mapSchoolToForm(school));
    setEditMode(false);
  };

  const deleteSchool = async () => {
    try {
      await superAdminService.deleteSchoolById(schoolId);
      toast.success("School deleted");
      navigate("/super-admin/schools");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderInput = (label, name, type = "text") => (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</label>
      <input
        className="input"
        type={type}
        name={name}
        value={form?.[name] ?? ""}
        onChange={onChange}
        disabled={!editMode}
      />
    </div>
  );

  if (loading || !form) return <Loader text="Loading school..." />;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">School View</h2>
            <p className="text-sm text-gray-500">
              {school?.name} ({school?.code})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!editMode ? (
              <button className="btn-primary" type="button" onClick={() => setEditMode(true)}>
                Edit
              </button>
            ) : (
              <>
                <button className="btn-primary" type="button" disabled={saving} onClick={save}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button className="btn-secondary" type="button" onClick={cancel}>
                  Cancel
                </button>
              </>
            )}
            <button className="btn-secondary border-red-300 text-red-600 hover:bg-red-50" type="button" onClick={() => setShowDeleteModal(true)}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <section className="card">
        <h3 className="mb-4 text-lg font-semibold">Basic Info</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {renderInput("School Name", "schoolName")}
          {renderInput("School Code", "schoolCode")}
          {renderInput("Email", "email", "email")}
          {renderInput("Phone", "phoneNumber")}
          {renderInput("Alternate Phone", "alternatePhone")}
          {renderInput("Website", "website")}
          {renderInput("Established Year", "establishedYear", "number")}
          {renderInput("School Type", "schoolType")}
          {renderInput("Board", "affiliationBoard")}
          {renderInput("Medium", "medium")}
        </div>
      </section>

      <section className="card">
        <h3 className="mb-4 text-lg font-semibold">Address</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {renderInput("Address Line 1", "addressLine1")}
          {renderInput("Address Line 2", "addressLine2")}
          {renderInput("City", "city")}
          {renderInput("State", "state")}
          {renderInput("Country", "country")}
          {renderInput("Pincode", "pincode")}
          {renderInput("Latitude", "latitude", "number")}
          {renderInput("Longitude", "longitude", "number")}
        </div>
      </section>

      <section className="card">
        <h3 className="mb-4 text-lg font-semibold">Academic</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {renderInput("Classes Offered", "classesOffered")}
          {renderInput("Sections Per Class", "sectionsPerClass", "number")}
          {renderInput("Total Capacity", "totalCapacity", "number")}
          {renderInput("Session Start Month", "sessionStartMonth")}
          {renderInput("Session End Month", "sessionEndMonth")}
        </div>
      </section>

      <section className="card">
        <h3 className="mb-4 text-lg font-semibold">Admin</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {renderInput("Admin Name", "adminName")}
          {renderInput("Admin Email", "adminEmail", "email")}
          {renderInput("Admin Phone", "adminPhone")}
        </div>
      </section>

      <section className="card">
        <h3 className="mb-4 text-lg font-semibold">Subscription</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {renderInput("Plan Type", "planType")}
          {renderInput("Plan Price", "planPrice", "number")}
          {renderInput("Billing Cycle", "billingCycle")}
          {renderInput("Start Date", "startDate", "date")}
          {renderInput("End Date", "endDate", "date")}
          {renderInput("Trial Days", "trialDays", "number")}
          <label className="inline-flex items-center gap-2 text-sm md:col-span-3">
            <input type="checkbox" name="subscriptionIsActive" checked={form.subscriptionIsActive} disabled={!editMode} onChange={onChange} />
            Subscription Active
          </label>
        </div>
      </section>

      <section className="card">
        <h3 className="mb-4 text-lg font-semibold">Features</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["attendanceModule", "Attendance Module"],
            ["feesModule", "Fees Module"],
            ["examModule", "Exam Module"],
            ["transportModule", "Transport Module"],
            ["hostelModule", "Hostel Module"],
            ["libraryModule", "Library Module"],
          ].map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name={key} checked={form[key]} disabled={!editMode} onChange={onChange} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h3 className="mb-4 text-lg font-semibold">Security</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="securityIsActive" checked={form.securityIsActive} disabled={!editMode} onChange={onChange} />
            Active
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isBlocked" checked={form.isBlocked} disabled={!editMode} onChange={onChange} />
            Blocked
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="loginAccess" checked={form.loginAccess} disabled={!editMode} onChange={onChange} />
            Login Access
          </label>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-3">
            <input
              type="checkbox"
              name="twoFactorAuthEnabled"
              checked={form.twoFactorAuthEnabled}
              disabled={!editMode}
              onChange={onChange}
            />
            Two Factor Auth Enabled
          </label>
          <div className="md:col-span-3">{renderInput("Allowed IPs (comma-separated)", "allowedIPs")}</div>
        </div>
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-900">Delete School</h4>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete this school? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-primary border-red-600 bg-red-600 hover:bg-red-700" type="button" onClick={deleteSchool}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolViewPage;
