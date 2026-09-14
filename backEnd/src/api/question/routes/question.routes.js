import express from "express";
const questionRouter = express.Router();
import { createQuestionController, searchQuestionsSemanticController } from "../controller/question.controller.js";
import { createQuestionValidation, searchQuestionsSemanticValidation } from "../validations/question.validation.js";
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
import { generateQuestionDraftCoachController } from "../controller/question.controller.js";
import { generateQuestionDraftCoachValidation } from "../validations/question.validation.js";
// import { authenticateUser } from "../../../middleware/authentication.js";


// const questionRouter = express.Router(); syntax error solved here
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



 export { questionRouter };
