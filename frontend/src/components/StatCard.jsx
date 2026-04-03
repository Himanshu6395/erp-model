const ACCENT_STYLES = {
  brand: {
    card: "border-l-[3px] border-brand-500 bg-gradient-to-br from-brand-50/90 via-white to-white ring-brand-100/60",
    iconWrap: "bg-brand-100 text-brand-600 shadow-sm shadow-brand-500/10 ring-1 ring-brand-200/40",
  },
  demo: {
    card: "border-l-[3px] border-demo-500 bg-gradient-to-br from-cyan-50/90 via-white to-white ring-cyan-100/60",
    iconWrap: "bg-cyan-100 text-demo-600 shadow-sm shadow-demo-500/10 ring-1 ring-cyan-200/40",
  },
  emerald: {
    card: "border-l-[3px] border-emerald-500 bg-gradient-to-br from-emerald-50/90 via-white to-white ring-emerald-100/60",
    iconWrap: "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-200/40",
  },
  violet: {
    card: "border-l-[3px] border-violet-500 bg-gradient-to-br from-violet-50/90 via-white to-white ring-violet-100/60",
    iconWrap: "bg-violet-100 text-violet-700 shadow-sm shadow-violet-500/10 ring-1 ring-violet-200/40",
  },
  amber: {
    card: "border-l-[3px] border-amber-500 bg-gradient-to-br from-amber-50/90 via-white to-white ring-amber-100/60",
    iconWrap: "bg-amber-100 text-amber-800 shadow-sm shadow-amber-500/10 ring-1 ring-amber-200/40",
  },
  rose: {
    card: "border-l-[3px] border-rose-500 bg-gradient-to-br from-rose-50/90 via-white to-white ring-rose-100/60",
    iconWrap: "bg-rose-100 text-rose-700 shadow-sm shadow-rose-500/10 ring-1 ring-rose-200/40",
  },
  sky: {
    card: "border-l-[3px] border-sky-500 bg-gradient-to-br from-sky-50/90 via-white to-white ring-sky-100/60",
    iconWrap: "bg-sky-100 text-sky-700 shadow-sm shadow-sky-500/10 ring-1 ring-sky-200/40",
  },
};

function StatCard({ icon, title, value, subtitle, accent }) {
  const a = accent && ACCENT_STYLES[accent] ? ACCENT_STYLES[accent] : null;
  const iconWrapClass = a?.iconWrap ?? "bg-brand-50 text-brand-600";

  return (
    <div
      className={`card transition hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${a?.card ?? ""}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className={`text-sm font-semibold leading-snug ${a ? "text-gray-800" : "text-gray-500"}`}>{title}</p>
        {icon ? (
          <div className={`shrink-0 rounded-xl p-2.5 ${iconWrapClass}`}>{icon}</div>
        ) : null}
      </div>
      <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      {subtitle ? <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

export default StatCard;
