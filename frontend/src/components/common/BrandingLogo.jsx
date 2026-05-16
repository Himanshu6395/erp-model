import { GraduationCap } from "lucide-react";
import { useSchoolBranding } from "../../hooks/useSchoolBranding";

export default function BrandingLogo({ size = 40, className = "" }) {
  const { logoUrl, displayName } = useSchoolBranding();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={displayName || "Logo"}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600 ring-1 ring-brand-600/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <GraduationCap style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
