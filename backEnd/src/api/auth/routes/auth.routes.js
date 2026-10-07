import express from "express";
const authRouter = express.Router();
import {
  registerController,
  loginController,
} from "../controller/auth.controller.js";
import {
  registerValidation,
  loginValidation,
} from "../validations/auth.validation.js";
import { authRateLimit } from "../../../middleware/auth-rate-limit.js";

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/register", authRateLimit, registerValidation, registerController);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
authRouter.post("/login", authRateLimit, loginValidation, loginController);
export { authRouter };


import {
  registerController,
  loginController,
  logoutController,
} from "../controller/auth.controller.js";

// ...existing register and login routes...

/**
 * @route POST /api/auth/logout
 * @desc Clear the auth cookie
 * @access Public
 */
authRouter.post("/logout", logoutController);