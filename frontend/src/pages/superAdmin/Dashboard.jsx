import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Ban,
  Building2,
  CreditCard,
  Globe2,
  Layers,
  LayoutDashboard,
  LogIn,
  RefreshCw,
  School,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import Loader from "../../components/Loader";
import StatCard from "../../components/StatCard";
import { superAdminService } from "../../services/superAdminService";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function SectionShell({ icon: Icon, title, subtitle, accent, children }) {
  const header =
    {
      indigo:
        "from-indigo-500/12 via-indigo-50/40 to-transparent text-indigo-700 ring-indigo-100/80",
      emerald:
        "from-emerald-500/12 via-emerald-50/40 to-transparent text-emerald-700 ring-emerald-100/80",
      violet:
        "from-violet-500/12 via-violet-50/40 to-transparent text-violet-700 ring-violet-100/80",
      amber:
        "from-amber-500/12 via-amber-50/40 to-transparent text-amber-800 ring-amber-100/80",
      rose: "from-rose-500/12 via-rose-50/40 to-transparent text-rose-700 ring-rose-100/80",
    }[accent] ||
    "from-brand-500/12 via-brand-50/40 to-transparent text-brand-700 ring-brand-100/80";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-md shadow-gray-900/[0.04] ring-1 ring-gray-100/90 transition hover:shadow-lg hover:shadow-indigo-500/[0.06]">
      <div className={`border-b border-gray-100/90 bg-gradient-to-r px-5 py-4 ring-1 ring-inset ${header}`}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-sm ring-1 ring-gray-100">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SchoolRow({ school }) {
  const city = school.addressDetails?.city || school.city;
  const blocked = school.security?.isBlocked;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-4 py-3 transition hover:border-indigo-200/60 hover:from-indigo-50/50">
      <div>
        <p className="font-semibold text-gray-900">{school.name}</p>
        <p className="text-xs text-gray-500">
          {school.code}
          {city ? ` · ${city}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {blocked ? (
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 ring-1 ring-rose-200/60">
            Blocked
          </span>
        ) : null}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
            school.isActive !== false
              ? "bg-emerald-100 text-emerald-800 ring-emerald-200/60"
              : "bg-gray-100 text-gray-600 ring-gray-200/60"
          }`}
        >
          {school.isActive !== false ? "Active" : "Inactive"}
        </span>
        <Link
          to={`/super-admin/schools/${school._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          View <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    to: "/super-admin/create-school",
    label: "Create school",
    hint: "Onboard a new tenant",
    icon: Building2,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/25",
  },
  {
    to: "/super-admin/schools",
    label: "All schools",
    hint: "Search & manage",
    icon: School,
    gradient: "from-brand-500 to-brand-700",
    shadow: "shadow-brand-500/25",
  },
  {
    to: "/super-admin/create-school-admin",
    label: "School admin",
    hint: "Provision access",
    icon: UserPlus,
    gradient: "from-cyan-500 to-demo-600",
    shadow: "shadow-cyan-500/20",
  },
  {
    to: "/super-admin/plans",
    label: "Billing plans",
    hint: "Prices & cycles",
    icon: Layers,
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/25",
  },
  {
    to: "/super-admin/subscriptions",
    label: "Subscriptions",
    hint: "Plans & renewals",
    icon: RefreshCw,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    to: "/super-admin/payments",
    label: "Payments",
    hint: "Ledger & status",
    icon: CreditCard,
    gradient: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/20",
  },
  {
    to: "/super-admin/security-dashboard",
    label: "Security",
    hint: "Block & access",
    icon: Shield,
    gradient: "from-slate-700 to-indigo-800",
    shadow: "shadow-slate-900/30",
  },
  {
    to: "/super-admin/login-activity",
    label: "Login activity",
    hint: "Audit trail",
    icon: LogIn,
    gradient: "from-indigo-500 to-blue-600",
    shadow: "shadow-indigo-500/25",
  },
  {
    to: "/super-admin/blocked-schools",
    label: "Blocked schools",
    hint: "Review & unblock",
    icon: Ban,
    gradient: "from-red-600 to-rose-700",
    shadow: "shadow-red-600/25",
  },
];

function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [schoolTotal, setSchoolTotal] = useState(0);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [security, setSecurity] = useState(null);
  const [loginRows, setLoginRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      const settled = await Promise.allSettled([
        superAdminService.getSchools({ page: 1, limit: 8 }),
        superAdminOpsService.getPlans(),
        superAdminOpsService.getSubscriptions(),
        superAdminOpsService.getPayments(),
        superAdminOpsService.getSecurityDashboard(),
        superAdminOpsService.getLoginActivity(),
      ]);

      const errs = [];
      if (settled[0].status === "fulfilled") {
        const s = settled[0].value;
        setSchools(Array.isArray(s?.data) ? s.data : []);
        setSchoolTotal(Number(s?.total) || 0);
      } else errs.push("schools");
      if (settled[1].status === "fulfilled") setPlans(Array.isArray(settled[1].value) ? settled[1].value : []);
      else errs.push("plans");
      if (settled[2].status === "fulfilled")
        setSubscriptions(Array.isArray(settled[2].value) ? settled[2].value : []);
      else errs.push("subscriptions");
      if (settled[3].status === "fulfilled")
        setPayments(Array.isArray(settled[3].value) ? settled[3].value : []);
      else errs.push("payments");
      if (settled[4].status === "fulfilled") setSecurity(settled[4].value);
      else errs.push("security");
      if (settled[5].status === "fulfilled") {
        const rows = Array.isArray(settled[5].value) ? settled[5].value : [];
        setLoginRows(rows.slice(0, 8));
      } else errs.push("login activity");

      if (errs.length) {
        toast.error(`Some dashboard data could not load (${errs.join(", ")}).`);
      }
      setLoading(false);
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE").length;
    const trialSubs = subscriptions.filter((s) => s.status === "TRIAL").length;
    const now = Date.now();
    const inDays = (d) => {
      if (!d) return null;
      const t = new Date(d).getTime();
      if (Number.isNaN(t)) return null;
      return Math.ceil((t - now) / (86400000));
    };
    const expiringSoon = subscriptions.filter((s) => {
      const days = inDays(s.endDate);
      return days != null && days >= 0 && days <= 14 && (s.status === "ACTIVE" || s.status === "TRIAL");
    }).length;

    const paid = payments.filter((p) => p.status === "PAID");
    const paidTotal = paid.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const thirtyDaysAgo = now - 30 * 86400000;
    const recentPaid = paid.filter((p) => p.paidAt && new Date(p.paidAt).getTime() >= thirtyDaysAgo);
    const recentRevenue = recentPaid.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    return {
      activeSubs,
      trialSubs,
      expiringSoon,
      paidCount: paid.length,
      paidTotal,
      recentRevenue,
    };
  }, [subscriptions, payments]);

  const recentPayments = useMemo(() => payments.slice(0, 6), [payments]);

  const expiringList = useMemo(() => {
    const now = Date.now();
    return subscriptions
      .filter((s) => {
        if (!s.endDate) return false;
        const t = new Date(s.endDate).getTime();
        if (Number.isNaN(t)) return false;
        const days = Math.ceil((t - now) / 86400000);
        return days >= 0 && days <= 30 && (s.status === "ACTIVE" || s.status === "TRIAL");
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(0, 5);
  }, [subscriptions]);

  if (loading) return <Loader text="Loading super admin dashboard..." />;

  return (
    <div className="space-y-8 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-900 to-brand-900 px-6 py-8 text-white shadow-xl shadow-indigo-950/30 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200/95 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Platform control center
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Super admin{" "}
              <span className="bg-gradient-to-r from-white via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                dashboard
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              Monitor every school, subscription, and security signal from one vibrant overview—then
              jump straight into the module you need.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to="/super-admin/create-school"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-900 shadow-lg transition hover:bg-indigo-50"
            >
              <Building2 className="h-4 w-4" aria-hidden />
              New school
            </Link>
            <Link
              to="/super-admin/security-dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Shield className="h-4 w-4" aria-hidden />
              Security
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent="violet"
          icon={<School className="h-5 w-5" strokeWidth={1.75} />}
          title="Schools on platform"
          value={schoolTotal}
          subtitle="All registered tenants"
        />
        <StatCard
          accent="brand"
          icon={<Layers className="h-5 w-5" strokeWidth={1.75} />}
          title="Billing plans"
          value={plans.length}
          subtitle="Catalog size"
        />
        <StatCard
          accent="emerald"
          icon={<Users className="h-5 w-5" strokeWidth={1.75} />}
          title="Active subscriptions"
          value={metrics.activeSubs}
          subtitle={`${metrics.trialSubs} in trial`}
        />
        <StatCard
          accent="amber"
          icon={<Wallet className="h-5 w-5" strokeWidth={1.75} />}
          title="Recorded payments"
          value={metrics.paidCount}
          subtitle={`₹${metrics.paidTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} total`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          accent="demo"
          icon={<Globe2 className="h-5 w-5" strokeWidth={1.75} />}
          title="Schools active (security)"
          value={security?.activeSchools ?? "—"}
          subtitle="Not blocked · platform scope"
        />
        <StatCard
          accent="rose"
          icon={<ShieldAlert className="h-5 w-5" strokeWidth={1.75} />}
          title="Blocked schools"
          value={security?.blockedSchools ?? "—"}
          subtitle="Requires review"
        />
        <StatCard
          accent="sky"
          icon={<LogIn className="h-5 w-5" strokeWidth={1.75} />}
          title="Failed logins (24h)"
          value={security?.failedLoginAttempts ?? "—"}
          subtitle="Across all schools"
        />
        <StatCard
          accent="violet"
          icon={<TrendingUp className="h-5 w-5" strokeWidth={1.75} />}
          title="Renewals (14d)"
          value={metrics.expiringSoon}
          subtitle="Active / trial ending soon"
        />
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-indigo-600" aria-hidden />
          <h2 className="text-lg font-bold text-gray-900">Quick actions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${a.gradient} p-[1px] shadow-md ${a.shadow} transition hover:scale-[1.02] hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:scale-100`}
              >
                <div className="flex h-full items-center gap-4 rounded-[0.9rem] bg-white/95 px-4 py-4 backdrop-blur-sm transition group-hover:bg-white">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${a.gradient} text-white shadow-inner`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900">{a.label}</p>
                    <p className="text-xs text-gray-600">{a.hint}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50/50 via-white to-cyan-50/40 p-5 shadow-sm ring-1 ring-emerald-100/60 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Revenue pulse (30 days)</h2>
            <p className="text-sm text-gray-600">Sum of payments marked PAID in the last thirty days.</p>
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-800">
            ₹{metrics.recentRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <Link
          to="/super-admin/payments"
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-900"
        >
          Open payments ledger <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionShell
          icon={School}
          title="Recent schools"
          subtitle="Latest records from your directory"
          accent="indigo"
        >
          <div className="space-y-2">
            {schools.map((school) => (
              <SchoolRow key={school._id} school={school} />
            ))}
            {!schools.length && (
              <p className="rounded-xl border border-dashed border-indigo-200/70 bg-indigo-50/40 py-10 text-center text-sm text-indigo-900/70">
                No schools yet—create your first tenant to populate this list.
              </p>
            )}
          </div>
          {schools.length ? (
            <div className="mt-4 text-center">
              <Link
                to="/super-admin/schools"
                className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800"
              >
                View all {schoolTotal} schools <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </SectionShell>

        <SectionShell
          icon={CreditCard}
          title="Recent payments"
          subtitle="Newest settlement events"
          accent="rose"
        >
          <div className="space-y-2">
            {recentPayments.map((row) => (
              <div
                key={row._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-100/80 bg-gradient-to-r from-rose-50/40 to-white px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-gray-900">{row.schoolId?.name || "School"}</p>
                  <p className="text-xs text-gray-500">
                    {row.paidAt ? new Date(row.paidAt).toLocaleString() : "—"} · {row.method || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">₹{Number(row.amount || 0).toLocaleString()}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                      row.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : row.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {row.status || "—"}
                  </span>
                </div>
              </div>
            ))}
            {!recentPayments.length && (
              <p className="rounded-xl border border-dashed border-rose-200/70 bg-rose-50/40 py-10 text-center text-sm text-rose-900/70">
                No payments recorded yet.
              </p>
            )}
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionShell
          icon={RefreshCw}
          title="Subscriptions ending soon"
          subtitle="Next 30 days · active or trial"
          accent="emerald"
        >
          <div className="space-y-2">
            {expiringList.map((sub) => {
              const days = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000);
              return (
                <div
                  key={sub._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-100/90 bg-gradient-to-r from-emerald-50/50 to-white px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{sub.schoolId?.name || "School"}</p>
                    <p className="text-xs text-gray-600">
                      {sub.planId?.name || "Plan"} · {sub.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-200/60">
                    {days}d left
                  </span>
                </div>
              );
            })}
            {!expiringList.length && (
              <p className="rounded-xl border border-dashed border-emerald-200/70 bg-emerald-50/40 py-10 text-center text-sm text-emerald-900/70">
                No subscriptions expiring in the next 30 days.
              </p>
            )}
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/super-admin/subscriptions"
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-900"
            >
              Manage subscriptions <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </SectionShell>

        <SectionShell
          icon={LogIn}
          title="Latest login activity"
          subtitle="Most recent events (sample)"
          accent="violet"
        >
          <div className="space-y-2">
            {loginRows.map((row) => (
              <div
                key={row._id}
                className="rounded-xl border border-violet-100/80 bg-gradient-to-r from-violet-50/40 to-white px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">{row.userId?.name || row.userId?.email || "User"}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                      row.status === "SUCCESS"
                        ? "bg-emerald-100 text-emerald-800"
                        : row.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {row.role || "—"} · {row.schoolId?.name || "—"} ·{" "}
                  {row.timestamp ? new Date(row.timestamp).toLocaleString() : "—"}
                </p>
              </div>
            ))}
            {!loginRows.length && (
              <p className="rounded-xl border border-dashed border-violet-200/70 bg-violet-50/40 py-10 text-center text-sm text-violet-900/70">
                No login events yet.
              </p>
            )}
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/super-admin/login-activity"
              className="inline-flex items-center gap-1 text-sm font-bold text-violet-700 hover:text-violet-900"
            >
              Full login audit <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </SectionShell>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
