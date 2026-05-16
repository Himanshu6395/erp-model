import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { readPlatformSettingsCache } from "./platformSettingsCache";
import { DEFAULT_PLATFORM_SETTINGS } from "../theme/platformSettingsConstants";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export function getPlatformTimezone() {
  return readPlatformSettingsCache()?.timezone || DEFAULT_PLATFORM_SETTINGS.timezone;
}

export function formatPlatformDate(value, format) {
  if (!value) return "—";
  const fmt = format || readPlatformSettingsCache()?.dateFormat || DEFAULT_PLATFORM_SETTINGS.dateFormat;
  const tz = getPlatformTimezone();
  const d = dayjs(value);
  if (!d.isValid()) return "—";
  return d.tz(tz).format(fmt.replace(/YYYY/g, "YYYY").replace(/DD/g, "DD").replace(/MM/g, "MM"));
}

export function formatPlatformDateTime(value) {
  if (!value) return "—";
  const fmt = readPlatformSettingsCache()?.dateFormat || DEFAULT_PLATFORM_SETTINGS.dateFormat;
  const tz = getPlatformTimezone();
  const d = dayjs(value);
  if (!d.isValid()) return "—";
  return d.tz(tz).format(`${fmt} HH:mm`);
}

export { dayjs };
