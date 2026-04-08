import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Bus, CheckCircle2, Save } from "lucide-react";
import { adminService } from "../../services/adminService";
import {
  defaultTransportForm,
  getTransportItemMeta,
  getTransportItemTitle,
  itemLabelForOption,
  normalizeItemToForm,
  sanitizeTransportPayload,
  transportModuleMap,
  transportModules,
  transportSourceLabels,
} from "../../utils/transportConfig";

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

const sourceLoaders = {
  students: async () => {
    const data = await adminService.getStudents({ page: 1, limit: 100 });
    return data.items || [];
  },
  vehicles: async () => (await adminService.listTransportModule("vehicles", { page: 1, limit: 100 })).items || [],
  drivers: async () => (await adminService.listTransportModule("drivers", { page: 1, limit: 100 })).items || [],
  conductors: async () => (await adminService.listTransportModule("conductors", { page: 1, limit: 100 })).items || [],
  routes: async () => (await adminService.listTransportModule("routes", { page: 1, limit: 100 })).items || [],
  stops: async () => (await adminService.listTransportModule("stops", { page: 1, limit: 100 })).items || [],
};

const emptySources = {
  students: [],
  vehicles: [],
  drivers: [],
  conductors: [],
  routes: [],
  stops: [],
};

function TransportManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleKey = searchParams.get("module") || transportModules[0].key;
  const activeModule = transportModuleMap[moduleKey] || transportModules[0];
  const editingItemId = location.state?.itemId || null;

  const [form, setForm] = useState(defaultTransportForm(activeModule.key));
  const [sources, setSources] = useState(emptySources);
  const [records, setRecords] = useState([]);
  const [moduleTotals, setModuleTotals] = useState({});
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const fetchSourcesAndStats = async () => {
    const sourceKeys = Object.keys(sourceLoaders);
    const sourceResults = await Promise.all(sourceKeys.map((key) => sourceLoaders[key]()));
    setSources(
      sourceKeys.reduce((acc, key, index) => {
        acc[key] = sourceResults[index];
        return acc;
      }, { ...emptySources })
    );

    const totals = await Promise.all(
      transportModules.map(async (module) => {
        const data = await adminService.listTransportModule(module.key, { page: 1, limit: 1 });
        return [module.key, data.total || 0];
      })
    );
    setModuleTotals(Object.fromEntries(totals));
  };

  const fetchCurrentModuleRecords = async (targetModuleKey = activeModule.key) => {
    const data = await adminService.listTransportModule(targetModuleKey, { page: 1, limit: 5 });
    setRecords(data.items || []);
    setModuleTotals((prev) => ({ ...prev, [targetModuleKey]: data.total || 0 }));
  };

  useEffect(() => {
    const bootstrap = async () => {
      setBootstrapLoading(true);
      try {
        await fetchSourcesAndStats();
        await fetchCurrentModuleRecords(activeModule.key);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setBootstrapLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (bootstrapLoading) return;
    setForm(defaultTransportForm(activeModule.key));
    setLoadingRecord(false);
    fetchCurrentModuleRecords(activeModule.key).catch((error) => toast.error(error.message));
  }, [activeModule.key, bootstrapLoading]);

  useEffect(() => {
    const loadEditRecord = async () => {
      if (!editingItemId || location.state?.moduleKey !== activeModule.key) return;
      setLoadingRecord(true);
      try {
        const item = await adminService.getTransportModule(activeModule.key, editingItemId);
        setForm(normalizeItemToForm(activeModule.key, item));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoadingRecord(false);
      }
    };

    loadEditRecord();
  }, [activeModule.key, editingItemId, location.state]);

  const completion = useMemo(() => {
    const requiredFields = activeModule.fields.filter((field) => field.required);
    if (!requiredFields.length) return 100;

    const filled = requiredFields.filter((field) => {
      const value = form[field.name];
      return field.type === "checkbox" ? Boolean(value) : String(value || "").trim().length > 0;
    }).length;

    return Math.round((filled / requiredFields.length) * 100);
  }, [activeModule.fields, form]);

  const selectedItemMeta = useMemo(() => {
    const previewItem = activeModule.fields.reduce((acc, field) => {
      let value = form[field.name];
      if (field.optionSource) {
        const options = sources[field.optionSource] || [];
        const match = options.find((item) => item._id === value);
        acc[field.name] = match || null;
      } else {
        acc[field.name] = value;
      }
      return acc;
    }, {});

    return getTransportItemMeta(activeModule.key, previewItem);
  }, [activeModule, form, sources]);

  const handleModuleChange = (nextModuleKey) => {
    setSearchParams({ module: nextModuleKey });
    navigate(`/admin/transport/create?module=${nextModuleKey}`, { replace: true });
  };

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "routeId" && activeModule.key === "studentAssignments" ? { stopId: "" } : {}),
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = sanitizeTransportPayload(activeModule.key, form);
      if (editingItemId && location.state?.moduleKey === activeModule.key) {
        await adminService.updateTransportModule(activeModule.key, editingItemId, payload);
        toast.success(`${activeModule.label} updated`);
      } else {
        await adminService.createTransportModule(activeModule.key, payload);
        toast.success(`${activeModule.label} created`);
      }

      setForm(defaultTransportForm(activeModule.key));
      navigate(`/admin/transport/create?module=${activeModule.key}`, { replace: true });
      await fetchCurrentModuleRecords(activeModule.key);
      await fetchSourcesAndStats();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const stopOptions =
    activeModule.key === "studentAssignments" && form.routeId
      ? sources.stops.filter((stop) => stop.routeId?._id === form.routeId || stop.routeId === form.routeId)
      : sources.stops;

  const renderField = (field) => {
    const value = form[field.name];
    const inputClasses = "input";
    const options =
      field.optionSource === "stops"
        ? stopOptions
        : field.optionSource
          ? sources[field.optionSource] || []
          : field.options || [];

    if (field.type === "textarea") {
      return (
        <textarea
          className={`${inputClasses} min-h-[112px] resize-y`}
          name={field.name}
          value={value}
          placeholder={field.placeholder}
          onChange={onChange}
          required={field.required}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select className={inputClasses} name={field.name} value={value} onChange={onChange} required={field.required}>
          <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
          {options.map((option) => (
            <option key={option._id || option.value} value={option._id || option.value}>
              {option.label || itemLabelForOption(field.optionSource, option)}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" name={field.name} checked={Boolean(value)} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          Enable for this transport record
        </label>
      );
    }

    return (
      <input
        className={inputClasses}
        type={field.type}
        name={field.name}
        value={value}
        placeholder={field.placeholder}
        onChange={onChange}
        required={field.required}
        min={field.min}
        max={field.max}
        step={field.step}
      />
    );
  };

  if (bootstrapLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)]">
        Loading transport management workspace...
      </div>
    );
  }

  const ActiveIcon = activeModule.icon;
  const createMode = editingItemId && location.state?.moduleKey === activeModule.key ? "Update" : "Create";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
        <div className={`border-b border-slate-100 bg-gradient-to-r ${activeModule.accent} px-5 py-6 text-white sm:px-6`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100">Transport operations</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {createMode} {activeModule.singular}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-100">{activeModule.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[380px]">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cyan-100">Completion</p>
                <p className="mt-1 text-3xl font-bold">{completion}%</p>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-white transition-all" style={{ width: `${completion}%` }} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cyan-100">Records</p>
                <p className="mt-1 text-3xl font-bold">{moduleTotals[activeModule.key] || 0}</p>
                <p className="mt-2 text-xs text-slate-100">Active module entries</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cyan-100">Dependencies</p>
                <p className="mt-1 text-3xl font-bold">
                  {Object.keys(sources).reduce((sum, key) => sum + (sources[key]?.length || 0), 0)}
                </p>
                <p className="mt-2 text-xs text-slate-100">Linked options loaded</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {transportModules.map((module) => {
              const Icon = module.icon;
              const active = module.key === activeModule.key;
              return (
                <button
                  key={module.key}
                  type="button"
                  onClick={() => handleModuleChange(module.key)}
                  className={`inline-flex min-w-max items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-900/10"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {module.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {moduleTotals[module.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.25fr,0.75fr]">
          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <ActiveIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">{activeModule.label} setup</h2>
                <p className="text-sm text-slate-500">Fill the required fields first, then enrich the record with operational detail.</p>
              </div>
            </div>

            {loadingRecord ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Loading record for editing...</div> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {activeModule.fields.map((field) => (
                <div key={field.name} className={field.type === "textarea" || field.type === "checkbox" ? "sm:col-span-2" : ""}>
                  <Field
                    label={field.label}
                    required={field.required}
                    hint={field.optionSource ? `Select from loaded ${transportSourceLabels[field.optionSource] || "records"}.` : ""}
                  >
                    {renderField(field)}
                  </Field>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                  <Bus className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Live preview</h2>
                  <p className="text-sm text-slate-500">Review the main identity and operational attributes before saving.</p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                    <ActiveIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">Transport record</p>
                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                      {getTransportItemTitle(activeModule.key, activeModule.fields.reduce((acc, field) => ({ ...acc, [field.name]: field.optionSource ? (sources[field.optionSource] || []).find((option) => option._id === form[field.name]) || null : form[field.name] }), {}))}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{activeModule.description}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {selectedItemMeta.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{value || "Pending"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800">
                <CheckCircle2 className="h-4 w-4" />
                Create and directory tabs keep transport operations organized like the other admin modules.
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-950">Recent {activeModule.label.toLowerCase()}</h3>
                  <p className="text-sm text-slate-500">Quick visibility into the latest saved records for this transport area.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => navigate(`/admin/transport/registered?module=${activeModule.key}`)}
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {!records.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No {activeModule.label.toLowerCase()} saved yet.
                  </div>
                ) : (
                  records.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => navigate(`/admin/transport/create?module=${activeModule.key}`, { state: { moduleKey: activeModule.key, itemId: item._id } })}
                      className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-brand-200 hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{getTransportItemTitle(activeModule.key, item)}</p>
                        <p className="mt-1 text-xs text-slate-500">{getTransportItemMeta(activeModule.key, item).map((entry) => entry[1]).filter(Boolean).slice(0, 2).join(" • ")}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-slate-500">Edit</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:justify-between sm:px-6">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            onClick={() => navigate(`/admin/transport/registered?module=${activeModule.key}`)}
          >
            <Bus className="h-4 w-4" />
            Open transport directory
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : `${createMode} ${activeModule.singular}`}
          </button>
        </div>
      </section>
    </form>
  );
}

export default TransportManagementPage;
