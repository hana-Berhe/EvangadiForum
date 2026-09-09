import express from "express";
import authRoutes from "./auth/routes/auth.routes.js";
import questionsRoutes from "./question/routes/question.routes.js";

export const mainRouter = express.Router();

// /api/auth
mainRouter.use("/auth", authRoutes);

//  /api/questions
mainRouter.use("/questions", questionsRoutes);
