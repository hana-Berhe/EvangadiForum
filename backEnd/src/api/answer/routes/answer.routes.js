import express from "express";

import {
  createAnswerController,
  getAnswersController,
  updateAnswerController,
  deleteAnswerController,
} from "../controller/answer.controller.js";

import {
  createAnswerValidation,
  getAnswersValidation,
  answerIdValidation,
  updateAnswerValidation,
} from "../validations/answer.validation.js";

import { authenticateUser } from "../../../middleware/authentication.js";

const answerRouter = express.Router();

/**
 * @route POST /api/answers
 * @desc Post a new answer
 * @access Protected
 */
answerRouter.post(
  "/",
  authenticateUser,
  createAnswerValidation,
  createAnswerController,
);

/**
 * @route GET /api/answers
 * @desc Get answers for a question with pagination
 * @access Public
 */
answerRouter.get("/", getAnswersValidation, getAnswersController);

/**
 * @route PATCH /api/answers/:answerId
 * @desc Update an answer (author only)
 * @access Protected
 */
answerRouter.patch(
  "/:answerId",
  authenticateUser,
  answerIdValidation,
  updateAnswerValidation,
  updateAnswerController,
);

/**
 * @route DELETE /api/answers/:answerId
 * @desc Delete an answer (author only)
 * @access Protected
 */
answerRouter.delete(
  "/:answerId",
  authenticateUser,
  answerIdValidation,
  deleteAnswerController,
);

export { answerRouter };
