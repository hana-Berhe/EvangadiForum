import { StatusCodes } from "http-status-codes";
import {
  getAvatarImageService,
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

export const getAvatarImageController = async (req, res, next) => {
  try {
    const avatar = await getAvatarImageService(req.params.id);
    if (!avatar) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        msg: "This user has no profile photo.",
      });
    }

    res.set({
      "Content-Type": avatar.mimeType,
      // Never let a browser treat the bytes as anything but this image type.
      "X-Content-Type-Options": "nosniff",
      // The URL changes (?v=) on every upload, so caching for a day is safe.
      "Cache-Control": "public, max-age=86400",
      // Lets the frontend (another domain, e.g. Vercel) show the image.
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(avatar.image);
  } catch (error) {
    next(error);
  }
};
