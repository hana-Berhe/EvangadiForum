import express from "express";
import { authRouter } from "./api/auth/routes/auth.routes.js";
import { questionRouter } from "./api/question/routes/question.routes.js";
import { answerRouter } from "./api/answer/routes/answer.routes.js";

export const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/questions", questionRouter);
mainRouter.use("/answers", answerRouter);