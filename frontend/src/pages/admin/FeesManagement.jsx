import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Banknote,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  IndianRupee,
  Layers,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings2,
  Table2,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { adminService } from "../../services/adminService";

const DISCOUNTS = ["NONE", "FIXED", "PERCENTAGE"];
const FREQ = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"];
const FINES = ["NONE", "FIXED", "PER_DAY"];
const MODES = ["CASH", "UPI", "CARD", "NET_BANKING"];
const STATUSES = ["UNPAID", "PARTIAL", "PAID", "OVERDUE"];

const FEE_HEADS = [
  { key: "tuitionFee", label: "Tuition" },
  { key: "admissionFee", label: "Admission" },
  { key: "transportFee", label: "Transport" },
  { key: "hostelFee", label: "Hostel" },
  { key: "examFee", label: "Exam" },
  { key: "libraryFee", label: "Library" },
  { key: "sportsFee", label: "Sports" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600";

const TABS = [
  { id: "structure", label: "Structures", description: "Define packages", icon: Layers },
  { id: "assign", label: "Assignment", description: "Map to students", icon: UserPlus },
  { id: "table", label: "Ledger", description: "Balances & status", icon: Table2 },
  { id: "collect", label: "Collection", description: "Payments & receipts", icon: Banknote },
];

function sumOther(arr) {
  return (arr || []).reduce((s, o) => s + Number(o.amount || 0), 0);
}

function previewTotal(form) {
  const sub =
    Number(form.tuitionFee || 0) +
    Number(form.admissionFee || 0) +
    Number(form.transportFee || 0) +
    Number(form.hostelFee || 0) +
    Number(form.examFee || 0) +
    Number(form.libraryFee || 0) +
    Number(form.sportsFee || 0) +
    sumOther(form.otherCharges);
  let d = 0;
  const v = Number(form.discountValue || 0);
  if (form.discountType === "FIXED") d = Math.min(v, sub);
  else if (form.discountType === "PERCENTAGE") d = (sub * Math.min(v, 100)) / 100;
  return Math.max(sub - d, 0);
}

function statusBadge(status) {
  const s = status || "";
  if (s === "PAID") return "bg-emerald-100 text-emerald-800 ring-emerald-200/70";
  if (s === "PARTIAL") return "bg-amber-100 text-amber-900 ring-amber-200/70";
  if (s === "OVERDUE") return "bg-rose-100 text-rose-800 ring-rose-200/70";
  return "bg-slate-100 text-slate-700 ring-slate-200/80";
}

function SectionCard({ icon: Icon, title, subtitle, children, accent = "slate" }) {
  const bar =
    accent === "brand"
      ? "from-brand-500 to-teal-600"
      : accent === "amber"
        ? "from-amber-500 to-orange-500"
        : "from-slate-600 to-slate-800";
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
      <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${bar}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{subtitle}</p> : null}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function FeesManagementPage() {
  const [tab, setTab] = useState("structure");
  const [classes, setClasses] = useState([]);
  const [structures, setStructures] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeRows, setFeeRows] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: "", classId: "", section: "", search: "", page: 1 });

  const [structure, setStructure] = useState({
    title: "",
    academicYear: "2025-2026",
    classId: "",
    section: "",
    tuitionFee: "",
    admissionFee: "",
    transportFee: "",
    hostelFee: "",
    examFee: "",
    libraryFee: "",
    sportsFee: "",
    otherCharges: [],
    discountType: "NONE",
    discountValue: "",
    frequency: "YEARLY",
    installmentEnabled: false,
    numberOfInstallments: 1,
    dueDate: "",
    fineType: "NONE",
    fineAmount: "",
    gracePeriodDays: "",
    applicableFrom: "",
    applicableTo: "",
    status: "ACTIVE",
  });

  const [assignSingle, setAssignSingle] = useState({ studentId: "", feeStructureId: "", manualDiscount: "", dueDate: "" });
  const [bulk, setBulk] = useState({ feeStructureId: "", mode: "class", classId: "", section: "", manualDiscount: "" });

  const [collect, setCollect] = useState({
    studentFeeId: "",
    studentSearch: "",
    amount: "",
    paymentMode: "CASH",
    transactionId: "",
    paymentDate: "",
    note: "",
  });
  const [selectedRow, setSelectedRow] = useState(null);

  const [patch, setPatch] = useState({ applyManualDiscount: "", addFine: "", setFineAmount: "" });

  const loadClasses = useCallback(async () => {
    try {
      setClasses(await adminService.getClasses());
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const loadStructures = useCallback(async () => {
    try {
      setStructures(await adminService.getFeeStructures());
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const res = await adminService.getStudents({ page: 1, limit: 200, search: "" });
      setStudents(res.items || []);
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const loadFeeTable = useCallback(async () => {
    try {
      const data = await adminService.getStudentFeesList({
        page: filters.page,
        limit: 15,
        status: filters.status || undefined,
        classId: filters.classId || undefined,
        section: filters.section || undefined,
        search: filters.search || undefined,
      });
      setFeeRows(data);
    } catch (e) {
      toast.error(e.message);
    }
  }, [filters.page, filters.status, filters.classId, filters.section, filters.search]);

  useEffect(() => {
    loadClasses();
    loadStructures();
  }, [loadClasses, loadStructures]);

  useEffect(() => {
    if (tab === "table") loadFeeTable();
  }, [tab, loadFeeTable]);

  const totalPreview = useMemo(() => previewTotal(structure), [structure]);

  const ledgerSummary = useMemo(() => {
    const items = feeRows.items || [];
    const paid = items.filter((r) => (r.computedStatus || r.status) === "PAID").length;
    const overdue = items.filter((r) => (r.computedStatus || r.status) === "OVERDUE").length;
    return { onPage: items.length, paid, overdue };
  }, [feeRows.items]);

  const createStructure = async () => {
    if (!structure.classId) {
      toast.error("Select a class for this fee structure.");
      return;
    }
    if (!structure.title?.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!structure.academicYear?.trim()) {
      toast.error("Academic year is required.");
      return;
    }
    try {
      const payload = {
        ...structure,
        tuitionFee: Number(structure.tuitionFee || 0),
        admissionFee: Number(structure.admissionFee || 0),
        transportFee: Number(structure.transportFee || 0),
        hostelFee: Number(structure.hostelFee || 0),
        examFee: Number(structure.examFee || 0),
        libraryFee: Number(structure.libraryFee || 0),
        sportsFee: Number(structure.sportsFee || 0),
        discountValue: Number(structure.discountValue || 0),
        numberOfInstallments: Number(structure.numberOfInstallments || 1),
        fineAmount: Number(structure.fineAmount || 0),
        gracePeriodDays: Number(structure.gracePeriodDays || 0),
        installmentEnabled: Boolean(structure.installmentEnabled),
        dueDate: structure.dueDate || undefined,
        applicableFrom: structure.applicableFrom || undefined,
        applicableTo: structure.applicableTo || undefined,
        otherCharges: structure.otherCharges.filter((o) => o.label || Number(o.amount) > 0),
      };
      await adminService.createFeeStructure(payload);
      toast.success("Fee structure created");
      loadStructures();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const assignOne = async () => {
    try {
      await adminService.assignFees({
        studentId: assignSingle.studentId,
        feeStructureId: assignSingle.feeStructureId,
        manualDiscount: Number(assignSingle.manualDiscount || 0),
        dueDate: assignSingle.dueDate || undefined,
      });
      toast.success("Assigned");
      setAssignSingle((p) => ({ ...p, studentId: "" }));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const assignBulkRun = async () => {
    try {
      const res = await adminService.assignFeesBulk({
        feeStructureId: bulk.feeStructureId,
        mode: bulk.mode,
        classId: bulk.classId || undefined,
        section: bulk.section || undefined,
        manualDiscount: Number(bulk.manualDiscount || 0),
      });
      toast.success(`Assigned: ${res.created}, skipped: ${res.skipped}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const collectFee = async () => {
    try {
      const payment = await adminService.collectFee({
        studentFeeId: collect.studentFeeId,
        amount: Number(collect.amount),
        paymentMode: collect.paymentMode,
        transactionId: collect.transactionId,
        paymentDate: collect.paymentDate || undefined,
        note: collect.note,
      });
      toast.success(`Receipt ${payment.receiptNumber || ""}`);
      const blob = await adminService.downloadFeeReceipt(payment._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${payment.receiptNumber || payment._id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      loadFeeTable();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openRow = (row) => {
    setSelectedRow(row);
    setCollect((c) => ({
      ...c,
      studentFeeId: row._id,
      amount: String(
        Math.max(
          Number(row.finalAmount || row.amount || 0) +
            Number(row.computedFineAmount ?? row.fineAmount ?? 0) -
            Number(row.paidAmount || 0),
          0
        ).toFixed(2)
      ),
    }));
    setPatch({ applyManualDiscount: "", addFine: "", setFineAmount: "" });
  };

  const savePatch = async () => {
    if (!selectedRow) return;
    try {
      await adminService.patchStudentFee(selectedRow._id, {
        applyManualDiscount: patch.applyManualDiscount ? Number(patch.applyManualDiscount) : undefined,
        addFine: patch.addFine ? Number(patch.addFine) : undefined,
        setFineAmount: patch.setFineAmount !== "" ? Number(patch.setFineAmount) : undefined,
      });
      toast.success("Updated");
      setSelectedRow(null);
      loadFeeTable();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const sendRemind = async () => {
    if (!selectedRow) return;
    try {
      await adminService.sendFeeReminder(selectedRow._id);
      toast.success("Reminder sent to student notifications");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const exportCsv = async () => {
    try {
      const blob = await adminService.exportStudentFeesCsv({
        status: filters.status || undefined,
        classId: filters.classId || undefined,
        section: filters.section || undefined,
        search: filters.search || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student-fees.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const addOtherCharge = () => {
    setStructure((p) => ({ ...p, otherCharges: [...p.otherCharges, { label: "", amount: "" }] }));
  };

  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:from-brand-500 hover:to-brand-600 disabled:opacity-50";
  const btnSecondary =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50";

  return (
    <div className="w-full max-w-7xl space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 px-6 py-8 text-white shadow-xl shadow-slate-900/20 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-64 rounded-full bg-amber-400/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-teal-200/90">
              <Wallet className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Finance
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Fees & billing</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Configure structures, assign to students, monitor balances, and record payments with receipts—aligned to your
              school&apos;s academic setup.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-teal-200/80">Active packages</p>
              <p className="text-2xl font-bold tabular-nums">{structures.filter((s) => s.status === "ACTIVE").length}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-teal-200/80">Classes</p>
              <p className="text-2xl font-bold tabular-nums">{classes.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm ring-1 ring-slate-100/80 sm:p-2">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {TABS.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                if (id === "assign") loadStudents();
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition sm:px-4 ${
                tab === id
                  ? "bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md shadow-brand-600/25"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  tab === id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{label}</span>
                <span className={`mt-0.5 block text-xs ${tab === id ? "text-white/85" : "text-slate-500"}`}>{description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {tab === "structure" && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
            <div className="space-y-6 xl:col-span-2">
              <SectionCard
                icon={Building2}
                title="Structure identity"
                subtitle="Title, academic year, class scope. Blank section applies to all sections in that class."
                accent="brand"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="fee-title">
                      Package title
                    </label>
                    <input
                      id="fee-title"
                      className={inputClass}
                      placeholder="e.g. Annual fee 2025–26"
                      value={structure.title}
                      onChange={(e) => setStructure((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="fee-year">
                      Academic year
                    </label>
                    <input
                      id="fee-year"
                      className={inputClass}
                      placeholder="2025-2026"
                      value={structure.academicYear}
                      onChange={(e) => setStructure((p) => ({ ...p, academicYear: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="fee-class">
                      Class
                    </label>
                    <select
                      id="fee-class"
                      className={inputClass}
                      required
                      value={structure.classId}
                      onChange={(e) => setStructure((p) => ({ ...p, classId: e.target.value }))}
                    >
                      <option value="">Select class</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} — {c.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="fee-section">
                      Section filter (optional)
                    </label>
                    <input
                      id="fee-section"
                      className={inputClass}
                      placeholder="Exact section code, or leave empty for all"
                      value={structure.section}
                      onChange={(e) => setStructure((p) => ({ ...p, section: e.target.value }))}
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={IndianRupee} title="Fee components" subtitle="Enter amounts for each head. Currency in INR." accent="amber">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {FEE_HEADS.map(({ key, label }) => (
                    <div key={key}>
                      <label className={labelClass} htmlFor={key}>
                        {label} (₹)
                      </label>
                      <input
                        id={key}
                        className={inputClass}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0"
                        value={structure[key]}
                        onChange={(e) => setStructure((p) => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Other charges</span>
                    <button type="button" className={`${btnSecondary} py-1.5 pl-2 pr-3 text-xs`} onClick={addOtherCharge}>
                      <Plus className="h-3.5 w-3.5" />
                      Add line
                    </button>
                  </div>
                  <div className="space-y-3">
                    {structure.otherCharges.map((o, i) => (
                      <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <label className={labelClass}>Label</label>
                          <input
                            className={inputClass}
                            placeholder="Description"
                            value={o.label}
                            onChange={(e) => {
                              const next = [...structure.otherCharges];
                              next[i] = { ...next[i], label: e.target.value };
                              setStructure((p) => ({ ...p, otherCharges: next }));
                            }}
                          />
                        </div>
                        <div className="w-full sm:w-36">
                          <label className={labelClass}>Amount</label>
                          <input
                            className={inputClass}
                            type="number"
                            placeholder="₹"
                            value={o.amount}
                            onChange={(e) => {
                              const next = [...structure.otherCharges];
                              next[i] = { ...next[i], amount: e.target.value };
                              setStructure((p) => ({ ...p, otherCharges: next }));
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={Settings2} title="Discounts, schedule & fines" subtitle="Frequency, installments, due dates, and late fee rules." accent="slate">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelClass}>Discount type</label>
                    <select className={inputClass} value={structure.discountType} onChange={(e) => setStructure((p) => ({ ...p, discountType: e.target.value }))}>
                      {DISCOUNTS.map((d) => (
                        <option key={d} value={d}>
                          {d === "NONE" ? "No discount" : d === "FIXED" ? "Fixed amount" : "Percentage"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Discount value</label>
                    <input className={inputClass} type="number" placeholder="0" value={structure.discountValue} onChange={(e) => setStructure((p) => ({ ...p, discountValue: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Billing frequency</label>
                    <select className={inputClass} value={structure.frequency} onChange={(e) => setStructure((p) => ({ ...p, frequency: e.target.value }))}>
                      {FREQ.map((d) => (
                        <option key={d} value={d}>
                          {d.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 lg:col-span-3">
                    <input
                      id="inst"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={structure.installmentEnabled}
                      onChange={(e) => setStructure((p) => ({ ...p, installmentEnabled: e.target.checked }))}
                    />
                    <label htmlFor="inst" className="text-sm font-medium text-slate-800">
                      Enable installments
                    </label>
                  </div>
                  <div>
                    <label className={labelClass}>Number of installments</label>
                    <input className={inputClass} type="number" min={1} value={structure.numberOfInstallments} onChange={(e) => setStructure((p) => ({ ...p, numberOfInstallments: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Primary due date</label>
                    <input className={inputClass} type="date" value={structure.dueDate} onChange={(e) => setStructure((p) => ({ ...p, dueDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Late fine type</label>
                    <select className={inputClass} value={structure.fineType} onChange={(e) => setStructure((p) => ({ ...p, fineType: e.target.value }))}>
                      {FINES.map((d) => (
                        <option key={d} value={d}>
                          {d.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Fine amount (₹)</label>
                    <input className={inputClass} type="number" value={structure.fineAmount} onChange={(e) => setStructure((p) => ({ ...p, fineAmount: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Grace period (days)</label>
                    <input className={inputClass} type="number" value={structure.gracePeriodDays} onChange={(e) => setStructure((p) => ({ ...p, gracePeriodDays: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Applicable from</label>
                    <input className={inputClass} type="date" value={structure.applicableFrom} onChange={(e) => setStructure((p) => ({ ...p, applicableFrom: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Applicable to</label>
                    <input className={inputClass} type="date" value={structure.applicableTo} onChange={(e) => setStructure((p) => ({ ...p, applicableTo: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select className={inputClass} value={structure.status} onChange={(e) => setStructure((p) => ({ ...p, status: e.target.value }))}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <div className="sticky top-4 overflow-hidden rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50 via-white to-teal-50/50 p-6 shadow-lg ring-1 ring-brand-100/60">
                <div className="flex items-center gap-2 text-brand-800">
                  <Receipt className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  <span className="text-xs font-bold uppercase tracking-wider">Preview total</span>
                </div>
                <p className="mt-3 text-3xl font-bold tabular-nums text-slate-900">₹{totalPreview.toFixed(2)}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">After structure discount. Manual per-student discounts are applied at assignment.</p>
                <button type="button" className={`${btnPrimary} mt-6 w-full`} onClick={createStructure}>
                  Save fee structure
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <SectionCard icon={Layers} title="Saved packages" subtitle="Structures available for assignment. Refresh after changes." accent="brand">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button type="button" className={btnSecondary} onClick={loadStructures}>
                <RefreshCw className="h-4 w-4" />
                Refresh list
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {structures.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:border-brand-200/60 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ring-1 ${
                        item.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 ring-emerald-200/70" : "bg-slate-100 text-slate-600 ring-slate-200/80"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {item.academicYear} · Class {item.classId?.name}-{item.classId?.section}
                    {item.section ? ` · Section: ${item.section}` : " · All sections"}
                  </p>
                  <p className="mt-3 text-lg font-bold tabular-nums text-brand-700">₹{item.totalAmount ?? item.amount}</p>
                </div>
              ))}
            </div>
            {!structures.length ? <p className="py-8 text-center text-sm text-slate-500">No structures yet. Create one using the form.</p> : null}
          </SectionCard>
        </div>
      )}

      {tab === "assign" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon={Users} title="Assign to one student" subtitle="Pick a learner and package. Optional extra discount and due date." accent="brand">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Student</label>
                <select className={inputClass} value={assignSingle.studentId} onChange={(e) => setAssignSingle((p) => ({ ...p, studentId: e.target.value }))}>
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.userId?.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fee structure</label>
                <select className={inputClass} value={assignSingle.feeStructureId} onChange={(e) => setAssignSingle((p) => ({ ...p, feeStructureId: e.target.value }))}>
                  <option value="">Select package</option>
                  {structures.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title} — {s.academicYear} — ₹{s.totalAmount ?? s.amount}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Extra manual discount (₹)</label>
                <input className={inputClass} type="number" value={assignSingle.manualDiscount} onChange={(e) => setAssignSingle((p) => ({ ...p, manualDiscount: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Due date</label>
                <input className={inputClass} type="date" value={assignSingle.dueDate} onChange={(e) => setAssignSingle((p) => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <button type="button" className={btnPrimary} onClick={assignOne}>
                Assign fees
              </button>
            </div>
          </SectionCard>
          <SectionCard icon={UserPlus} title="Bulk assignment" subtitle="Apply a structure to a whole class or class + section." accent="slate">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Fee structure</label>
                <select className={inputClass} value={bulk.feeStructureId} onChange={(e) => setBulk((p) => ({ ...p, feeStructureId: e.target.value }))}>
                  <option value="">Select package</option>
                  {structures.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Mode</label>
                <select className={inputClass} value={bulk.mode} onChange={(e) => setBulk((p) => ({ ...p, mode: e.target.value }))}>
                  <option value="class">Whole class (from structure)</option>
                  <option value="section">Class + section</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Class filter</label>
                <select className={inputClass} value={bulk.classId} onChange={(e) => setBulk((p) => ({ ...p, classId: e.target.value }))}>
                  <option value="">Optional</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Section (for section mode)</label>
                <input className={inputClass} value={bulk.section} onChange={(e) => setBulk((p) => ({ ...p, section: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Manual discount each (₹)</label>
                <input className={inputClass} type="number" value={bulk.manualDiscount} onChange={(e) => setBulk((p) => ({ ...p, manualDiscount: e.target.value }))} />
              </div>
              <button type="button" className={btnPrimary} onClick={assignBulkRun}>
                Run bulk assign
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "table" && (
        <SectionCard icon={Table2} title="Student fee ledger" subtitle="Filter, export, and open a row for adjustments or collection." accent="brand">
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex items-center gap-2 text-slate-600 sm:mr-2">
              <Filter className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide">Filters</span>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-2">
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}>
                  <option value="">All</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className={labelClass}>Class</label>
                <select className={inputClass} value={filters.classId} onChange={(e) => setFilters((p) => ({ ...p, classId: e.target.value, page: 1 }))}>
                  <option value="">All classes</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}-{c.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className={labelClass}>Section</label>
                <input className={inputClass} value={filters.section} onChange={(e) => setFilters((p) => ({ ...p, section: e.target.value, page: 1 }))} />
              </div>
              <div className="lg:col-span-4">
                <label className={labelClass}>Search student</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    placeholder="Name…"
                    value={filters.search}
                    onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:col-span-2">
                <button type="button" className={btnPrimary} onClick={loadFeeTable}>
                  Apply
                </button>
                <button type="button" className={btnSecondary} onClick={exportCsv}>
                  <Download className="h-4 w-4" />
                  CSV
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 ring-1 ring-slate-200/80">
              On this page: {ledgerSummary.onPage}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800 ring-1 ring-emerald-200/70">
              Paid: {ledgerSummary.paid}
            </span>
            <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-800 ring-1 ring-rose-200/70">
              Overdue: {ledgerSummary.overdue}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/90 shadow-sm ring-1 ring-slate-100/80">
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3 text-right">Final</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Due</th>
                    <th className="px-4 py-3 text-right">Fine</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Due date</th>
                    <th className="px-4 py-3 text-right"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(feeRows.items || []).map((r) => {
                    const rem = Math.max(
                      Number(r.finalAmount || r.amount || 0) + Number(r.computedFineAmount ?? r.fineAmount ?? 0) - Number(r.paidAmount || 0),
                      0
                    );
                    const st = r.computedStatus || r.status;
                    return (
                      <tr key={r._id} className="transition hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">{r.studentId?.userId?.name}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {r.classId?.name}-{r.studentId?.section}
                        </td>
                        <td className="max-w-[140px] truncate px-4 py-3 text-slate-600" title={r.feeStructureId?.title}>
                          {r.feeStructureId?.title}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">₹{Number(r.finalAmount || r.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-700">₹{Number(r.paidAmount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-800">₹{rem.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">₹{Number(r.computedFineAmount ?? r.fineAmount ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${statusBadge(st)}`}>{st}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" className="text-sm font-bold text-brand-600 hover:text-brand-800" onClick={() => openRow(r)}>
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Page <span className="font-bold text-slate-900">{feeRows.page}</span> of{" "}
              <span className="font-bold text-slate-900">{feeRows.totalPages || 1}</span>
              <span className="text-slate-400"> · </span>
              <span className="font-semibold text-slate-800">{feeRows.total}</span> records
            </p>
            <div className="flex gap-2">
              <button type="button" className={btnSecondary} disabled={filters.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                className={btnSecondary}
                disabled={filters.page >= (feeRows.totalPages || 1)}
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {tab === "collect" && (
        <SectionCard icon={Banknote} title="Record payment" subtitle="Use a fee record ID from the ledger, or open Manage on a row to pre-fill." accent="amber">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Student fee record ID</label>
              <input
                className={inputClass}
                placeholder="Fee assignment ID"
                value={collect.studentFeeId}
                onChange={(e) => setCollect((p) => ({ ...p, studentFeeId: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Amount (₹)</label>
              <input className={inputClass} type="number" value={collect.amount} onChange={(e) => setCollect((p) => ({ ...p, amount: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Payment mode</label>
              <select className={inputClass} value={collect.paymentMode} onChange={(e) => setCollect((p) => ({ ...p, paymentMode: e.target.value }))}>
                {MODES.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Transaction ID</label>
              <input className={inputClass} placeholder="For UPI / card / net banking" value={collect.transactionId} onChange={(e) => setCollect((p) => ({ ...p, transactionId: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Payment date</label>
              <input className={inputClass} type="date" value={collect.paymentDate} onChange={(e) => setCollect((p) => ({ ...p, paymentDate: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Internal note</label>
              <input className={inputClass} placeholder="Optional" value={collect.note} onChange={(e) => setCollect((p) => ({ ...p, note: e.target.value }))} />
            </div>
          </div>
          <button type="button" className={`${btnPrimary} mt-6`} onClick={collectFee}>
            <Receipt className="h-4 w-4" />
            Collect & download receipt
          </button>
        </SectionCard>
      )}

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-900/5">
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-brand-50/30 px-6 py-4">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900">Fee record</h3>
                <p className="text-sm font-medium text-brand-700">{selectedRow.feeStructureId?.title}</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close"
                onClick={() => setSelectedRow(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm">
                <p className="font-semibold text-slate-900">{selectedRow.studentId?.userId?.name}</p>
                <p className="mt-1 text-slate-600">
                  Outstanding:{" "}
                  <span className="font-bold tabular-nums text-amber-800">
                    ₹
                    {Math.max(
                      Number(selectedRow.finalAmount || 0) +
                        Number(selectedRow.computedFineAmount ?? selectedRow.fineAmount ?? 0) -
                        Number(selectedRow.paidAmount || 0),
                      0
                    ).toFixed(2)}
                  </span>
                </p>
              </div>
              <div>
                <label className={labelClass}>Apply extra discount (₹)</label>
                <input className={inputClass} type="number" value={patch.applyManualDiscount} onChange={(e) => setPatch((p) => ({ ...p, applyManualDiscount: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Add fine (₹)</label>
                <input className={inputClass} type="number" value={patch.addFine} onChange={(e) => setPatch((p) => ({ ...p, addFine: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Or set fine total (₹)</label>
                <input className={inputClass} type="number" value={patch.setFineAmount} onChange={(e) => setPatch((p) => ({ ...p, setFineAmount: e.target.value }))} />
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button type="button" className={btnPrimary} onClick={savePatch}>
                  Save adjustments
                </button>
                <button type="button" className={btnSecondary} onClick={sendRemind}>
                  Send reminder
                </button>
                <button type="button" className={btnSecondary} onClick={() => setSelectedRow(null)}>
                  Close
                </button>
              </div>
              <button
                type="button"
                className={`${btnPrimary} w-full`}
                onClick={() => {
                  const row = selectedRow;
                  const rem = Math.max(
                    Number(row.finalAmount || row.amount || 0) + Number(row.computedFineAmount ?? row.fineAmount ?? 0) - Number(row.paidAmount || 0),
                    0
                  );
                  setCollect((c) => ({
                    ...c,
                    studentFeeId: row._id,
                    amount: rem.toFixed(2),
                  }));
                  setTab("collect");
                  setSelectedRow(null);
                }}
              >
                Go to collection (pre-filled)
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeesManagementPage;
