import { body, param, query } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";


const createQuestionValidation = []// here is unfinished code,
/** Same body rules as posting a question — AI coach only reads draft text. */
const generateQuestionDraftCoachValidation = [
  body("title")
    .notEmpty()
    .withMessage("Question title is required")
    .isString()
    .withMessage("Question title must be a string")
    .isLength({ min: 5, max: 255 })
    .withMessage("Question title must be between 5 and 255 characters")
    .trim(),
  body("content")
    .notEmpty()
    .withMessage("Question content is required")
    .isString()
    .withMessage("Question content must be a string")
    .isLength({ min: 10 })
    .withMessage("Question content must be at least 10 characters")
    .trim(),
  validationErrorHandler,
];

export const searchQuestionsSemanticValidation = [
  query("query")
    .notEmpty()
    .withMessage("query is required")
    .isString()
    .withMessage("query must be a string")
    .isLength({ min: 5 })
    .withMessage("query must be at least 5 characters")
    .trim(),
  query("k")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("k must be between 1 and 20")
    .toInt(),
  query("threshold")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("threshold must be between 0 and 1")
    .toFloat(),
  validationErrorHandler,
];

export {
  createQuestionValidation,
};
export { generateQuestionDraftCoachValidation };
const createQuestionValidation = [
  body("title")
    .notEmpty()
    .withMessage("Question title is required")
    .isString()
    .withMessage("Question title must be a string")
    .isLength({ min: 5, max: 255 })
    .withMessage("Question title must be between 5 and 255 characters")
    .trim(),
  body("content")
    .notEmpty()
    .withMessage("Question content is required")
    .isString()
    .withMessage("Question content must be a string")
    .isLength({ min: 10 })
    .withMessage("Question content must be at least 10 characters")
    .trim(),
  validationErrorHandler,
];

export { createQuestionValidation, generateQuestionDraftCoachValidation };
