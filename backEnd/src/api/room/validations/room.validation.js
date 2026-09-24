
import { param } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";
// "React   Study  Group" and "React Study Group" must be the same name.
// [Rooms B - Haymanot Y.] Room name cleanup + create validation.
const collapseSpaces = (value) => value.replace(/\s+/g, " ").trim();

export const createRoomValidation = [
  // bail() stops at the first problem, so the user gets one clear message.
  body("name")
    .exists()
    .withMessage("Room name is required")
    .bail()
    .isString()
    .withMessage("Room name must be text")
    .bail()
    .customSanitizer(collapseSpaces)
    .notEmpty()
    .withMessage("Room name is required")
    .bail()
    .isLength({ max: 60 })
    .withMessage("Room name must be 60 characters or less"),
  // The description is optional. null, "" and a missing field all mean "none".
  body("description")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Description must be text")
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must be 255 characters or less"),
  validationErrorHandler,
];


export const roomIdParamValidation = [
  param("roomId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Room id must be a positive integer")
    .toInt(),
  validationErrorHandler,
];