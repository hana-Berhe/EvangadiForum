// Settings for the login cookie. Login and logout both use these,
// so the cookie is always created and cleared the same way.

export const AUTH_COOKIE_NAME = "token";

export const authCookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read it
  secure: true, // only sent over HTTPS (browsers allow localhost too)
  sameSite: "lax", // blocks most cross-site request tricks
  path: "/",
};
