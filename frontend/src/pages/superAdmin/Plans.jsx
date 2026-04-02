import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { superAdminOpsService } from "../../services/superAdminOpsService";

const defaultForm = {
  name: "",
  price: "",
  billingCycle: "MONTHLY",
  trialDays: 14,
  isDefault: false,
  isActive: true,
  features: {
    attendance: true,
    fees: true,
    exam: true,
    transport: false,
    hostel: false,
    library: false,
    messaging: false,
    analytics: false,
  },
  limits: {
    maxStudents: 200,
    maxTeachers: 30,
    maxStaff: 30,
  },
};

function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    try {
      setPlans(await superAdminOpsService.getPlans());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name.startsWith("features.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, features: { ...prev.features, [key]: checked } }));
      return;
    }
    if (name.startsWith("limits.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, limits: { ...prev.limits, [key]: Number(value || 0) } }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      name: plan.name || "",
      price: plan.price || 0,
      billingCycle: plan.billingCycle || "MONTHLY",
      trialDays: plan.trialDays || 0,
      isDefault: Boolean(plan.isDefault),
      isActive: Boolean(plan.isActive),
      features: { ...defaultForm.features, ...(plan.features || {}) },
      limits: { ...defaultForm.limits, ...(plan.limits || {}) },
    });
    setShowModal(true);
  };

  const submit = async () => {
    try {
      if (editingId) {
        await superAdminOpsService.updatePlan(editingId, form);
        toast.success("Plan updated");
      } else {
        await superAdminOpsService.createPlan(form);
        toast.success("Plan created");
      }
      setShowModal(false);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const remove = async (planId) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await superAdminOpsService.deletePlan(planId);
      toast.success("Plan deleted");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Plans</h2>
          <button className="btn-primary" type="button" onClick={openCreate}>
            Create Plan
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-3 pr-3">Name</th>
              <th className="py-3 pr-3">Price</th>
              <th className="py-3 pr-3">Billing</th>
              <th className="py-3 pr-3">Features</th>
              <th className="py-3 pr-3">Limits</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan._id} className="border-b last:border-0">
                <td className="py-3 pr-3 font-medium">{plan.name}</td>
                <td className="py-3 pr-3">{plan.price}</td>
                <td className="py-3 pr-3">{plan.billingCycle}</td>
                <td className="py-3 pr-3 text-xs">{Object.entries(plan.features || {}).filter(([, v]) => v).map(([k]) => k).join(", ") || "-"}</td>
                <td className="py-3 pr-3 text-xs">
                  S:{plan.limits?.maxStudents || 0} T:{plan.limits?.maxTeachers || 0} St:{plan.limits?.maxStaff || 0}
                </td>
                <td className="py-3 pr-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${plan.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <div className="flex gap-2">
                    <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => openEdit(plan)}>
                      Edit
                    </button>
                    <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => remove(plan._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!plans.length && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No plans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-5">
            <h3 className="text-xl font-semibold">{editingId ? "Edit Plan" : "Create Plan"}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input className="input" name="name" placeholder="Plan Name" value={form.name} onChange={onChange} />
              <input className="input" name="price" type="number" placeholder="Price" value={form.price} onChange={onChange} />
              <select className="input" name="billingCycle" value={form.billingCycle} onChange={onChange}>
                <option value="MONTHLY">MONTHLY</option>
                <option value="YEARLY">YEARLY</option>
              </select>
              <input className="input" name="trialDays" type="number" placeholder="Trial Days" value={form.trialDays} onChange={onChange} />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={onChange} />
                Default Plan
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} />
                Active
              </label>

              <div className="md:col-span-3">
                <p className="mb-2 text-sm font-semibold">Features</p>
                <div className="grid gap-2 sm:grid-cols-4 text-sm">
                  {Object.keys(form.features).map((k) => (
                    <label key={k} className="inline-flex items-center gap-2">
                      <input type="checkbox" name={`features.${k}`} checked={form.features[k]} onChange={onChange} />
                      {k}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3">
                <p className="mb-2 text-sm font-semibold">Limits</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input className="input" name="limits.maxStudents" type="number" placeholder="Max Students" value={form.limits.maxStudents} onChange={onChange} />
                  <input className="input" name="limits.maxTeachers" type="number" placeholder="Max Teachers" value={form.limits.maxTeachers} onChange={onChange} />
                  <input className="input" name="limits.maxStaff" type="number" placeholder="Max Staff" value={form.limits.maxStaff} onChange={onChange} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" type="button" onClick={submit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlansPage;
