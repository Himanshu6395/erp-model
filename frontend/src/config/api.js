/**
 * Central API origin (no trailing slash). Toggle USE_LOCAL for laptop vs deployment.
 * All HTTP clients should use BASE_URL — do not hardcode hosts elsewhere.
 */
const LOCAL_API = "http://localhost:5000";
const PROD_API = "https://ju2i87i4x6.execute-api.ap-south-1.amazonaws.com";

// Toggle this before deployment
const USE_LOCAL =true;

export const BASE_URL = USE_LOCAL ? LOCAL_API : PROD_API;

// Debug log
console.log("Using API:", BASE_URL);
