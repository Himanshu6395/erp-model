export const STUDENT_LEAVE_TYPES = [
  { value: "SICK", label: "Sick Leave" },
  { value: "CASUAL", label: "Casual Leave" },
  { value: "EMERGENCY", label: "Emergency Leave" },
  { value: "OTHER", label: "Other" },
];

export function studentLeaveTypeLabel(value) {
  return STUDENT_LEAVE_TYPES.find((t) => t.value === value)?.label || value || "—";
}

export function studentStatusBadgeClass(status) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
  if (status === "REJECTED") return "bg-rose-50 text-rose-800 ring-rose-200/80";
  return "bg-amber-50 text-amber-900 ring-amber-200/80";
}

export function studentStatusLabel(status) {
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
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

export function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}
