import { motion } from "framer-motion";
import { Database, LibraryBig } from "lucide-react";

export function formatLibraryDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

export function downloadCsv(filename, rows) {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const raw = row[header] ?? "";
          const safe = String(raw).replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function LibraryPageHero({ badge = "Library management", title, subtitle, actions }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#102a43_46%,#0f766e_100%)] px-6 py-8 text-white shadow-[0_30px_80px_-34px_rgba(15,23,42,0.5)] sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute left-0 top-10 h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100">
            <LibraryBig className="h-4 w-4" strokeWidth={1.8} aria-hidden />
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

export function LibraryStatCard({ icon: Icon = Database, label, value, hint, tone = "brand" }) {
  const toneMap = {
    brand: "from-brand-600 to-cyan-500",
    amber: "from-amber-500 to-orange-500",
    emerald: "from-emerald-500 to-teal-500",
    rose: "from-rose-500 to-red-600",
    slate: "from-slate-700 to-slate-900",
  };
  return (
    <motion.div
      layout
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)] ring-1 ring-slate-100/80"
    >
      <div className="flex items-start gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${toneMap[tone] || toneMap.brand} text-white shadow-lg`}>
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          {hint ? <p className="mt-1.5 text-sm text-slate-500">{hint}</p> : null}
        </div>
      </div>
    </motion.div>
  );
}

export function LibrarySectionCard({ title, subtitle, actions, children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 ${className}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function LibraryEmptyState({ title, message }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function LibraryStatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();
  const classes = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    LOW_STOCK: "bg-amber-50 text-amber-700 ring-amber-200",
    OUT_OF_STOCK: "bg-rose-50 text-rose-700 ring-rose-200",
    REQUESTED: "bg-sky-50 text-sky-700 ring-sky-200",
    ISSUED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    RETURNED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    OVERDUE: "bg-rose-50 text-rose-700 ring-rose-200",
    REJECTED: "bg-slate-100 text-slate-600 ring-slate-200",
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
    WAIVED: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] ring-1 ${classes[normalized] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
      {normalized || "—"}
    </span>
  );
}
