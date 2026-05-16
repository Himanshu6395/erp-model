export const inputClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:bg-slate-50 disabled:text-slate-500";

export const labelClass = "mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600";

export function SettingsCard({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`rounded-[1.25rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm ring-1 ring-slate-100 backdrop-blur-sm sm:p-6 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
          {Icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" strokeWidth={1.85} />
            </span>
          ) : null}
          <div>
            {title ? <h3 className="text-base font-bold text-slate-900">{title}</h3> : null}
            {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

export function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition hover:border-brand-200/60 hover:bg-brand-50/30">
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-brand-600" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-5" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-40 rounded-[1.25rem] bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}
