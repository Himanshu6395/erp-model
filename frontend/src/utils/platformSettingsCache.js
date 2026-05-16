import { PLATFORM_SETTINGS_STORAGE_KEY, normalizePlatformSettings } from "../theme/platformSettingsConstants";

export function readPlatformSettingsCache() {
  try {
    const raw = localStorage.getItem(PLATFORM_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return normalizePlatformSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writePlatformSettingsCache(settings) {
  const normalized = normalizePlatformSettings(settings);
  localStorage.setItem(PLATFORM_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
