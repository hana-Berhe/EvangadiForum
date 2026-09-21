// RAG upload settings (multer): PDF only, size limit, where files are saved.
// Settings come from .env: RAG_UPLOAD_DIR and RAG_MAX_UPLOAD_MB.
// The uploads/ folder is already in .gitignore. Never commit uploaded files.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { BadRequestError } from "../../../utility/errors/errors.js";

// ---- T-22 (Yabets): ragUpload, createDocumentMulterErrorHandler ----
export const RAG_UPLOAD_DIR = process.env.RAG_UPLOAD_DIR || "uploads/rag";
export const RAG_MAX_UPLOAD_MB = Number(process.env.RAG_MAX_UPLOAD_MB) || 10;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // One folder per user keeps storage_path values short and unambiguous.
    const dir = path.resolve(RAG_UPLOAD_DIR, String(req.user.id));
    fs.mkdir(dir, { recursive: true }, (error) => cb(error, dir));
  },
  filename(req, file, cb) {
    // Never trust the client's filename on disk: the original is kept in the
    // title column instead.
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.pdf`);
  },
});

export const ragUpload = multer({
  storage,
  limits: { fileSize: RAG_MAX_UPLOAD_MB * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    const isPdf =
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf";

    cb(
      isPdf ? null : new BadRequestError("Only PDF files can be uploaded."),
      isPdf,
    );
  },
});

/**
 * Multer reports its own failures (size limit, wrong field name) by throwing
 * before any controller runs. Translate them into the app's error shape so the
 * client gets { msg } like everywhere else.
 */
export const createDocumentMulterErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        new BadRequestError(
          `The PDF is larger than the ${RAG_MAX_UPLOAD_MB}MB limit.`,
        ),
      );
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return next(new BadRequestError("Send the PDF in a field named 'file'."));
    }

    return next(new BadRequestError(error.message));
  }

  return next(error);
};
// ---- end T-22 ----
