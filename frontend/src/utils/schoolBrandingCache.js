import { SCHOOL_BRANDING_STORAGE_KEY, normalizeSchoolBranding } from "../theme/schoolBrandingConstants";

export function readSchoolBrandingCache() {
  try {
    const raw = localStorage.getItem(SCHOOL_BRANDING_STORAGE_KEY);
    if (!raw) return null;
    return normalizeSchoolBranding(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSchoolBrandingCache(branding) {
  const normalized = normalizeSchoolBranding(branding);
  localStorage.setItem(SCHOOL_BRANDING_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
