import { writePlatformSettingsCache } from "../utils/platformSettingsCache";

function setFavicon(href) {
  const defaultHref = "/vite.svg";
  const targets = ["icon", "shortcut icon", "apple-touch-icon"];
  targets.forEach((rel) => {
    let link = document.querySelector(`link[rel='${rel}']`);
    if (!href) {
      if (link) link.setAttribute("href", defaultHref);
      return;
    }
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
    if (rel === "icon") link.type = href.startsWith("data:image/svg") ? "image/svg+xml" : "image/png";
  });
}

function shadeColor(hex, percent) {
  const raw = String(hex || "").replace("#", "");
  if (raw.length !== 6) return hex;
  const n = parseInt(raw, 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const r = Math.round((t - ((n >> 16) & 255)) * p + ((n >> 16) & 255));
  const g = Math.round((t - ((n >> 8) & 255)) * p + ((n >> 8) & 255));
  const b = Math.round((t - (n & 255)) * p + (n & 255));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function applyPlatformSettings(settings) {
  const s = writePlatformSettingsCache(settings);
  const root = document.documentElement;

  document.title = s.platformName || "School ERP";
  setFavicon(s.faviconUrl);

  const primary = s.primaryColor || "#2563eb";
  root.style.setProperty("--erp-primary", primary);
  root.style.setProperty("--erp-primary-hover", shadeColor(primary, -12));
  root.style.setProperty("--erp-primary-light", shadeColor(primary, 35));
  root.dataset.erpCurrency = s.currency;
  root.dataset.erpTimezone = s.timezone;
  root.dataset.erpDateFormat = s.dateFormat;
  root.dataset.erpPlatformName = s.platformName;

  return s;
}
