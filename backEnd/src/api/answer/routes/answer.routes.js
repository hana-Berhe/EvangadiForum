import express from "express";

import {
  createAnswerController
} from "../controller/answer.controller.js";

import {
  createAnswerValidation
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

export { answerRouter };