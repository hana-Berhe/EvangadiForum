import { body, param } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

export const profileIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Valid user ID is required."),
  validationErrorHandler,
];

export const updateProfileValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters."),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters."),
  body("bio")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must be 500 characters or fewer."),
  validationErrorHandler,
];
