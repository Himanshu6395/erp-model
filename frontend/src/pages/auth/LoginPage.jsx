import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEnvelope, FaEye } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";
import { getRoleHome } from "../../utils/roleUtils";
import LandingHeader from "../../components/LandingHeader";

//  Import your image
import bgImage from "../../assets/crm-brand-bg.jpg";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      navigate(getRoleHome(user.role), { replace: true });
    } catch (error) {}
  };

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col bg-gray-50">
      <LandingHeader />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* LEFT SIDE (IMAGE) */}
      <div
        className="relative hidden w-1/2 flex-col justify-between bg-cover bg-center p-12 text-white lg:flex"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold">
              📊
            </div>
            <h1 className="text-xl font-semibold">NexusCRM</h1>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Manage your <br />
              relationships, <br />
              <span className="text-teal-300">grow your business.</span>
            </h2>

            <p className="mt-4 text-sm text-white/80 max-w-md">
              Powerful analytics, seamless pipeline management,
              and intelligent automation — all in one platform.
            </p>

            {/* Stats */}
            <div className="flex gap-10 mt-8">
              <div>
                <p className="text-2xl font-bold">12K+</p>
                <p className="text-sm text-white/70">Active Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-white/70">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/60">
            © 2026 NexusCRM. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — scrolls on small screens; centered on large */}
      <div className="flex min-h-0 w-full flex-1 flex-col bg-gray-50 lg:w-1/2 lg:flex-none">
        {/* Compact brand strip on mobile (left panel is hidden) */}
        <div
          className="relative shrink-0 overflow-hidden bg-cover bg-center lg:hidden"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/92 via-gray-900/88 to-brand-900/80" />
          <div className="relative px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-5">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-teal-300/90">
              NexusCRM · School ERP
            </p>
            <h2 className="mt-1.5 text-lg font-bold leading-snug text-white sm:text-xl">
              Sign in to your dashboard
            </h2>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/75 sm:text-sm">
              Secure access for admins, teachers, and students.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:items-center lg:justify-center lg:p-6 lg:pb-8">
        <div className="mx-auto w-full max-w-md rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:rounded-2xl sm:p-8 sm:shadow-sm">

          <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Sign in to your account to continue
          </p>

          {/* Social Buttons (UI only) */}
          {/* <div className="flex gap-3 mt-6">
            <button className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">
              Google
            </button>
            <button className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">
              Github
            </button>
          </div> */}

          {/* Divider */}
          <div className="my-4 flex items-center gap-3 sm:my-6">
            {/* <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400">
              OR CONTINUE WITH EMAIL
            </span>
            <div className="h-px bg-gray-200 flex-1"></div> */}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="login-email">
                Email address
              </label>
              <div className="relative mt-1.5">
                <FaEnvelope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="name@company.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                  className="min-h-[44px] w-full rounded-lg border border-gray-200 px-10 py-2.5 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:min-h-0 sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-medium text-gray-700" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  className="self-start text-left text-sm font-medium text-blue-600 hover:text-blue-700 sm:self-auto"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative mt-1.5">
                <FaLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
                <FaEye className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-400" aria-hidden />
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="min-h-[44px] w-full rounded-lg border border-gray-200 px-10 py-2.5 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:min-h-0 sm:text-sm"
                />
              </div>
            </div>

            {/* Remember */}
            <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-600 touch-manipulation">
              <input type="checkbox" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded border-gray-300" />
              <span className="leading-snug">Remember me for 30 days</span>
            </label>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="min-h-[48px] w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 sm:min-h-[44px] sm:py-2.5 sm:text-sm"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <button type="button" className="font-medium text-blue-600 hover:text-blue-700">
              Create an account
            </button>
          </p>

        </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default LoginPage;