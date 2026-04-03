import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Ban,
  KeyRound,
  LogIn,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  UserX,
} from "lucide-react";
import Loader from "../../components/Loader";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function SecurityDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setStats(await superAdminOpsService.getSecurityDashboard());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const block = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.blockSchool(schoolId, reason);
      toast.success("School blocked");
      setReason("");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const unblock = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.unblockSchool(schoolId);
      toast.success("School unblocked");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const disableLogin = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.setSchoolLoginAccess(schoolId, false);
      toast.success("Login disabled");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const enableLogin = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.setSchoolLoginAccess(schoolId, true);
      toast.success("Login enabled");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const forceLogout = async () => {
    if (!schoolId) return;
    try {
      await superAdminOpsService.forceLogoutSchoolUsers(schoolId);
      toast.success("Force logout triggered");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading && !stats) return <Loader text="Loading security metrics…" />;

  return (
    <div className="w-full max-w-7xl space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-red-950/80 to-indigo-950 px-6 py-8 text-white shadow-xl shadow-slate-900/30 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-rose-500/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-100/90">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              Operations
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Security dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
              Live counts from the security service. Use quick actions with a valid <strong className="text-white">MongoDB school ID</strong>{" "}
              (copy from Schools list or URL).
            </p>
          </div>
          <Link
            to="/super-admin/login-activity"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            Login activity
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active schools</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{stats?.activeSchools ?? "—"}</p>
              <p className="mt-1 text-xs text-slate-500">Not blocked</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blocked schools</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-rose-800">{stats?.blockedSchools ?? "—"}</p>
              <p className="mt-1 text-xs text-slate-500">Requires review</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-500/20">
              <Ban className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Failed logins (24h)</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{stats?.failedLoginAttempts ?? "—"}</p>
              <p className="mt-1 text-xs text-slate-500">Platform-wide</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-lg shadow-red-600/20">
              <UserX className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/[0.06] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-indigo-800 text-white shadow-sm">
              <Shield className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Quick actions</h2>
              <p className="text-xs text-slate-500">Target a school by ID</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">School ID</label>
              <input
                className="input w-full rounded-xl py-2.5 font-mono text-sm shadow-sm"
                placeholder="507f1f77bcf86cd799439011"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value.trim())}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Block reason (optional)</label>
              <input
                className="input w-full rounded-xl py-2.5 text-sm shadow-sm"
                placeholder="Shown in audit trail"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={block}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100/80"
            >
              <Lock className="h-4 w-4" aria-hidden />
              Block school
            </button>
            <button
              type="button"
              onClick={unblock}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100/80"
            >
              <Unlock className="h-4 w-4" aria-hidden />
              Unblock
            </button>
            <button
              type="button"
              onClick={disableLogin}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden />
              Disable login
            </button>
            <button
              type="button"
              onClick={enableLogin}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <KeyRound className="h-4 w-4 text-brand-600" aria-hidden />
              Enable login
            </button>
            <button
              type="button"
              onClick={forceLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:from-rose-700 hover:to-red-800"
            >
              <UserX className="h-4 w-4" aria-hidden />
              Force logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityDashboardPage;
