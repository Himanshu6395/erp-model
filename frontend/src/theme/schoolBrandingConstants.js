export const SCHOOL_BRANDING_STORAGE_KEY = "erp_school_branding_v1";

export const DEFAULT_SCHOOL_BRANDING = {
  schoolName: "School ERP",
  logoUrl: "",
  faviconUrl: "",
  timezone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  primaryColor: "#2563eb",
};

export function normalizeSchoolBranding(raw = {}) {
  return {
    schoolName: raw.schoolName?.trim() || DEFAULT_SCHOOL_BRANDING.schoolName,
    logoUrl: raw.logoUrl || "",
    faviconUrl: raw.faviconUrl || "",
    timezone: raw.timezone || DEFAULT_SCHOOL_BRANDING.timezone,
    currency: raw.currency || DEFAULT_SCHOOL_BRANDING.currency,
    dateFormat: raw.dateFormat || DEFAULT_SCHOOL_BRANDING.dateFormat,
    primaryColor: raw.primaryColor || DEFAULT_SCHOOL_BRANDING.primaryColor,
  };
}
