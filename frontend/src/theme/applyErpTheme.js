import {
  BORDER_RADIUS_MAP,
  DEFAULT_ERP_THEME,
  ERP_THEME_STORAGE_KEY,
  FONT_SIZE_MAP,
  normalizeErpTheme,
} from "./erpThemeConstants";

function hexToRgb(hex) {
  const raw = String(hex || "").replace("#", "");
  if (raw.length !== 6) return null;
  const n = parseInt(raw, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function shadeColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const r = Math.round((t - rgb.r) * p + rgb.r);
  const g = Math.round((t - rgb.g) * p + rgb.g);
  const b = Math.round((t - rgb.b) * p + rgb.b);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function readStoredErpTheme() {
  try {
    const raw = localStorage.getItem(ERP_THEME_STORAGE_KEY);
    if (!raw) return null;
    return normalizeErpTheme(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistErpTheme(theme) {
  const normalized = normalizeErpTheme(theme);
  localStorage.setItem(ERP_THEME_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function applyErpTheme(theme) {
  const t = normalizeErpTheme(theme);
  const root = document.documentElement;
  const isDark = t.mode === "dark";
  const primary = t.primaryColor;
  const primaryHover = shadeColor(primary, -12);
  const primaryLight = shadeColor(primary, 35);
  const radius = BORDER_RADIUS_MAP[t.borderRadius] || BORDER_RADIUS_MAP.medium;
  const fontBase = FONT_SIZE_MAP[t.fontSize] || FONT_SIZE_MAP.medium;

  root.dataset.erpTheme = t.mode;
  root.style.setProperty("--erp-primary", primary);
  root.style.setProperty("--erp-primary-hover", primaryHover);
  root.style.setProperty("--erp-primary-light", primaryLight);
  root.style.setProperty("--erp-sidebar-bg", t.sidebarColor);
  root.style.setProperty("--erp-header-bg", t.headerColor);
  root.style.setProperty("--erp-font-size-base", fontBase);
  root.style.setProperty("--erp-border-radius", radius);
  root.style.setProperty("--erp-card-radius", radius);

  if (isDark) {
    root.style.setProperty("--erp-page-bg", "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)");
    root.style.setProperty("--erp-card-bg", "#1e293b");
    root.style.setProperty("--erp-card-border", "rgba(148,163,184,0.2)");
    root.style.setProperty("--erp-text-primary", "#f8fafc");
    root.style.setProperty("--erp-text-secondary", "#94a3b8");
    root.style.setProperty("--erp-input-bg", "#0f172a");
    root.style.setProperty("--erp-input-border", "rgba(148,163,184,0.35)");
    document.body.style.background = "#0f172a";
    document.body.style.color = "#f8fafc";
  } else {
    root.style.setProperty("--erp-page-bg", "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)");
    root.style.setProperty("--erp-card-bg", "#ffffff");
    root.style.setProperty("--erp-card-border", "rgba(15,23,42,0.08)");
    root.style.setProperty("--erp-text-primary", "#0f172a");
    root.style.setProperty("--erp-text-secondary", "#64748b");
    root.style.setProperty("--erp-input-bg", "#ffffff");
    root.style.setProperty("--erp-input-border", "rgba(15,23,42,0.12)");
    document.body.style.background = "#f3f4f6";
    document.body.style.color = "#111827";
  }

  return t;
}

export function resetErpTheme() {
  persistErpTheme(DEFAULT_ERP_THEME);
  return applyErpTheme(DEFAULT_ERP_THEME);
}
