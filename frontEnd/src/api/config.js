// The backend address, taken from VITE_API_BASE_URL and cleaned up so small
// differences in how it is written cannot break the app:
//   "https://my-api.onrender.com/api"   ok
//   "https://my-api.onrender.com/api/"  ok (trailing slash removed)
//   "https://my-api.onrender.com"       ok ("/api" added)
// Vite reads this at BUILD time: after changing it on Vercel, redeploy.

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

export function normalizeApiBaseUrl(value) {
  let url = String(value || "").trim();
  if (!url) url = DEFAULT_API_BASE_URL;
  url = url.replace(/\/+$/, "");
  if (!/\/api$/.test(url)) url = `${url}/api`;
  return url;
}

/** For API calls, e.g. "https://my-api.onrender.com/api". */
export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
);

/** The server itself, for image links, e.g. "https://my-api.onrender.com". */
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
