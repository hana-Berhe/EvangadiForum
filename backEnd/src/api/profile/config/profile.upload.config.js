import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { BadRequestError } from "../../../utility/errors/errors.js";

// Keep upload config easy to override per environment while preserving the same
// profile-photo storage path across local dev and deployed environments.
export const PROFILE_UPLOAD_DIR =
  process.env.PROFILE_UPLOAD_DIR || "uploads/profiles";
export const PROFILE_MAX_UPLOAD_MB =
  Number(process.env.PROFILE_MAX_UPLOAD_MB) || 1;

// Store each user's uploaded image under a dedicated folder so files are isolated
// by owner and old images can be safely removed when a profile is replaced.
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.resolve(PROFILE_UPLOAD_DIR, String(req.user.id));
    fs.mkdir(dir, { recursive: true }, (error) => cb(error, dir));
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname || ".jpg").toLowerCase();
    // Use a timestamp + random suffix so users can re-upload without collisions and
    // no server-generated name leaks the original filename.
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;
    cb(null, fileName);
  },
});

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
            "Only JPG, PNG, and WebP images are allowed. Maximum size is 1MB.",
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
