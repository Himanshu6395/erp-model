export const SETTINGS_TABS = [
  {
    step: 1,
    label: "Profile",
    shortLabel: "Profile",
    path: "/super-admin/settings/profile",
    icon: "user",
    description: "Account details and profile photo",
  },
  {
    step: 2,
    label: "Security",
    shortLabel: "Security",
    path: "/super-admin/settings/security",
    icon: "shield",
    description: "Password and session security",
  },
  {
    step: 3,
    label: "Platform Settings",
    shortLabel: "Platform",
    path: "/super-admin/settings/platform",
    icon: "building",
    description: "Branding and regional defaults",
  },
  {
    step: 4,
    label: "Email / SMTP",
    shortLabel: "Email",
    path: "/super-admin/settings/email",
    icon: "mail",
    description: "Mail server configuration",
  },
  {
    step: 5,
    label: "Notifications",
    shortLabel: "Notifications",
    path: "/super-admin/settings/notifications",
    icon: "bell",
    description: "Alert and notification preferences",
  },
  {
    step: 6,
    label: "Billing & Subscription",
    shortLabel: "Billing",
    path: "/super-admin/settings/billing",
    icon: "creditCard",
    description: "Trials, tax, and invoicing",
  },
  {
    step: 7,
    label: "Roles & Permissions",
    shortLabel: "Permissions",
    path: "/super-admin/settings/permissions",
    icon: "key",
    description: "Role-based module access",
  },
  {
    step: 8,
    label: "Theme & Appearance",
    shortLabel: "Theme",
    path: "/super-admin/settings/theme",
    icon: "palette",
    description: "Colors and dashboard styling",
  },
];

export function getSettingsTab(pathname) {
  return SETTINGS_TABS.find((t) => pathname.startsWith(t.path)) || SETTINGS_TABS[0];
}

export function getSettingsStepIndex(pathname) {
  const idx = SETTINGS_TABS.findIndex((t) => pathname.startsWith(t.path));
  return idx >= 0 ? idx : 0;
}

export const PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "students", label: "Students" },
  { key: "teachers", label: "Teachers" },
  { key: "attendance", label: "Attendance" },
  { key: "fees", label: "Fees" },
  { key: "exams", label: "Exams & Results" },
  { key: "timetable", label: "Timetable" },
  { key: "inquiries", label: "Inquiries" },
  { key: "reports", label: "Reports" },
];

export const PERMISSION_ROLES = [
  { key: "SCHOOL_ADMIN", label: "School Admin" },
  { key: "TEACHER", label: "Teacher" },
  { key: "PARENT", label: "Parent" },
];

export const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "UTC",
];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

export const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
