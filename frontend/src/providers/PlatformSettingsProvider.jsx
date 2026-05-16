import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { applyPlatformSettings } from "../theme/applyPlatformSettings";
import { readPlatformSettingsCache } from "../utils/platformSettingsCache";
import { loadPlatformSettings } from "../store/platformSettingsSlice";

export default function PlatformSettingsProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const cached = readPlatformSettingsCache();
    if (cached) applyPlatformSettings(cached);
    dispatch(loadPlatformSettings());
  }, [dispatch]);

  return children;
}
