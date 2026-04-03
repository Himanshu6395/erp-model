const DEFAULT_API_PORT = import.meta.env.VITE_API_PORT || "5000";

/**
 * Backend origin (scheme + host + port, no trailing slash).
 *
 * 1. If `VITE_API_URL` is set in `frontend/.env`, that value wins (force override).
 * 2. Otherwise in the browser: same hostname as the page + port 5000 (or VITE_API_PORT).
 *    So opening `http://192.168.1.5:5173` or `http://43.205.x.x:80` calls the API on that
 *    host at :5000 — fixes mobile, which cannot reach `localhost` on your laptop.
 * 3. Page on localhost / 127.0.0.1 → `http://localhost:<port>`.
 */
export function getApiOrigin() {
  const explicit = import.meta.env.VITE_API_URL;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim().replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    throw new Error(
      "VITE_API_URL is not set and there is no window (SSR). Set VITE_API_URL in frontend/.env."
    );
  }

  const { protocol, hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }

  return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
}

/** Base URL for REST routes mounted at `/api` on the backend */
export function getApiBaseUrl() {
  return `${getApiOrigin()}/api`;
}
