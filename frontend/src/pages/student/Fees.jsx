import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMoneyCheckAlt } from "react-icons/fa";
import Loader from "../../components/Loader";
import StatCard from "../../components/StatCard";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

function statusClass(s) {
  if (s === "PAID") return "bg-emerald-100 text-emerald-800";
  if (s === "PARTIAL") return "bg-amber-100 text-amber-900";
  if (s === "OVERDUE") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My fees</h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<FaMoneyCheckAlt />} title="Total due" value={`₹${(s.total || 0).toFixed(2)}`} subtitle="Including late fine" />
        <StatCard icon={<FaMoneyCheckAlt />} title="Paid" value={`₹${(s.paid || 0).toFixed(2)}`} subtitle="All receipts" />
        <StatCard icon={<FaMoneyCheckAlt />} title="Remaining" value={`₹${(s.pending || 0).toFixed(2)}`} subtitle="Outstanding" />
        <StatCard icon={<FaMoneyCheckAlt />} title="Late fine (est.)" value={`₹${(s.fine || 0).toFixed(2)}`} subtitle="Shown on open balances" />
      </div>

      <FormCard title="Fee breakdown & installments" subtitle="Each row is a fee package assigned to you.">
        <div className="overflow-x-auto text-sm">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-500">
                <th className="py-2 pr-2">Title</th>
                <th className="py-2 pr-2">Year</th>
                <th className="py-2 pr-2">Final</th>
                <th className="py-2 pr-2">Discount</th>
                <th className="py-2 pr-2">Fine</th>
                <th className="py-2 pr-2">Paid</th>
                <th className="py-2 pr-2">Remaining</th>
                <th className="py-2 pr-2">Due</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2">Installments</th>
              </tr>
            </thead>
            <tbody>
              {(fees?.structure || []).map((row) => (
                <tr key={row._id} className="border-b border-gray-100">
                  <td className="py-2 pr-2 font-medium">{row.feeStructureId?.title || "—"}</td>
                  <td className="py-2 pr-2">{row.academicYear || row.feeStructureId?.academicYear || "—"}</td>
                  <td className="py-2 pr-2">₹{Number(row.finalAmount || row.amount || 0).toFixed(2)}</td>
                  <td className="py-2 pr-2">₹{Number(row.manualDiscountAmount || 0).toFixed(2)}</td>
                  <td className="py-2 pr-2">₹{Number(row.computedFineAmount ?? row.fineAmount ?? 0).toFixed(2)}</td>
                  <td className="py-2 pr-2">₹{Number(row.paidAmount || 0).toFixed(2)}</td>
                  <td className="py-2 pr-2">₹{Number(row.remaining ?? 0).toFixed(2)}</td>
                  <td className="py-2 pr-2">{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="py-2 pr-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.computedStatus || row.status)}`}>
                      {row.computedStatus || row.status}
                    </span>
                  </td>
                  <td className="max-w-[200px] py-2 text-xs text-gray-600">
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
          {!fees?.structure?.length && <p className="py-4 text-gray-500">No fee records yet.</p>}
        </div>
      </FormCard>

      <FormCard title="Pay fees (demo portal)" subtitle="Select an open fee record and amount. Creates a receipt and notifies you.">
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="input sm:col-span-2" value={payForm.studentFeeId} onChange={(e) => setPayForm((p) => ({ ...p, studentFeeId: e.target.value }))}>
            <option value="">Select fee record</option>
            {(fees?.structure || [])
              .filter((r) => (r.computedStatus || r.status) !== "PAID")
              .map((r) => (
                <option key={r._id} value={r._id}>
                  {r.feeStructureId?.title} — remaining ₹{Number(r.remaining ?? 0).toFixed(2)}
                </option>
              ))}
          </select>
          <input className="input" type="number" placeholder="Amount" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} />
          <select className="input" value={payForm.paymentMode} onChange={(e) => setPayForm((p) => ({ ...p, paymentMode: e.target.value }))}>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="NET_BANKING">Net banking</option>
            <option value="CASH">Cash</option>
          </select>
          <input className="input sm:col-span-2" placeholder="Transaction ID (optional)" value={payForm.transactionId} onChange={(e) => setPayForm((p) => ({ ...p, transactionId: e.target.value }))} />
        </div>
        <button type="button" className="btn-primary mt-3" onClick={pay}>
          Submit payment
        </button>
      </FormCard>

      <FormCard title="Payment history" subtitle="Download PDF receipts.">
        <div className="overflow-x-auto text-sm">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-500">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Mode</th>
                <th className="py-2 pr-2">Receipt</th>
                <th className="py-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {(fees?.paymentHistory || []).map((p) => (
                <tr key={p._id} className="border-b border-gray-100">
                  <td className="py-2 pr-2">{new Date(p.paymentDate).toLocaleString()}</td>
                  <td className="py-2 pr-2">₹{Number(p.amount).toFixed(2)}</td>
                  <td className="py-2 pr-2">{p.paymentMode || p.paymentMethod}</td>
                  <td className="py-2 pr-2 font-mono text-xs">{p.receiptNumber || p._id}</td>
                  <td className="py-2">
                    <button type="button" className="text-brand-600 hover:underline" onClick={() => downloadReceipt(p._id)}>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!fees?.paymentHistory?.length && <p className="py-4 text-gray-500">No payments yet.</p>}
        </div>
      </FormCard>
    </div>
  );
}

export default StudentFeesPage;
