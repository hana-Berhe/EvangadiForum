import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { registerService, loginService } from "../service/auth.service.js";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
} from "../../../utility/authCookie.js";

/**
 * Stores the JWT in an httpOnly cookie that expires together with the token.
 *
 * @param {import('express').Response} res
 * @param {string} token
 */
function setAuthCookie(res, token) {
  const { exp } = jwt.decode(token);
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...authCookieOptions,
    maxAge: exp * 1000 - Date.now(),
  });
}

/**
 * Handles user registration requests.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const registerController = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const newUser = await registerService({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully.",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles user login requests.
 * Sets the token as an httpOnly cookie. The token is still returned in the
 * JSON during the switch; remove it once the frontend no longer reads it.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const authResult = await loginService({ email, password });

    setAuthCookie(res, authResult.token);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful.",
      data: {
        user: authResult.user,
        token: authResult.token, // TEMPORARY: remove in the final step
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles logout requests by clearing the auth cookie.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const logoutController = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logged out.",
  });
};

/**
 * Returns the logged-in user, based on the auth cookie (or header).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const meController = (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    data: req.user,
  });
};

export { registerController, loginController, logoutController, meController };
