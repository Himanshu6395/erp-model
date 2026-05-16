/** Shared Super Admin UI tokens */

export const SA_INPUT_H = "h-11 min-h-[44px]";

export const SA_SELECT =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] focus:border-brand-600 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15";

export const SA_SELECT_WITH_H = `${SA_SELECT} ${SA_INPUT_H}`;

export const SA_TABLE_HEAD =
  "border-b border-slate-200 bg-slate-50 text-left text-[0.68rem] font-bold uppercase tracking-wider text-slate-500";

export const SA_FIELD_LABEL = "mb-2 block text-xs font-semibold text-slate-600";

export const SA_INPUT =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15";

export const SA_INPUT_WITH_H = `${SA_INPUT} ${SA_INPUT_H}`;

export function countActiveFilters(values) {
  return Object.values(values).filter((v) => v !== "" && v != null && String(v).trim() !== "").length;
}
