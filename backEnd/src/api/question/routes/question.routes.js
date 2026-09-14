import express from "express";
const questionRouter = express.Router();
import { createQuestionController, searchQuestionsSemanticController,getSingleQuestionController } from "../controller/question.controller.js";
import { createQuestionValidation, searchQuestionsSemanticValidation,getSingleQuestionValidation } from "../validations/question.validation.js";

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

// export { questionRouter }; syntax repetition found here

import { createQuestionController } from "../controller/question.controller.js";
import { createQuestionValidation } from "../validations/question.validation.js";
import { generateQuestionDraftCoachController } from "../controller/question.controller.js";
import { generateQuestionDraftCoachValidation } from "../validations/question.validation.js";
// import { authenticateUser } from "../../../middleware/authentication.js";


// const questionRouter = express.Router(); syntax error solved here
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
export { questionRouter };
