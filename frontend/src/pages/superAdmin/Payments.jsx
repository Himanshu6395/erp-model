import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  const load = async () => {
    try {
      setPayments(await superAdminOpsService.getPayments());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-3 pr-3">School</th>
              <th className="py-3 pr-3">Amount</th>
              <th className="py-3 pr-3">Method</th>
              <th className="py-3 pr-3">Date</th>
              <th className="py-3 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((row) => (
              <tr key={row._id} className="border-b last:border-0">
                <td className="py-3 pr-3">{row.schoolId?.name || "-"}</td>
                <td className="py-3 pr-3">{row.amount}</td>
                <td className="py-3 pr-3">{row.method}</td>
                <td className="py-3 pr-3">{row.paidAt ? new Date(row.paidAt).toLocaleString() : "-"}</td>
                <td className="py-3 pr-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      row.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : row.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {!payments.length && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentsPage;
