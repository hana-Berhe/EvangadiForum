import { validationErrorHandler } from "../../../middleware/validation-handler.js";
import { param } from "express-validator";
export const roomIdParamValidation = [
  param("roomId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Room id must be a positive integer")
    .toInt(),
  validationErrorHandler,
];

// GET /api/admin/rooms?status=open|closed  (no status = every room)

export const adminRoomsQueryValidation = [
  query("status")
    .optional()
    .isIn(["open", "closed"])
    .withMessage("status must be open or closed"),
  validationErrorHandler,
];
