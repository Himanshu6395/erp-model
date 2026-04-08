import { FaSignOutAlt } from "react-icons/fa";
import { Menu, Sparkles } from "lucide-react";
import { useAuth } from "../context/useAuth";

function formatRole(role) {
  if (!role) return "User";
  return String(role)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Navbar({ onOpenMobileNav, mobileNavOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/70 bg-white/80 px-4 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl md:left-64 md:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/70 to-transparent" />

      <div className="relative flex h-[4.25rem] items-center justify-between gap-3 md:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={Boolean(mobileNavOpen)}
            aria-controls="dashboard-sidebar"
            onClick={() => onOpenMobileNav?.()}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-600/90">
              <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
              Dashboard
            </p>
            <h1 className="mt-0.5 truncate text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-slate-950 to-brand-700 bg-clip-text text-transparent">
                {user?.name || "User"}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm sm:flex">
            <span className="text-xs font-semibold text-slate-700">{formatRole(user?.role)}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:bg-brand-700 hover:shadow-lg"
          >
            <FaSignOutAlt className="text-sm opacity-90" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
