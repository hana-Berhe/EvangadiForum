import express from "express";
import {
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
