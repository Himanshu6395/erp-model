import { useSelector } from "react-redux";
import { roles } from "../utils/roleUtils";
import { useAuth } from "../context/useAuth";
import { usePlatformSettings } from "./usePlatformSettings";
import { readSchoolBrandingCache } from "../utils/schoolBrandingCache";
import { DEFAULT_SCHOOL_BRANDING } from "../theme/schoolBrandingConstants";

export function useSchoolBranding() {
  const { user } = useAuth();
  const school = useSelector((s) => s.schoolAdminSettings.data?.school);
  const platform = usePlatformSettings();

  const isSchoolAdmin = user?.role === roles.SCHOOL_ADMIN;
  const cached = readSchoolBrandingCache();

  if (isSchoolAdmin && (school || cached)) {
    const s = school || cached || DEFAULT_SCHOOL_BRANDING;
    return {
      displayName: s.schoolName,
      logoUrl: s.logoUrl,
      faviconUrl: s.faviconUrl,
      isSchool: true,
    };
  }

  return {
    displayName: platform.settings.platformName,
    logoUrl: platform.settings.logoUrl,
    faviconUrl: platform.settings.faviconUrl,
    isSchool: false,
  };
}
