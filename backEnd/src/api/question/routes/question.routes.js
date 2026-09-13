import express from "express";
const questionRouter = express.Router();
import { createQuestionController } from "../controller/question.controller.js";
import { createQuestionValidation } from "../validations/question.validation.js";
import { authenticateUser } from "../../../middleware/authentication.js";

/**
 * @route POST /api/questions
 * @desc Post a new question
 * @access Protected
 */
questionRouter.post(
  "/",
  authenticateUser,
  createQuestionValidation,
  createQuestionController,
);

export { questionRouter };
