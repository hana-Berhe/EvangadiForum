import express from "express";
import { authRouter } from "./api/auth/routes/auth.routes.js";
import { answerRouter } from "./api/answer/routes/answer.routes.js";
import { questionRouter } from "./api/question/routes/question.routes.js";

export const mainRouter = express.Router();

// /api/auth
mainRouter.use("/auth", authRouter);
// api answers
mainRouter.use("/answers", answerRouter);
mainRouter.use("/questions", questionRouter);