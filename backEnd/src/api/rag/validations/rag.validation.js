import { body } from "express-validator";
import { param } from "express-validator";
import { query } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

// ---- T-24b (Haymanot Y.): documentIdParamValidation (shared by 4 tasks) ----
export const documentIdParamValidation = [
  param("documentId")
    .isInt({ min: 1 })
    .withMessage("Document id must be a positive integer")
    .toInt(),
  validationErrorHandler,
];

// searchInDocumentValidation ----
export const searchInDocumentValidation = [
  param("documentId")
    .isInt({ min: 1 })
    .withMessage("Document id must be a positive integer")
    .toInt(),
  query("query")
    .trim()
    .notEmpty()
    .withMessage("query is required")
    .isString()
    .withMessage("query must be a string")
    .isLength({ min: 3 })
    .withMessage("query must be at least 3 characters"),
  query("k")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("k must be between 1 and 20")
    .toInt(),
  validationErrorHandler,
];
export const queryDocumentValidation = [
  param("documentId")
    .isInt({ min: 1 })
    .withMessage("Document id must be a positive integer")
    .toInt(),
  body("query")
    .trim()
    .notEmpty()
    .withMessage("query is required")
    .isString()
    .withMessage("query must be a string")
    .isLength({ min: 3 })
    .withMessage("query must be at least 3 characters"),
  validationErrorHandler,
];
