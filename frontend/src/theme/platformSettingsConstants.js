export const PLATFORM_SETTINGS_STORAGE_KEY = "erp_platform_settings_v1";

export const DEFAULT_PLATFORM_SETTINGS = {
  platformName: "School ERP",
  logoUrl: "",
  faviconUrl: "",
  timezone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  supportEmail: "",
  supportContact: "",
  websiteUrl: "",
  address: "",
  primaryColor: "#2563eb",
  academicSession: "",
};

export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

export const ACADEMIC_SESSIONS = [
  "2024-25",
  "2025-26",
  "2026-27",
  "2027-28",
];

export function normalizePlatformSettings(raw = {}) {
  return {
    platformName: raw.platformName?.trim() || DEFAULT_PLATFORM_SETTINGS.platformName,
    logoUrl: raw.logoUrl || "",
    faviconUrl: raw.faviconUrl || "",
    timezone: raw.timezone || DEFAULT_PLATFORM_SETTINGS.timezone,
    currency: raw.currency || DEFAULT_PLATFORM_SETTINGS.currency,
    dateFormat: raw.dateFormat || DEFAULT_PLATFORM_SETTINGS.dateFormat,
    supportEmail: raw.supportEmail?.trim() || "",
    supportContact: raw.supportContact?.trim() || "",
    websiteUrl: raw.websiteUrl?.trim() || "",
    address: raw.address?.trim() || "",
    primaryColor: raw.primaryColor || DEFAULT_PLATFORM_SETTINGS.primaryColor,
    academicSession: raw.academicSession?.trim() || "",
  };
}
