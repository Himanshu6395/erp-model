import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
  CreditCard,
  Layers,
  Pencil,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Loader from "../../components/Loader";
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

const FEATURE_LABELS = {
  attendance: "Attendance",
  fees: "Fees",
  exam: "Exams",
  transport: "Transport",
  hostel: "Hostel",
  library: "Library",
  messaging: "Messaging",
  analytics: "Analytics",
};

function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    setLoading(true);
    try {
      setPlans(await superAdminOpsService.getPlans());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const active = plans.filter((p) => p.isActive).length;
    return { total: plans.length, active };
  }, [plans]);

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
    if (!window.confirm("Delete this plan? Subscriptions using it may be affected.")) return;
    try {
      await superAdminOpsService.deletePlan(planId);
      toast.success("Plan deleted");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader text="Loading plans..." />;

  return (
    <div className="w-full max-w-7xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-violet-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-indigo-900/20 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-100/90">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Billing catalog
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Subscription plans</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
              Define monetization tiers: feature flags, seat limits, and billing cadence. Plans attach to school subscriptions
              from the Subscriptions workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/25 transition hover:from-amber-300 hover:to-orange-400"
          >
            <Layers className="h-4 w-4" aria-hidden />
            New plan
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <Layers className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Plans in catalog</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <Check className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active for new assignments</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-800">{summary.active}</p>
            </div>
          </div>
        </div>
      </div>

      {!plans.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center shadow-inner">
          <CreditCard className="mx-auto h-12 w-12 text-slate-300" strokeWidth={1.25} aria-hidden />
          <p className="mt-4 font-semibold text-slate-800">No plans yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first plan to power school subscriptions.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-700"
          >
            Create plan
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, idx) => {
            const enabledFeatures = Object.entries(plan.features || {}).filter(([, v]) => v);
            const accent = ["from-violet-500 to-indigo-600", "from-cyan-500 to-brand-600", "from-rose-500 to-pink-600", "from-amber-500 to-orange-600", "from-emerald-500 to-teal-600", "from-fuchsia-500 to-purple-600"][idx % 6];
            return (
              <article
                key={plan._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-100/90 transition hover:shadow-lg hover:shadow-violet-500/[0.07]"
              >
                <div className={`h-1.5 bg-gradient-to-r ${accent}`} aria-hidden />
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                      <div className="mt-2 flex flex-wrap items-baseline gap-2">
                        <span className="text-2xl font-bold tabular-nums text-slate-900">₹{Number(plan.price || 0).toLocaleString()}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200/80">
                          {plan.billingCycle}
                        </span>
                        {plan.isDefault ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 ring-1 ring-amber-200/60">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-500">Trial: {plan.trialDays ?? 0} days</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                        plan.isActive
                          ? "bg-emerald-100 text-emerald-800 ring-emerald-200/60"
                          : "bg-slate-100 text-slate-600 ring-slate-200/80"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {enabledFeatures.length ? (
                      enabledFeatures.map(([k]) => (
                        <span
                          key={k}
                          className="rounded-md bg-violet-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-violet-800 ring-1 ring-violet-100"
                        >
                          {FEATURE_LABELS[k] || k}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No features enabled</span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                    <Users className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    <span className="font-medium tabular-nums">
                      Students {plan.limits?.maxStudents ?? 0}
                      <span className="text-slate-300"> · </span>
                      Teachers {plan.limits?.maxTeachers ?? 0}
                      <span className="text-slate-300"> · </span>
                      Staff {plan.limits?.maxStaff ?? 0}
                    </span>
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/50"
                    >
                      <Pencil className="h-4 w-4 text-brand-600" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(plan._id)}
                      className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100/80"
                      aria-label={`Delete ${plan.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            className="max-h-[min(90vh,720px)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-indigo-900/20 ring-1 ring-slate-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-modal-title"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-violet-600 via-brand-600 to-indigo-700 px-6 py-5 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">Billing</p>
                <h3 id="plan-modal-title" className="mt-1 text-xl font-bold">
                  {editingId ? "Edit plan" : "Create plan"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-white/30 bg-white/10 p-2 text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-3">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Plan name</label>
                  <input className="input w-full rounded-xl py-2.5" name="name" placeholder="e.g. Premium" value={form.name} onChange={onChange} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Price</label>
                  <input className="input w-full rounded-xl py-2.5" name="price" type="number" placeholder="0" value={form.price} onChange={onChange} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Billing cycle</label>
                  <select className="input w-full rounded-xl py-2.5" name="billingCycle" value={form.billingCycle} onChange={onChange}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Trial days</label>
                  <input className="input w-full rounded-xl py-2.5" name="trialDays" type="number" value={form.trialDays} onChange={onChange} />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 md:col-span-1">
                  <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  <span className="text-sm font-medium text-slate-800">Default plan</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 md:col-span-1">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                  <span className="text-sm font-medium text-slate-800">Active</span>
                </label>
              </div>

              <div>
                <p className="mb-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Module features</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.keys(form.features).map((k) => (
                    <label
                      key={k}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/30"
                    >
                      <input type="checkbox" name={`features.${k}`} checked={form.features[k]} onChange={onChange} className="rounded border-slate-300 text-brand-600" />
                      {FEATURE_LABELS[k] || k}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Capacity limits</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Max students</label>
                    <input
                      className="input w-full rounded-xl py-2.5"
                      name="limits.maxStudents"
                      type="number"
                      value={form.limits.maxStudents}
                      onChange={onChange}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Max teachers</label>
                    <input
                      className="input w-full rounded-xl py-2.5"
                      name="limits.maxTeachers"
                      type="number"
                      value={form.limits.maxTeachers}
                      onChange={onChange}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Max staff</label>
                    <input
                      className="input w-full rounded-xl py-2.5"
                      name="limits.maxStaff"
                      type="number"
                      value={form.limits.maxStaff}
                      onChange={onChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-slate-50/90 px-6 py-4 sm:px-8">
              <button type="button" className="btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary rounded-xl px-6 py-2.5 text-sm font-bold shadow-md" onClick={submit}>
                Save plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlansPage;
