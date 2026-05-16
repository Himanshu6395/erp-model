export const TEACHER_SETTINGS_TABS = [
  {
    id: "profile",
    label: "Profile Settings",
    shortLabel: "Profile",
    path: "/teacher/settings/profile",
    description: "Personal & professional details",
  },
  {
    id: "security",
    label: "Security",
    shortLabel: "Security",
    path: "/teacher/settings/security",
    description: "Password & sessions",
  },
  {
    id: "preferences",
    label: "Preferences",
    shortLabel: "Preferences",
    path: "/teacher/settings/preferences",
    description: "Theme & display",
  },
  {
    id: "notifications",
    label: "Notifications",
    shortLabel: "Notifications",
    path: "/teacher/settings/notifications",
    description: "Alert preferences",
  },
  {
    id: "account",
    label: "Account Settings",
    shortLabel: "Account",
    path: "/teacher/settings/account",
    description: "Privacy & activity",
  },
];

export function getTeacherSettingsTab(pathname) {
  return TEACHER_SETTINGS_TABS.find((t) => pathname.startsWith(t.path)) || TEACHER_SETTINGS_TABS[0];
}

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export const EMPLOYMENT_TYPES = [
  { value: "", label: "Select type" },
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
];

export const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const DRAFT_STORAGE_KEY = "teacher_profile_draft_v1";
