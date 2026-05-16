export const INQUIRY_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "DROPPED", label: "Dropped" },
  { value: "CONVERTED_TO_ADMISSION", label: "Converted To Admission" },
];

export const INQUIRY_SOURCE_OPTIONS = [
  { value: "WALK_IN", label: "Walk-in" },
  { value: "WEBSITE", label: "Website" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "REFERENCE", label: "Reference" },
  { value: "TEACHER", label: "Teacher" },
  { value: "OTHER", label: "Other" },
];

export function statusChipColor(status) {
  switch (status) {
    case "PENDING":
      return "warning";
    case "FOLLOW_UP":
      return "info";
    case "DROPPED":
      return "error";
    case "CONVERTED_TO_ADMISSION":
      return "success";
    default:
      return "default";
  }
}

export function formatTeacherLabel(t) {
  if (!t) return "—";
  const u = t.userId?.name || "";
  const name = `${t.firstName || ""} ${t.lastName || ""}`.trim();
  return name || u || "—";
}
