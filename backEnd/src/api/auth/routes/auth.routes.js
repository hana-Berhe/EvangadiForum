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

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/register", registerValidation, registerController);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
authRouter.post("/login", loginValidation, loginController);