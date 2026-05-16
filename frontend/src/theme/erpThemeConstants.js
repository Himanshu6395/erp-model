export const ERP_THEME_STORAGE_KEY = "erp_platform_theme_v1";

export const DEFAULT_ERP_THEME = {
  mode: "light",
  sidebarColor: "#111827",
  headerColor: "#ffffff",
  primaryColor: "#2563eb",
  fontSize: "medium",
  borderRadius: "medium",
};

export const FONT_SIZE_MAP = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

export const BORDER_RADIUS_MAP = {
  small: "8px",
  medium: "12px",
  large: "16px",
};

export function normalizeErpTheme(theme = {}) {
  return {
    mode: theme.mode === "dark" ? "dark" : "light",
    sidebarColor: theme.sidebarColor || DEFAULT_ERP_THEME.sidebarColor,
    headerColor: theme.headerColor || DEFAULT_ERP_THEME.headerColor,
    primaryColor: theme.primaryColor || DEFAULT_ERP_THEME.primaryColor,
    fontSize: FONT_SIZE_MAP[theme.fontSize] ? theme.fontSize : "medium",
    borderRadius: BORDER_RADIUS_MAP[theme.borderRadius] ? theme.borderRadius : "medium",
  };
}
