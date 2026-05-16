import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/useAuth";
import { roles } from "../utils/roleUtils";
import { fetchSchoolAdminSettings } from "../store/schoolAdminSettingsSlice";
import { readSchoolBrandingCache } from "../utils/schoolBrandingCache";
import { applySchoolBranding } from "../theme/applySchoolBranding";

export default function SchoolAdminSettingsHydrator({ children }) {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const cached = readSchoolBrandingCache();
    if (cached) applySchoolBranding(cached);
    if (isAuthenticated && user?.role === roles.SCHOOL_ADMIN) {
      dispatch(fetchSchoolAdminSettings());
    }
  }, [dispatch, isAuthenticated, user?.role]);

  return children;
}
