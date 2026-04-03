/**
 * Backend origin (scheme + host + port, no trailing slash).
 * Set `VITE_API_URL` in `frontend/.env` (one active line: local or production).
 */
export function getApiOrigin() {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error(
      "VITE_API_URL is not set. Add it to frontend/.env (see comments in that file)."
    );
  }
  return raw.trim().replace(/\/$/, "");
}

/** Base URL for REST routes mounted at `/api` on the backend */
export function getApiBaseUrl() {
  return `${getApiOrigin()}/api`;
}
