import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Banknote,
  Download,
  Gift,
  MinusCircle,
  RefreshCw,
  Receipt,
  Wallet,
} from "lucide-react";
import Loader from "../../components/Loader";
import { teacherService } from "../../services/teacherService";
import { EmptyState, GlassStat, PageCard, PageHeader } from "./teacherPageUi";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

function statusBadge(status) {
  const s = String(status || "PENDING").toUpperCase();
  if (s === "PAID" || s === "COMPLETED")
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (s === "FAILED" || s === "CANCELLED") return "bg-red-50 text-red-800 ring-red-200";
  return "bg-amber-50 text-amber-800 ring-amber-200";
}

function TeacherSalaryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      setData(await teacherService.getSalaryPayslip());
    } catch (error) {
      toast.error(error.message || "Failed to load salary details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader text="Loading salary details…" />
      </div>
    );
  }

  const paymentStatus = data?.paymentStatus || "PENDING";

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        badge="Compensation"
        title="Salary & payslip"
        subtitle="View your salary breakdown, payment status, and download payslip when available."
        actions={
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {!data ? (
        <EmptyState icon={Wallet} title="Salary unavailable" message="Could not load salary details. Try refreshing." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GlassStat icon={Banknote} label="Base salary" value={fmt(data.salary)} gradient="from-brand-600 to-indigo-700" />
            <GlassStat icon={Gift} label="Bonus" value={fmt(data.bonus)} gradient="from-violet-500 to-purple-600" />
            <GlassStat icon={MinusCircle} label="Deductions" value={fmt(data.deductions)} gradient="from-rose-500 to-red-600" />
            <GlassStat icon={Wallet} label="Net salary" value={fmt(data.netSalary)} sub="Take-home" gradient="from-emerald-500 to-teal-600" />
          </div>

          <PageCard title="Payment summary" subtitle="Current payroll status for your account." icon={Receipt}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Payment status</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-4 py-1.5 text-sm font-bold ring-1 ${statusBadge(paymentStatus)}`}
                >
                  {paymentStatus.replace(/_/g, " ")}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Net payable</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{fmt(data.netSalary)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-3">
              <div className="flex justify-between gap-2 border-b border-slate-200/80 pb-3 sm:flex-col sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                <span className="text-sm text-slate-500">Base</span>
                <span className="font-semibold text-slate-900">{fmt(data.salary)}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-slate-200/80 pb-3 sm:flex-col sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                <span className="text-sm text-slate-500">Bonus</span>
                <span className="font-semibold text-emerald-700">+{fmt(data.bonus)}</span>
              </div>
              <div className="flex justify-between gap-2 sm:flex-col">
                <span className="text-sm text-slate-500">Deductions</span>
                <span className="font-semibold text-red-700">−{fmt(data.deductions)}</span>
              </div>
            </div>
          </PageCard>

          <PageCard title="Payslip" subtitle="Download your payslip document when the school uploads it." icon={Download}>
            {data.payslipUrl ? (
              <a
                href={data.payslipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
              >
                <Download className="h-4 w-4" />
                Download payslip
              </a>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No payslip uploaded"
                message="Your school admin has not shared a payslip link yet. Check back later."
              />
            )}
          </PageCard>
        </>
      )}
    </div>
  );
}

export default TeacherSalaryPage;
