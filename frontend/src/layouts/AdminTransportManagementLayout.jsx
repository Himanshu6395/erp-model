import { NavLink, Outlet } from "react-router-dom";
import { Bus, ClipboardList } from "lucide-react";

const tabBase =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition sm:flex-none sm:px-6";

function AdminTransportManagementLayout() {
  return (
    <div className="w-full max-w-7xl space-y-8 pb-8">
      <nav
        className="flex flex-col gap-2 rounded-3xl border border-slate-200/90 bg-white p-2 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100/80 sm:flex-row sm:items-center sm:gap-2 sm:p-2"
        aria-label="Transport management sections"
      >
        <NavLink
          to="create"
          className={({ isActive }) =>
            `${tabBase} ${
              isActive
                ? "bg-gradient-to-r from-cyan-600 to-brand-700 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          <Bus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          Manage transport
        </NavLink>
        <NavLink
          to="registered"
          className={({ isActive }) =>
            `${tabBase} ${
              isActive
                ? "bg-gradient-to-r from-slate-800 to-brand-950 text-white shadow-md shadow-slate-900/20"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          <ClipboardList className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          All transport records
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

export default AdminTransportManagementLayout;
