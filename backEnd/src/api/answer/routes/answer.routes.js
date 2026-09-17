import express from "express";

import {
  createAnswerController,
  getAnswersController,
} from "../controller/answer.controller.js";

import {
  createAnswerValidation,
  getAnswersValidation,
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

export { answerRouter };
