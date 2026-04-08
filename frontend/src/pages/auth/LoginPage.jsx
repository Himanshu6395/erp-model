import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { getRoleHome } from "../../utils/roleUtils";
import LandingHeader from "../../components/LandingHeader";

const TRUST_POINTS = [
  { icon: Shield, text: "Encrypted sign-in & role-based access" },
  { icon: Users, text: "Built for admins, teachers & students" },
  { icon: BookOpen, text: "One portal for your whole campus" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      navigate(getRoleHome(user.role), { replace: true });
    } catch {
      /* toast handled in AuthContext */
    }
  };

  const onForgotPassword = () => {
    toast("Contact your school administrator or platform support to reset your password.", {
      icon: "i",
      duration: 4500,
    });
  };

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),_transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_38%,#f8fafc_100%)]">
      <LandingHeader />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-brand-900 to-slate-900" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
            aria-hidden
          />
          <div className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl" aria-hidden />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                <GraduationCap className="h-7 w-7 text-teal-300" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">NexusCRM</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-teal-300/90">School ERP</p>
              </div>
            </div>

            <div className="max-w-md">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-teal-200/90">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
                Secure access
              </p>
              <h2 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight">
                Run your school with clarity and control.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Attendance, fees, timetables, and communication in one system. Sign in with the account issued by your
                administrator.
              </p>

              <ul className="mt-10 space-y-4">
                {TRUST_POINTS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-slate-200">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                      <Icon className="h-4 w-4 text-teal-300" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="pt-1.5 leading-snug">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-500">© {new Date().getFullYear()} School ERP. All rights reserved.</p>
          </div>
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col lg:w-1/2 lg:flex-none">
          <div className="relative shrink-0 overflow-hidden lg:hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-brand-900 to-slate-900" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.2]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-teal-400/25 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-brand-400/20 blur-3xl" aria-hidden />

            <div className="relative px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-6 sm:pt-6">
              <div className="rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.9)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                      <GraduationCap className="h-5 w-5 text-teal-300" strokeWidth={1.75} aria-hidden />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-teal-300/90">School ERP</p>
                      <h2 className="text-lg font-bold text-white">Welcome back</h2>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/80">
                    Secure
                  </span>
                </div>

                <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-200">
                  Continue to your dashboard with one sign-in for admins, teachers, and students.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {TRUST_POINTS.map(({ icon: Icon, text }) => (
                    <div key={text} className="rounded-2xl border border-white/10 bg-white/[0.04] px-2.5 py-3 text-center">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                        <Icon className="h-4 w-4 text-teal-300" strokeWidth={1.75} aria-hidden />
                      </div>
                      <p className="mt-2 text-[0.68rem] font-medium leading-snug text-slate-200">
                        {text.split(" ").slice(0, 2).join(" ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-8 sm:pb-10 sm:pt-8 lg:items-center lg:justify-center lg:p-10">
            <div className="mx-auto w-full max-w-[420px]">
              <div className="rounded-[1.75rem] border border-slate-200/90 bg-white/95 p-5 shadow-[0_32px_70px_-36px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/[0.05] backdrop-blur sm:p-8">
                <div>
                  <div className="hidden items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-700 lg:inline-flex">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Smart campus login
                  </div>
                  <h1 className="mt-0 text-2xl font-bold tracking-tight text-slate-900 sm:mt-4 sm:text-[1.65rem]">
                    Sign in to continue
                  </h1>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Enter your credentials to open your dashboard and manage your day smoothly.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="mt-6 space-y-5 sm:mt-8">
                  <div>
                    <label className="text-sm font-semibold text-slate-800" htmlFor="login-email">
                      Email
                    </label>
                    <div className="relative mt-2">
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <input
                        id="login-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="you@school.edu"
                        autoComplete="email"
                        inputMode="email"
                        required
                        className="min-h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 sm:min-h-[46px] sm:rounded-xl sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <label className="text-sm font-semibold text-slate-800" htmlFor="login-password">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={onForgotPassword}
                        className="self-start text-left text-sm font-semibold text-brand-600 hover:text-brand-700 sm:self-auto"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative mt-2">
                      <Lock
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={onChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        className="min-h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 sm:min-h-[46px] sm:rounded-xl sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                        ) : (
                          <Eye className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-600 to-brand-700 py-3 text-base font-semibold text-white shadow-[0_18px_40px_-18px_rgba(29,78,216,0.8)] transition hover:from-brand-500 hover:to-brand-600 hover:shadow-brand-600/30 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-[46px] sm:rounded-xl sm:text-sm"
                  >
                    {loading ? (
                      "Signing in..."
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 sm:hidden">
                  Secure sign-in protects attendance, fees, marks, and school communication in one place.
                </div>

                <p className="mt-6 text-center text-sm text-slate-600 sm:mt-8">
                  New to the platform?{" "}
                  <Link to="/get-started" className="font-semibold text-brand-600 hover:text-brand-700">
                    Get started
                  </Link>
                </p>
              </div>

              <p className="mt-6 text-center text-xs text-slate-500">
                By signing in you agree to follow your school&apos;s acceptable use policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
