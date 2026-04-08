/**
 * Central API origin (no trailing slash). Toggle USE_LOCAL for laptop vs deployment.
 * All HTTP clients should use BASE_URL — do not hardcode hosts elsewhere.
 */
const LOCAL_API = "http://localhost:5000";
const PROD_API = "https://43.205.113.119";

// Toggle this before deployment
const USE_LOCAL = true;

export const BASE_URL = USE_LOCAL ? LOCAL_API : PROD_API;

// Debug log
console.log("Using API:", BASE_URL);
