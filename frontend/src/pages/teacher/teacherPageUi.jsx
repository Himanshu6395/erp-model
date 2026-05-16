export const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:bg-slate-50";

export const labelClass = "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600";

export function PageHeader({ badge, title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{badge}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function GlassStat({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.25rem] border border-white/60 bg-gradient-to-br p-5 text-white shadow-lg ring-1 ring-slate-200/50 ${gradient}`}
    >
      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/25 ring-1 ring-white/30">
          <Icon className="h-5 w-5" strokeWidth={1.85} />
        </span>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/85">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-0.5 text-xs text-white/80">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function PageCard({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section
      className={`rounded-[1.25rem] border border-slate-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-slate-100 backdrop-blur-sm sm:p-6 ${className}`}
    >
      {(title || subtitle) && (
        <header className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
          {Icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" strokeWidth={1.85} />
            </span>
          ) : null}
          <div>
            {title ? <h2 className="text-lg font-bold text-slate-900">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

export function TabPills({ tabs, active, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            active === tab.id
              ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-white hover:text-slate-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center">
      {Icon ? <Icon className="mb-3 h-10 w-10 text-slate-300" strokeWidth={1.5} /> : null}
      <p className="font-semibold text-slate-700">{title}</p>
      {message ? <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}

export function DataTable({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 ring-1 ring-slate-100">
      <div className="teacher-table-scroll max-h-[min(70vh,720px)] overflow-auto">{children}</div>
    </div>
  );
}
