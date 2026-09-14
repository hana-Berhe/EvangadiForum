import express from "express";

import { createQuestionController } from "../controller/question.controller.js";
import { createQuestionValidation } from "../validations/question.validation.js";
import { generateQuestionDraftCoachController } from "../controller/question.controller.js";
import { generateQuestionDraftCoachValidation } from "../validations/question.validation.js";
import { authenticateUser } from "../../../middleware/authentication.js";

const questionRouter = express.Router();
/**
 * @route POST /api/questions/draft-coach
 * @desc AI suggestions for a question draft (title + body)
 * @access Private
 */
questionRouter.post(
  "/draft-coach",
  authenticateUser,
  generateQuestionDraftCoachValidation,
  generateQuestionDraftCoachController,
);

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
