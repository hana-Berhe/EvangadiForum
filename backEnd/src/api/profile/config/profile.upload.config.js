import path from "node:path";
import multer from "multer";
import { BadRequestError } from "../../../utility/errors/errors.js";

// Keep upload config easy to override per environment while preserving the same
// profile-photo storage path across local dev and deployed environments.
export const PROFILE_UPLOAD_DIR =
  process.env.PROFILE_UPLOAD_DIR || "uploads/profiles";
export const PROFILE_MAX_UPLOAD_MB =
  Number(process.env.PROFILE_MAX_UPLOAD_MB) || 2;

// Keep the uploaded image in memory: the service saves it in MySQL
// (user_avatars), not on disk. A server's disk on free hosting (Render) is
// wiped on every restart, so files saved there would disappear.
const storage = multer.memoryStorage();

// Profile uploads are intentionally restricted to a single image file with strict
// size and MIME limits to keep the profile feature safe and predictable.
export const profileUpload = multer({
  storage,
  limits: { fileSize: PROFILE_MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    const allowedMime = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname || "").toLowerCase();
    const allowed =
      allowedMime.includes(file.mimetype) && allowedExt.includes(ext);

    cb(
      allowed
        ? null
        : new BadRequestError(
            "Only JPG, PNG, and WebP images are allowed. Maximum size is 2MB.",
          ),
      allowed,
    );
  },
});

// Turn Multer errors into the app's standard BadRequestError responses so the API
// returns consistent validation messages for both invalid files and wrong field names.
export const createProfileMulterErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        new BadRequestError(
          `The image is larger than the ${PROFILE_MAX_UPLOAD_MB}MB limit.`,
        ),
      );
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return next(new BadRequestError("Send the image in a field named 'avatar'."));
    }

    return next(new BadRequestError(error.message));
  }

  return next(error);
};
