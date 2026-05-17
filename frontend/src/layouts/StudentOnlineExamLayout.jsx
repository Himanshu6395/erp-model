import { NavLink, Outlet } from "react-router-dom";
import { Activity, ClipboardCheck, Medal, Rocket, TrendingUp } from "lucide-react";

const tabs = [
  { to: "upcoming", label: "Upcoming Exams", icon: Rocket },
  { to: "live", label: "Live Exams", icon: Activity },
  { to: "completed", label: "Completed Exams", icon: ClipboardCheck },
  { to: "results", label: "Results", icon: Medal },
  { to: "performance", label: "Performance", icon: TrendingUp },
];

function StudentOnlineExamLayout() {
  return (
    <div className="w-full max-w-7xl space-y-8 pb-8">
      <nav className="flex flex-wrap gap-2 rounded-[2rem] border border-slate-200/90 bg-white p-2 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100/80">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                isActive ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

export default StudentOnlineExamLayout;
