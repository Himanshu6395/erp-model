export const SCHOOL_SETTINGS_TABS = [
  {
    step: 1,
    label: "Profile",
    shortLabel: "Profile",
    path: "/admin/settings/profile",
    icon: "user",
    description: "School admin account details and profile photo",
  },
  {
    step: 2,
    label: "Security",
    shortLabel: "Security",
    path: "/admin/settings/security",
    icon: "shield",
    description: "Password and session security",
  },
  {
    step: 3,
    label: "School Settings",
    shortLabel: "School",
    path: "/admin/settings/school",
    icon: "building",
    description: "School branding and regional defaults",
  },
  {
    step: 4,
    label: "Email / SMTP",
    shortLabel: "Email",
    path: "/admin/settings/email",
    icon: "mail",
    description: "Mail server configuration",
  },
  {
    step: 5,
    label: "Notifications",
    shortLabel: "Notifications",
    path: "/admin/settings/notifications",
    icon: "bell",
    description: "Alert and notification preferences",
  },
  {
    step: 6,
    label: "Theme & Appearance",
    shortLabel: "Theme",
    path: "/admin/settings/theme",
    icon: "palette",
    description: "Colors and dashboard styling",
  },
];

export function getSchoolSettingsTab(pathname) {
  return SCHOOL_SETTINGS_TABS.find((t) => pathname.startsWith(t.path)) || SCHOOL_SETTINGS_TABS[0];
}

export function getSchoolSettingsStepIndex(pathname) {
  const idx = SCHOOL_SETTINGS_TABS.findIndex((t) => pathname.startsWith(t.path));
  return idx >= 0 ? idx : 0;
}

export { TIMEZONES, CURRENCIES, DATE_FORMATS } from "../../superAdmin/settings/settingsConstants";
export { ACADEMIC_SESSIONS } from "../../../theme/platformSettingsConstants";
