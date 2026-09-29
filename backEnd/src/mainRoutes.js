import express from "express";
import { authRouter } from "./api/auth/routes/auth.routes.js";

import { answerRouter } from "./api/answer/routes/answer.routes.js";
import { questionRouter } from "./api/question/routes/question.routes.js";
import { ragRouter } from "./api/rag/routes/rag.routes.js";
import { chatRouter } from "./api/chat/routes/chat.routes.js";
import { roomRouter } from "./api/room/routes/room.routes.js";

export const mainRouter = express.Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/questions", questionRouter);
mainRouter.use("/answers", answerRouter);
mainRouter.use("/rag", ragRouter);
mainRouter.use("/chat", chatRouter);
mainRouter.use("/rooms", roomRouter);
