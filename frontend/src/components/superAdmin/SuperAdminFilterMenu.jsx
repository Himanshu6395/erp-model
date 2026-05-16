import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";

/**
 * Single "Filters" button; opens a right-side off-canvas panel with filter fields.
 */
export default function SuperAdminFilterMenu({
  activeCount = 0,
  onOpen,
  onApply,
  onClear,
  applyLabel = "Apply filters",
  children,
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const close = () => setOpen(false);

  const openPanel = () => {
    onOpen?.();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleApply = () => {
    onApply?.();
    close();
  };

  const handleClear = () => {
    onClear?.();
    close();
  };

  const drawer = open
    ? createPortal(
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-default bg-slate-900/40 backdrop-blur-[2px]"
            aria-label="Close filters"
            onClick={close}
          />

          <aside
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-[min(100%,24rem)] flex-col border-l border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/90 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <SlidersHorizontal className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900">Filters</p>
                  {activeCount > 0 ? (
                    <p className="text-xs text-slate-500">{activeCount} active</p>
                  ) : (
                    <p className="text-xs text-slate-500">Refine the list below</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
              <div className="flex flex-col gap-2">
                {onApply ? (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
                  >
                    {applyLabel}
                  </button>
                ) : null}
                {onClear ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        </>,
        document.body
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <SlidersHorizontal className="h-4 w-4 text-slate-500" strokeWidth={1.75} aria-hidden />
        Filters
        {activeCount > 0 ? (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        ) : null}
      </button>
      {drawer}
    </>
  );
}
