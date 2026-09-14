import express from "express";

import {
  createQuestionController,
  searchQuestionsSemanticController,
  getSingleQuestionController,
  generateQuestionDraftCoachController,
  assessAnswerAgainstQuestionController,
} from "../controller/question.controller.js";

import {
  createQuestionValidation,
  searchQuestionsSemanticValidation,
  getSingleQuestionValidation,
  generateQuestionDraftCoachValidation,
  assessAnswerAgainstQuestionValidation,
} from "../validations/question.validation.js";

import { authenticateUser } from "../../../middleware/authentication.js";

const questionRouter = express.Router();

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
// ---- T-10b ----  keep this LAST: /:questionHash matches any word
/**
 * @route GET /api/questions/:questionHash
 * @desc Get one question with answers
 * @access Private
 */
questionRouter.get(
  "/:questionHash",
  authenticateUser,
  getSingleQuestionValidation,
  getSingleQuestionController,
);

/**
 * @route GET /api/questions/search
 * @desc Semantic search for questions using vector embeddings based on a text query
 * @access Private
 */
questionRouter.get(
  "/search",
  authenticateUser,
  searchQuestionsSemanticValidation,
  searchQuestionsSemanticController,
);
/**
 export { questionRouter };
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
// ---- T-10b ----  keep this LAST: /:questionHash matches any word
/**
 * @route GET /api/questions/:questionHash
 * @desc Get one question with answers
 * @access Private
 */
questionRouter.get(
  "/:questionHash",
  authenticateUser,
  getSingleQuestionValidation,
  getSingleQuestionController,
);

/**
 * @route POST /api/questions/:questionHash/answer-fit
 * @desc AI relevance check for an answer draft vs the question
 * @access Private
 */
questionRouter.post(
  "/:questionHash/answer-fit",
  authenticateUser,
  assessAnswerAgainstQuestionValidation,
  assessAnswerAgainstQuestionController,
);

export { questionRouter };
