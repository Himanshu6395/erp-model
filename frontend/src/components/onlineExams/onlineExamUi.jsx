import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export const examInputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15";

export const examLabelClass = "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600";

export const examBtnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

export const examBtnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export function OnlineExamHero({ badge = "Online exams", title, subtitle, actions }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_38%,#0f766e_100%)] px-6 py-8 text-white shadow-[0_30px_80px_-34px_rgba(15,23,42,0.48)] sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_28%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
            {badge}
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

export function OnlineExamStatCard({ icon: Icon, label, value, hint, tone = "brand" }) {
  const toneMap = {
    brand: "from-brand-600 to-indigo-600",
    teal: "from-emerald-500 to-cyan-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-red-600",
    slate: "from-slate-700 to-slate-900",
  };
  return (
    <motion.div layout className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.18)] ring-1 ring-slate-100/90">
      <div className="flex items-start gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${toneMap[tone] || toneMap.brand} text-white shadow-lg`}>
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          {hint ? <p className="mt-1.5 text-sm text-slate-500">{hint}</p> : null}
        </div>
      </div>
    </motion.div>
  );
}

export function OnlineExamSection({ title, subtitle, actions, children }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
      {(title || subtitle || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            {title ? <h2 className="text-lg font-bold text-slate-950">{title}</h2> : null}
            {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function OnlineExamBadge({ status }) {
  const value = String(status || "").toUpperCase();
  const map = {
    DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    LIVE: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    COMPLETED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
    LOCKED: "bg-slate-100 text-slate-700 ring-slate-300",
    RESULT_PUBLISHED: "bg-violet-50 text-violet-700 ring-violet-200",
    AUTO_EVALUATED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PENDING_MANUAL: "bg-amber-50 text-amber-700 ring-amber-200",
    FINALIZED: "bg-brand-50 text-brand-700 ring-brand-200",
    MANUAL: "bg-slate-100 text-slate-700 ring-slate-200",
    IMPORT: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    AI: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] ring-1 ${map[value] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>{value || "UNKNOWN"}</span>;
}

export function OnlineExamEmptyState({ title, message }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function formatExamDate(value, withTime = false) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
}
