import express from "express";
import {
  getAvatarImageController,
  getUserProfileController,
  updateUserProfileController,
} from "../controller/profile.controller.js";
import {
  profileIdValidation,
  updateProfileValidation,
} from "../validations/profile.validation.js";
import { authenticateUser } from "../../../middleware/authentication.js";
import {
  createProfileMulterErrorHandler,
  profileUpload,
} from "../config/profile.upload.config.js";

const profileRouter = express.Router();

/**
 * @route GET /api/users/:id/avatar
 * @desc The user's profile photo (stored in MySQL)
 * @access Public, so <img> tags can load it
 */
profileRouter.get("/:id/avatar", profileIdValidation, getAvatarImageController);

profileRouter.get(
  "/:id",
  authenticateUser,
  profileIdValidation,
  getUserProfileController,
);

profileRouter.put(
  "/:id",
  authenticateUser,
  profileIdValidation,
  profileUpload.single("avatar"),
  createProfileMulterErrorHandler,
  updateProfileValidation,
  updateUserProfileController,
);

export { profileRouter };
