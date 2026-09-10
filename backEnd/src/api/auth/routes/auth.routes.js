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