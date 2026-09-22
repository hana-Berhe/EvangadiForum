import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { createDocumentController } from "../controller/rag.controller.js";
import { deleteDocumentController } from "../controller/rag.controller.js";
import { getDocumentFileController } from "../controller/rag.controller.js";
import { getDocumentMetaController } from "../controller/rag.controller.js";
import { listDocumentsController } from "../controller/rag.controller.js";
import { queryDocumentController } from "../controller/rag.controller.js";
import { searchInDocumentController } from "../controller/rag.controller.js";
import { documentIdParamValidation } from "../validations/rag.validation.js";
import { queryDocumentValidation } from "../validations/rag.validation.js";
import { searchInDocumentValidation } from "../validations/rag.validation.js";
import { createDocumentMulterErrorHandler } from "../config/rag.upload.config.js";
import { ragUpload } from "../config/rag.upload.config.js";

const ragRouter = express.Router();

// Every document belongs to one user, so nothing here is public.
ragRouter.use(authenticateUser);

// ---- T-22 (Yabets): POST /documents ----
/**
 * @route POST /api/rag/documents
 * @desc Upload a PDF, chunk it, and embed every chunk
 * @access Protected
 */

ragRouter.post(
  "/documents",
  ragUpload.single("file"),
  createDocumentMulterErrorHandler,
  createDocumentController,
);
// ---- end T-22 ----

// ---- T-24a (Natinael): GET /documents ----
/**
 * @route GET /api/rag/documents
 * @desc List the authenticated user's documents, newest first
 * @access Protected
 */

ragRouter.get("/documents", listDocumentsController);
// ---- end T-24a ----

// ---- T-23a (Abel): GET /documents/:documentId/search ----
/**
 * @route GET /api/rag/documents/:documentId/search
 * @desc Rank this document's chunks against a query
 * @access Protected
 */
ragRouter.get(
  "/documents/:documentId/search",
  searchInDocumentValidation,
  searchInDocumentController,
);
// ---- end T-23a ----

// ---- T-24c (Wonde): GET /documents/:documentId/file ----
/**
 * @route GET /api/rag/documents/:documentId/file
 * @desc Stream the stored PDF for inline preview
 * @access Protected
 */
ragRouter.get(
  "/documents/:documentId/file",
  documentIdParamValidation,
  getDocumentFileController,
);
// ---- end T-24c ----

// ---- T-23b (Desalew): POST /documents/:documentId/query ----
/**
 * @route POST /api/rag/documents/:documentId/query
 * @desc Answer a question using only this document's text
 * @access Protected
 */
ragRouter.post(
  "/documents/:documentId/query",
  queryDocumentValidation,
  queryDocumentController,
);
// ---- end T-23b ----

// ---- T-24b (Haymanot Y.): GET /documents/:documentId ----
/**
 * @route GET /api/rag/documents/:documentId
 * @desc Processing status and metadata for one document
 * @access Protected
 */
ragRouter.get(
  "/documents/:documentId",
  documentIdParamValidation,
  getDocumentMetaController,
);
// ---- end T-24b ----

// ---- T-24d (Haymanot B.): DELETE /documents/:documentId ----
/**
 * @route DELETE /api/rag/documents/:documentId
 * @desc Remove the document, its file, and its chunks
 * @access Protected
 */
ragRouter.delete(
  "/documents/:documentId",
  documentIdParamValidation,
  deleteDocumentController,
);
// ---- end T-24d ----

export { ragRouter };
