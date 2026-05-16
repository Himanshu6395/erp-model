import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, IndianRupee, Receipt, Wallet } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import {
  PageHeader,
  GlassStat,
  PageCard,
  DataTable,
  EmptyState,
  inputClass,
  btnPrimary,
} from "./studentPageUi";

function statusClass(s) {
  if (s === "PAID") return "bg-emerald-100 text-emerald-800";
  if (s === "PARTIAL") return "bg-amber-100 text-amber-900";
  if (s === "OVERDUE") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
}

function StudentFeesPage() {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState(null);
  const [payForm, setPayForm] = useState({ studentFeeId: "", amount: "", paymentMode: "UPI", transactionId: "" });

  const load = async () => {
    try {
      setFees(await studentService.getFeesDetails());
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pay = async () => {
    try {
      await studentService.payFees({
        studentFeeId: payForm.studentFeeId,
        amount: Number(payForm.amount),
        paymentMode: payForm.paymentMode,
        transactionId: payForm.transactionId,
      });
      toast.success("Payment recorded");
      setPayForm({ studentFeeId: "", amount: "", paymentMode: "UPI", transactionId: "" });
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const blob = await studentService.downloadFeeReceipt(paymentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <Loader text="Loading fees..." />;

  const s = fees?.summary || {};
  const structure = fees?.structure || [];
  const history = fees?.paymentHistory || [];

  return (
    <div className="space-y-6">
      <PageHeader badge="Finance" title="My fees" subtitle="Fee breakdown, online payment, and receipt history." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassStat icon={IndianRupee} label="Total due" value={`₹${(s.total || 0).toFixed(2)}`} sub="Including late fine" gradient="from-brand-600 to-indigo-600" />
        <GlassStat icon={Wallet} label="Paid" value={`₹${(s.paid || 0).toFixed(2)}`} sub="All receipts" gradient="from-emerald-600 to-teal-600" />
        <GlassStat icon={CreditCard} label="Remaining" value={`₹${(s.pending || 0).toFixed(2)}`} sub="Outstanding" gradient="from-amber-500 to-orange-500" />
        <GlassStat icon={Receipt} label="Late fine (est.)" value={`₹${(s.fine || 0).toFixed(2)}`} sub="On open balances" gradient="from-rose-600 to-red-600" />
      </div>

      <PageCard title="Fee breakdown & installments" subtitle="Each row is a fee package assigned to you." icon={IndianRupee}>
        {!structure.length ? (
          <EmptyState icon={IndianRupee} title="No fee records yet" message="Fee assignments from your school will appear here." />
        ) : (
          <DataTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Year</th>
                  <th className="px-3 py-3">Final</th>
                  <th className="px-3 py-3">Discount</th>
                  <th className="px-3 py-3">Fine</th>
                  <th className="px-3 py-3">Paid</th>
                  <th className="px-3 py-3">Remaining</th>
                  <th className="px-3 py-3">Due</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Installments</th>
                </tr>
              </thead>
              <tbody>
                {structure.map((row) => (
                  <tr key={row._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-3 py-2 font-medium text-slate-900">{row.feeStructureId?.title || "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{row.academicYear || row.feeStructureId?.academicYear || "—"}</td>
                    <td className="px-3 py-2 text-slate-700">₹{Number(row.finalAmount || row.amount || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-700">₹{Number(row.manualDiscountAmount || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-700">₹{Number(row.computedFineAmount ?? row.fineAmount ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-700">₹{Number(row.paidAmount || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-700">₹{Number(row.remaining ?? 0).toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-700">{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.computedStatus || row.status)}`}>
                        {row.computedStatus || row.status}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-3 py-2 text-xs text-slate-600">
                      {(row.installmentDetails || []).map((i) => (
                        <div key={i.index}>
                          {i.label}: ₹{i.amount} due {i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—"}
                        </div>
                      ))}
                      {!row.installmentDetails?.length && "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </PageCard>

      <PageCard title="Pay fees (demo portal)" subtitle="Select an open fee record and amount. Creates a receipt and notifies you." icon={CreditCard}>
        <div className="grid gap-3 sm:grid-cols-2">
          <select className={`${inputClass} sm:col-span-2`} value={payForm.studentFeeId} onChange={(e) => setPayForm((p) => ({ ...p, studentFeeId: e.target.value }))}>
            <option value="">Select fee record</option>
            {structure
              .filter((r) => (r.computedStatus || r.status) !== "PAID")
              .map((r) => (
                <option key={r._id} value={r._id}>
                  {r.feeStructureId?.title} — remaining ₹{Number(r.remaining ?? 0).toFixed(2)}
                </option>
              ))}
          </select>
          <input className={inputClass} type="number" placeholder="Amount" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} />
          <select className={inputClass} value={payForm.paymentMode} onChange={(e) => setPayForm((p) => ({ ...p, paymentMode: e.target.value }))}>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="NET_BANKING">Net banking</option>
            <option value="CASH">Cash</option>
          </select>
          <input className={`${inputClass} sm:col-span-2`} placeholder="Transaction ID (optional)" value={payForm.transactionId} onChange={(e) => setPayForm((p) => ({ ...p, transactionId: e.target.value }))} />
        </div>
        <button type="button" className={`${btnPrimary} mt-4`} onClick={pay}>
          Submit payment
        </button>
      </PageCard>

      <PageCard title="Payment history" subtitle="Download PDF receipts." icon={Receipt}>
        {!history.length ? (
          <EmptyState icon={Receipt} title="No payments yet" message="Your payment receipts will appear here." />
        ) : (
          <DataTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Receipt</th>
                  <th className="px-4 py-3">PDF</th>
                </tr>
              </thead>
              <tbody>
                {history.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-700">{new Date(p.paymentDate).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">₹{Number(p.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-700">{p.paymentMode || p.paymentMethod}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.receiptNumber || p._id}</td>
                    <td className="px-4 py-3">
                      <button type="button" className="font-medium text-brand-600 hover:underline" onClick={() => downloadReceipt(p._id)}>
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </PageCard>
    </div>
  );
}

export default StudentFeesPage;
