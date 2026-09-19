import express from "express";
import { authRouter } from "./api/auth/routes/auth.routes.js";

import { answerRouter } from "./api/answer/routes/answer.routes.js";
import { questionRouter } from "./api/question/routes/question.routes.js";
import { ragRouter } from "./api/rag/routes/rag.routes.js";

export const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/questions", questionRouter);
mainRouter.use("/answers", answerRouter);
mainRouter.use("/rag", ragRouter);
