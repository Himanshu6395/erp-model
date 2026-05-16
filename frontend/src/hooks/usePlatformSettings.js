import { useSelector } from "react-redux";
import { formatPlatformCurrency, formatPlatformDate, formatPlatformDateTime } from "../utils/platformFormat";

export function usePlatformSettings() {
  const settings = useSelector((s) => s.platformSettings.settings);
  const saving = useSelector((s) => s.platformSettings.saving);
  const loading = useSelector((s) => s.platformSettings.loading);

  return {
    settings,
    saving,
    loading,
    formatDate: formatPlatformDate,
    formatDateTime: formatPlatformDateTime,
    formatCurrency: formatPlatformCurrency,
  };
}
