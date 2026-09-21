import { body } from "express-validator";
import { param } from "express-validator";
import { query } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

// ---- T-24b (Haymanot Y.): documentIdParamValidation (shared by 4 tasks) ----
// Shared by T-24b, T-24c and T-24d: the routes that only take :documentId.
export const documentIdParamValidation = [
  param("documentId")
    .isInt({ min: 1 })
    .withMessage("Document id must be a positive integer")
    .toInt(),
  validationErrorHandler,
];