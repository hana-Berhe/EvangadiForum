import { StatusCodes } from "http-status-codes";
import {
  getUserProfileService,
  updateUserProfileService,
} from "../service/profile.service.js";

export const getUserProfileController = async (req, res, next) => {
  try {
    const profile = await getUserProfileService(req.params.id, req.user.id);

    res.status(StatusCodes.OK).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileController = async (req, res, next) => {
  try {
    const updatedProfile = await updateUserProfileService({
      requestedUserId: req.params.id,
      currentUserId: req.user.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bio: req.body.bio,
      file: req.file,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};
