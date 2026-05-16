export const TEACHER_LEAVE_TYPES = [
  { value: "SICK", label: "Sick Leave" },
  { value: "CASUAL", label: "Casual Leave" },
  { value: "EMERGENCY", label: "Emergency Leave" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "OTHER", label: "Other" },
];

export function leaveTypeLabel(value) {
  return TEACHER_LEAVE_TYPES.find((t) => t.value === value)?.label || value || "—";
}

export function statusBadgeClass(status) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
  if (status === "REJECTED") return "bg-rose-50 text-rose-800 ring-rose-200/80";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-600 ring-slate-200/80";
  return "bg-amber-50 text-amber-900 ring-amber-200/80";
}

export function statusLabel(status) {
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  if (status === "CANCELLED") return "Cancelled";
  return "Pending";
}

export function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "—";
  }
}

export function inclusiveDays(from, to) {
  if (!from || !to) return 0;
  const a = new Date(from);
  const b = new Date(to);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  if (b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
}
