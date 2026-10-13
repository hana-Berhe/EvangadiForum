/**
 * Turns the TRUST_PROXY setting into a value for Express's "trust proxy".
 *
 * Express uses it to work out the visitor's real IP (req.ip) from the
 * X-Forwarded-For header. If the number is wrong, req.ip becomes one of
 * Vercel's or Render's own servers, and the per-IP login limit stops working.
 *
 *   "2"            -> 2      trust the last 2 proxies (the default)
 *   "true"/"false" -> true / false
 *   anything else  -> kept as text, e.g. "loopback" or a list of IP ranges
 *
 * @param {string|undefined} value - process.env.TRUST_PROXY
 * @param {number} [fallback=2] - Used when the setting is missing or empty.
 * @returns {number|boolean|string}
 */
export function parseTrustProxy(value, fallback = 2) {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  if (/^\d+$/.test(text)) return Number(text);
  if (text === "true") return true;
  if (text === "false") return false;
  return text;
}
