import { BASE_URL } from "../config/api";

/** Base origin for static files (e.g. /uploads); same host as API, without /api */
export function getApiOrigin() {
  return BASE_URL;
}

export function resolveUploadUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${getApiOrigin()}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
