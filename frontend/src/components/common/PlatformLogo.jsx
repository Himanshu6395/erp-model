import { GraduationCap } from "lucide-react";
import { usePlatformSettings } from "../../hooks/usePlatformSettings";

export default function PlatformLogo({ size = 40, className = "", showFallbackIcon = true }) {
  const { settings } = usePlatformSettings();
  const src = settings.logoUrl;

  if (src) {
    return (
      <img
        src={src}
        alt={settings.platformName || "Platform logo"}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (!showFallbackIcon) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600 ring-1 ring-brand-600/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <GraduationCap style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
