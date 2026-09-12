import express from "express";
import { authRouter } from "./api/auth/routes/auth.routes.js";
import { answerRouter } from "./api/answer/routes/answer.routes.js";

export const mainRouter = express.Router();

// /api/auth
mainRouter.use("/auth", authRouter);
// api answers
mainRouter.use("/answers", answerRouter);