import { validationErrorHandler } from "../../../middleware/validation-handler.js";
import { param } from "express-validator";
export const roomIdParamValidation = [
  param("roomId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Room id must be a positive integer")
    .toInt(),
  validationErrorHandler,
];