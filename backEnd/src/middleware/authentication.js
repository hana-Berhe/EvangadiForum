import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../utility/errors/errors.js";
import { AUTH_COOKIE_NAME } from "../utility/authCookie.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

function tokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

const authenticateUser = (req, res, next) => {
  // Cookie first (new way), Authorization header second (old way, during the switch)
  const candidates = [
    req.cookies?.[AUTH_COOKIE_NAME],
    tokenFromHeader(req),
  ].filter(Boolean);

  for (const token of candidates) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: payload.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
      return next();
    } catch {
      // token invalid or expired: try the next one
    }
  }

  throw new UnauthenticatedError("Authentication invalid");
};

export { authenticateUser };
