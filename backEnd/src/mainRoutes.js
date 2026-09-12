import express from "express";
import { authRouter } from "./api/auth/routes/auth.routes.js";

export const mainRouter = express.Router();

// /api/auth
mainRouter.use("/auth", authRouter);
