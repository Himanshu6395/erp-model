import { FaSignOutAlt } from "react-icons/fa";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/useAuth";

function formatRole(role) {
  if (!role) return "User";
  return String(role)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-gray-200/80 bg-white/85 px-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] backdrop-blur-md md:left-64 md:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-200/60 to-transparent" />

      <div className="relative flex h-[4.25rem] items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-600/90">
            <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
            Dashboard
          </p>
          <h1 className="mt-0.5 truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-gray-900 to-brand-700 bg-clip-text text-transparent">
              {user?.name || "User"}
            </span>
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-brand-100 bg-gradient-to-r from-brand-50 to-white px-4 py-2 shadow-sm sm:flex">
            <span className="text-xs font-semibold text-brand-800">{formatRole(user?.role)}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-gray-900/15 transition hover:bg-gray-800 hover:shadow-lg"
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
