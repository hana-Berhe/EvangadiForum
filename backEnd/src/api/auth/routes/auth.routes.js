import express from "express";
const authRouter = express.Router();
import {
  registerController,
  loginController,
  logoutController,
  meController,
} from "../controller/auth.controller.js";
import {
  registerValidation,
  loginValidation,
} from "../validations/auth.validation.js";
import { authRateLimit } from "../../../middleware/auth-rate-limit.js";
import { authenticateUser } from "../../../middleware/authentication.js";

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post(
  "/register",
  authRateLimit,
  registerValidation,
  registerController,
);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and set the auth cookie
 * @access Public
 */
authRouter.post("/login", authRateLimit, loginValidation, loginController);

/**
 * @route POST /api/auth/logout
 * @desc Clear the auth cookie
 * @access Public
 */
authRouter.post("/logout", logoutController);

/**
 * @route GET /api/auth/me
 * @desc Return the logged-in user
 * @access Private
 */
authRouter.get("/me", authenticateUser, meController);

export { authRouter };
