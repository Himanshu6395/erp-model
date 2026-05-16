import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/useAuth";
import { roles } from "../utils/roleUtils";
import { fetchSuperAdminSettings } from "../store/superAdminSettingsSlice";

/** Loads super admin profile (avatar) from API when authenticated. */
export default function SuperAdminProfileHydrator({ children }) {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user?.role === roles.SUPER_ADMIN) {
      dispatch(fetchSuperAdminSettings());
    }
  }, [dispatch, isAuthenticated, user?.role]);

  return children;
}
