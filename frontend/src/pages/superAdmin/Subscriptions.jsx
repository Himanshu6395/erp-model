import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function SubscriptionsPage() {
  const [rows, setRows] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [extendDays, setExtendDays] = useState(30);

  const load = async () => {
    try {
      const [subs, planRows] = await Promise.all([superAdminOpsService.getSubscriptions(), superAdminOpsService.getPlans()]);
      setRows(subs);
      setPlans(planRows);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doChangePlan = async () => {
    if (!selectedSubscription || !selectedPlan) return;
    try {
      await superAdminOpsService.changeSubscriptionPlan(selectedSubscription, selectedPlan);
      toast.success("Plan changed");
      setSelectedSubscription(null);
      setSelectedPlan("");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const doExtend = async (subscriptionId) => {
    try {
      await superAdminOpsService.extendSubscription(subscriptionId, Number(extendDays || 30));
      toast.success("Subscription extended");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-3 pr-3">School</th>
              <th className="py-3 pr-3">Plan</th>
              <th className="py-3 pr-3">Start</th>
              <th className="py-3 pr-3">End</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="border-b last:border-0">
                <td className="py-3 pr-3">{row.schoolId?.name || "-"}</td>
                <td className="py-3 pr-3">{row.planId?.name || "-"}</td>
                <td className="py-3 pr-3">{row.startDate ? new Date(row.startDate).toLocaleDateString() : "-"}</td>
                <td className="py-3 pr-3">{row.endDate ? new Date(row.endDate).toLocaleDateString() : "-"}</td>
                <td className="py-3 pr-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      row.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : row.status === "TRIAL"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="btn-secondary px-2 py-1 text-xs"
                      type="button"
                      onClick={() => {
                        setSelectedSubscription(row._id);
                        setSelectedPlan(row.planId?._id || "");
                      }}
                    >
                      Change Plan
                    </button>
                    <button className="btn-secondary px-2 py-1 text-xs" type="button" onClick={() => doExtend(row._id)}>
                      Extend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Change Plan</h3>
          <select className="input mb-2" value={selectedSubscription || ""} onChange={(e) => setSelectedSubscription(e.target.value)}>
            <option value="">Select Subscription</option>
            {rows.map((row) => (
              <option key={row._id} value={row._id}>
                {row.schoolId?.name} ({row.planId?.name})
              </option>
            ))}
          </select>
          <select className="input mb-2" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
            <option value="">Select Plan</option>
            {plans.map((plan) => (
              <option key={plan._id} value={plan._id}>
                {plan.name}
              </option>
            ))}
          </select>
          <button className="btn-primary" type="button" onClick={doChangePlan}>
            Apply Plan Change
          </button>
        </div>

        <div>
          <h3 className="mb-2 text-lg font-semibold">Extend Subscription</h3>
          <input className="input mb-2" type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
          <p className="text-sm text-gray-600">Choose subscription row and click extend action in table.</p>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionsPage;
