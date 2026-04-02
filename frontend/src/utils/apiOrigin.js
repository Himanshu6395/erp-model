/** Base origin for static files (e.g. /uploads) when API is mounted at /api */
export function getApiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  return base.replace(/\/api\/?$/, "") || "http://localhost:5000";
}

export function resolveUploadUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${getApiOrigin()}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
