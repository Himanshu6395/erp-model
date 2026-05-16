import { CURRENCY_SYMBOLS, DEFAULT_PLATFORM_SETTINGS } from "../theme/platformSettingsConstants";
import { readPlatformSettingsCache } from "./platformSettingsCache";
import { formatPlatformDate, formatPlatformDateTime } from "./dayjsConfig";

export function getCurrencySymbol(currency) {
  const code = currency || readPlatformSettingsCache()?.currency || DEFAULT_PLATFORM_SETTINGS.currency;
  return CURRENCY_SYMBOLS[code] || code;
}

export function formatPlatformCurrency(amount, currency) {
  const code = currency || readPlatformSettingsCache()?.currency || DEFAULT_PLATFORM_SETTINGS.currency;
  const symbol = getCurrencySymbol(code);
  const num = Number(amount);
  if (Number.isNaN(num)) return `${symbol} 0`;
  return `${symbol} ${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export { formatPlatformDate, formatPlatformDateTime };
