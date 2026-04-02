import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { adminService } from "../../services/adminService";

const DISCOUNTS = ["NONE", "FIXED", "PERCENTAGE"];
const FREQ = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"];
const FINES = ["NONE", "FIXED", "PER_DAY"];
const MODES = ["CASH", "UPI", "CARD", "NET_BANKING"];
const STATUSES = ["UNPAID", "PARTIAL", "PAID", "OVERDUE"];

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
  if (s === "PAID") return "bg-emerald-100 text-emerald-800";
  if (s === "PARTIAL") return "bg-amber-100 text-amber-900";
  if (s === "OVERDUE") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {["structure", "assign", "table", "collect"].map((t) => (
          <button
            key={t}
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => {
              setTab(t);
              if (t === "assign") loadStudents();
            }}
          >
            {t === "structure" && "Fee structure"}
            {t === "assign" && "Assign fees"}
            {t === "table" && "Student fees"}
            {t === "collect" && "Collect payment"}
          </button>
        ))}
      </div>

      {tab === "structure" && (
        <FormCard
          title="Create fee structure (class-based)"
          subtitle="Totals include all heads minus structure discount. One active structure per class + academic year + section (blank section = all sections)."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input className="input" placeholder="Title *" value={structure.title} onChange={(e) => setStructure((p) => ({ ...p, title: e.target.value }))} />
            <input className="input" placeholder="Academic year * (e.g. 2025-2026)" value={structure.academicYear} onChange={(e) => setStructure((p) => ({ ...p, academicYear: e.target.value }))} />
            <select
              className="input"
              required
              value={structure.classId}
              onChange={(e) => setStructure((p) => ({ ...p, classId: e.target.value }))}
            >
              <option value="">Class *</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — {c.section}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Section (optional, exact match)" value={structure.section} onChange={(e) => setStructure((p) => ({ ...p, section: e.target.value }))} />
            {["tuitionFee", "admissionFee", "transportFee", "hostelFee", "examFee", "libraryFee", "sportsFee"].map((f) => (
              <input
                key={f}
                className="input"
                type="number"
                placeholder={f.replace(/([A-Z])/g, " $1").trim()}
                value={structure[f]}
                onChange={(e) => setStructure((p) => ({ ...p, [f]: e.target.value }))}
              />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Other charges</span>
              <button type="button" className="text-sm text-brand-600" onClick={addOtherCharge}>
                + Add row
              </button>
            </div>
            {structure.otherCharges.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1" placeholder="Label" value={o.label} onChange={(e) => {
                  const next = [...structure.otherCharges];
                  next[i] = { ...next[i], label: e.target.value };
                  setStructure((p) => ({ ...p, otherCharges: next }));
                }} />
                <input className="input w-32" type="number" placeholder="Amt" value={o.amount} onChange={(e) => {
                  const next = [...structure.otherCharges];
                  next[i] = { ...next[i], amount: e.target.value };
                  setStructure((p) => ({ ...p, otherCharges: next }));
                }} />
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select className="input" value={structure.discountType} onChange={(e) => setStructure((p) => ({ ...p, discountType: e.target.value }))}>
              {DISCOUNTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input className="input" type="number" placeholder="Discount value" value={structure.discountValue} onChange={(e) => setStructure((p) => ({ ...p, discountValue: e.target.value }))} />
            <select className="input" value={structure.frequency} onChange={(e) => setStructure((p) => ({ ...p, frequency: e.target.value }))}>
              {FREQ.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={structure.installmentEnabled} onChange={(e) => setStructure((p) => ({ ...p, installmentEnabled: e.target.checked }))} />
              Installments
            </label>
            <input className="input" type="number" min={1} placeholder="# Installments" value={structure.numberOfInstallments} onChange={(e) => setStructure((p) => ({ ...p, numberOfInstallments: e.target.value }))} />
            <input className="input" type="date" value={structure.dueDate} onChange={(e) => setStructure((p) => ({ ...p, dueDate: e.target.value }))} />
            <select className="input" value={structure.fineType} onChange={(e) => setStructure((p) => ({ ...p, fineType: e.target.value }))}>
              {FINES.map((d) => (
                <option key={d} value={d}>
                  Late fine: {d}
                </option>
              ))}
            </select>
            <input className="input" type="number" placeholder="Fine amount" value={structure.fineAmount} onChange={(e) => setStructure((p) => ({ ...p, fineAmount: e.target.value }))} />
            <input className="input" type="number" placeholder="Grace period (days)" value={structure.gracePeriodDays} onChange={(e) => setStructure((p) => ({ ...p, gracePeriodDays: e.target.value }))} />
            <input className="input" type="date" placeholder="Applicable from" value={structure.applicableFrom} onChange={(e) => setStructure((p) => ({ ...p, applicableFrom: e.target.value }))} />
            <input className="input" type="date" placeholder="Applicable to" value={structure.applicableTo} onChange={(e) => setStructure((p) => ({ ...p, applicableTo: e.target.value }))} />
            <select className="input" value={structure.status} onChange={(e) => setStructure((p) => ({ ...p, status: e.target.value }))}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <p className="mt-4 text-lg font-bold text-brand-700">Calculated total (after discount): ₹{totalPreview.toFixed(2)}</p>
          <button className="btn-primary mt-3" type="button" onClick={createStructure}>
            Save structure
          </button>
        </FormCard>
      )}

      {tab === "assign" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <FormCard title="Assign to one student" subtitle="Uses structure totals; optional extra manual discount.">
            <select className="input mb-2" value={assignSingle.studentId} onChange={(e) => setAssignSingle((p) => ({ ...p, studentId: e.target.value }))}>
              <option value="">Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.userId?.name} ({s.rollNumber})
                </option>
              ))}
            </select>
            <select className="input mb-2" value={assignSingle.feeStructureId} onChange={(e) => setAssignSingle((p) => ({ ...p, feeStructureId: e.target.value }))}>
              <option value="">Fee structure</option>
              {structures.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title} — {s.academicYear} — ₹{s.totalAmount ?? s.amount}
                </option>
              ))}
            </select>
            <input className="input mb-2" type="number" placeholder="Extra manual discount" value={assignSingle.manualDiscount} onChange={(e) => setAssignSingle((p) => ({ ...p, manualDiscount: e.target.value }))} />
            <input className="input mb-2" type="date" value={assignSingle.dueDate} onChange={(e) => setAssignSingle((p) => ({ ...p, dueDate: e.target.value }))} />
            <button className="btn-primary" type="button" onClick={assignOne}>
              Assign
            </button>
          </FormCard>
          <FormCard title="Bulk assign" subtitle="By class (all students in class), or class + section, or re-use structure class.">
            <select className="input mb-2" value={bulk.feeStructureId} onChange={(e) => setBulk((p) => ({ ...p, feeStructureId: e.target.value }))}>
              <option value="">Fee structure</option>
              {structures.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
            <select className="input mb-2" value={bulk.mode} onChange={(e) => setBulk((p) => ({ ...p, mode: e.target.value }))}>
              <option value="class">Whole class (from structure)</option>
              <option value="section">Class + section</option>
            </select>
            <select className="input mb-2" value={bulk.classId} onChange={(e) => setBulk((p) => ({ ...p, classId: e.target.value }))}>
              <option value="">Class filter (optional)</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — {c.section}
                </option>
              ))}
            </select>
            <input className="input mb-2" placeholder="Section (for section mode)" value={bulk.section} onChange={(e) => setBulk((p) => ({ ...p, section: e.target.value }))} />
            <input className="input mb-2" type="number" placeholder="Manual discount each" value={bulk.manualDiscount} onChange={(e) => setBulk((p) => ({ ...p, manualDiscount: e.target.value }))} />
            <button className="btn-primary" type="button" onClick={assignBulkRun}>
              Run bulk assign
            </button>
          </FormCard>
        </div>
      )}

      {tab === "table" && (
        <FormCard title="Student fee records" subtitle="Filter, paginate, export CSV. Open row for actions.">
          <div className="mb-4 flex flex-wrap gap-2">
            <select className="input w-40" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}>
              <option value="">All status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select className="input w-44" value={filters.classId} onChange={(e) => setFilters((p) => ({ ...p, classId: e.target.value, page: 1 }))}>
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}-{c.section}
                </option>
              ))}
            </select>
            <input className="input w-32" placeholder="Section" value={filters.section} onChange={(e) => setFilters((p) => ({ ...p, section: e.target.value, page: 1 }))} />
            <input className="input min-w-[160px] flex-1" placeholder="Search student name" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))} />
            <button type="button" className="btn-secondary" onClick={loadFeeTable}>
              Apply
            </button>
            <button type="button" className="btn-secondary" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="py-2 pr-2">Student</th>
                  <th className="py-2 pr-2">Class</th>
                  <th className="py-2 pr-2">Structure</th>
                  <th className="py-2 pr-2">Final</th>
                  <th className="py-2 pr-2">Paid</th>
                  <th className="py-2 pr-2">Rem.</th>
                  <th className="py-2 pr-2">Fine</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Due</th>
                  <th className="py-2"> </th>
                </tr>
              </thead>
              <tbody>
                {(feeRows.items || []).map((r) => {
                  const rem = Math.max(
                    Number(r.finalAmount || r.amount || 0) +
                      Number(r.computedFineAmount ?? r.fineAmount ?? 0) -
                      Number(r.paidAmount || 0),
                    0
                  );
                  const st = r.computedStatus || r.status;
                  return (
                    <tr key={r._id} className="border-b border-gray-100">
                      <td className="py-2 pr-2">{r.studentId?.userId?.name}</td>
                      <td className="py-2 pr-2">
                        {r.classId?.name}-{r.studentId?.section}
                      </td>
                      <td className="py-2 pr-2">{r.feeStructureId?.title}</td>
                      <td className="py-2 pr-2">₹{Number(r.finalAmount || r.amount || 0).toFixed(2)}</td>
                      <td className="py-2 pr-2">₹{Number(r.paidAmount || 0).toFixed(2)}</td>
                      <td className="py-2 pr-2">₹{rem.toFixed(2)}</td>
                      <td className="py-2 pr-2">₹{Number(r.computedFineAmount ?? r.fineAmount ?? 0).toFixed(2)}</td>
                      <td className="py-2 pr-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge(st)}`}>{st}</span>
                      </td>
                      <td className="py-2 pr-2">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="py-2">
                        <button type="button" className="font-semibold text-brand-600" onClick={() => openRow(r)}>
                          Actions
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {feeRows.page} / {feeRows.totalPages || 1} — {feeRows.total} rows
            </span>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-sm" disabled={filters.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}>
                Prev
              </button>
              <button
                type="button"
                className="btn-secondary text-sm"
                disabled={filters.page >= (feeRows.totalPages || 1)}
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </FormCard>
      )}

      {tab === "collect" && (
        <FormCard title="Collect payment" subtitle="Select a row from Student fees tab (Actions) to pre-fill student fee ID, or paste Mongo ID.">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input sm:col-span-2" placeholder="Student fee record ID (FeeAssignment _id)" value={collect.studentFeeId} onChange={(e) => setCollect((p) => ({ ...p, studentFeeId: e.target.value }))} />
            <input className="input" type="number" placeholder="Pay amount *" value={collect.amount} onChange={(e) => setCollect((p) => ({ ...p, amount: e.target.value }))} />
            <select className="input" value={collect.paymentMode} onChange={(e) => setCollect((p) => ({ ...p, paymentMode: e.target.value }))}>
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Transaction ID (online)" value={collect.transactionId} onChange={(e) => setCollect((p) => ({ ...p, transactionId: e.target.value }))} />
            <input className="input" type="date" value={collect.paymentDate} onChange={(e) => setCollect((p) => ({ ...p, paymentDate: e.target.value }))} />
            <input className="input sm:col-span-2" placeholder="Note" value={collect.note} onChange={(e) => setCollect((p) => ({ ...p, note: e.target.value }))} />
          </div>
          <button className="btn-primary mt-3" type="button" onClick={collectFee}>
            Collect & download receipt
          </button>
        </FormCard>
      )}

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">Fee record</h3>
            <p className="text-sm text-gray-600">{selectedRow.feeStructureId?.title}</p>
            <p className="mt-2 text-sm">
              Student: {selectedRow.studentId?.userId?.name} · Remaining: ₹
              {Math.max(
                Number(selectedRow.finalAmount || 0) +
                  Number(selectedRow.computedFineAmount ?? selectedRow.fineAmount ?? 0) -
                  Number(selectedRow.paidAmount || 0),
                0
              ).toFixed(2)}
            </p>
            <div className="mt-4 space-y-2 border-t pt-4">
              <input className="input" type="number" placeholder="Apply extra discount (₹)" value={patch.applyManualDiscount} onChange={(e) => setPatch((p) => ({ ...p, applyManualDiscount: e.target.value }))} />
              <input className="input" type="number" placeholder="Add fine (₹)" value={patch.addFine} onChange={(e) => setPatch((p) => ({ ...p, addFine: e.target.value }))} />
              <input className="input" type="number" placeholder="Or set fine total (₹)" value={patch.setFineAmount} onChange={(e) => setPatch((p) => ({ ...p, setFineAmount: e.target.value }))} />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary text-sm" onClick={savePatch}>
                  Save adjustments
                </button>
                <button type="button" className="btn-secondary text-sm" onClick={sendRemind}>
                  Send reminder
                </button>
                <button type="button" className="btn-secondary text-sm" onClick={() => setSelectedRow(null)}>
                  Close
                </button>
              </div>
              <button
                type="button"
                className="btn-primary mt-2 w-full text-sm"
                onClick={() => {
                  const row = selectedRow;
                  const rem = Math.max(
                    Number(row.finalAmount || row.amount || 0) +
                      Number(row.computedFineAmount ?? row.fineAmount ?? 0) -
                      Number(row.paidAmount || 0),
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
                Go to collect payment (pre-filled)
              </button>
            </div>
          </div>
        </div>
      )}

      <FormCard title="Saved structures" subtitle="Refresh list from server.">
        <button type="button" className="btn-secondary mb-2 text-sm" onClick={loadStructures}>
          Refresh
        </button>
        <div className="space-y-2 text-sm">
          {structures.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              <span className="font-semibold">{item.title}</span> · {item.academicYear} · Class {item.classId?.name}-{item.classId?.section}
              {item.section ? ` · Applies section: ${item.section}` : " · All sections"} · ₹{item.totalAmount ?? item.amount} · {item.status}
            </div>
          ))}
          {!structures.length && <div className="text-gray-500">No structures yet.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default FeesManagementPage;
