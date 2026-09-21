// RAG controllers. A controller reads the request, calls one service and
// sends the JSON reply. Errors go to next(error).
//
// Write your controller between your own markers and use "export const".
// Imports: add them below, one per line. On a merge conflict in the imports,
// keep BOTH lines.
import { createDocumentFromUploadService } from "../service/rag.service.js";

import fs from "node:fs/promises";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../../../utility/errors/errors.js";
import { assertOwnedDocument } from "../service/rag.service.js";
import { createDocumentFromUploadService } from "../service/rag.service.js";
import { deleteDocumentService } from "../service/rag.service.js";
import { getDocumentMetaService } from "../service/rag.service.js";
import { listDocumentsForUserService } from "../service/rag.service.js";
import { queryDocumentService } from "../service/rag.service.js";
import { resolveDocumentAbsolutePath } from "../service/rag.service.js";
import { searchInDocumentService } from "../service/rag.service.js";

// ---- T-22 (Yabets): createDocumentController ----
/**
 * Handles uploading a PDF and building its chunk embeddings.
 */
export const createDocumentController = async (req, res, next) => {
  try {
    const { document } = await createDocumentFromUploadService({
      userId: req.user.id,
      file: req.file,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Document uploaded and processed.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};
// ---- end T-22 ----

// ---- T-24a (Natinael): listDocumentsController ----
/**
 * Handles listing the authenticated user's documents, newest first.
 */
export const listDocumentsController = async (req, res, next) => {
  try {
    const data = await listDocumentsForUserService(req.user.id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Documents fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};
// ---- end T-24a ----

// ---- T-24b (Haymanot Y.): getDocumentMetaController ----
// ---- end T-24b ----

// ---- T-24c (Wonde): getDocumentFileController ----
// ---- end T-24c ----

// ---- T-23a (Abel): searchInDocumentController ----
export const searchInDocumentController = async (req, res, next) => {
  try {
    const data = await searchInDocumentService({
      documentId: req.params.documentId,
      userId: req.user.id,
      query: req.query.query,
      k: req.query.k ? Number(req.query.k) : 5,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ranked chunk excerpts",
      data,
    });
  } catch (error) {
    next(error);
  }
};
// ---- end T-23a ----

// ---- T-23b (Desalew): queryDocumentController ----
// ---- end T-23b ----

// ---- T-24d (Haymanot B.): deleteDocumentController ----
// ---- end T-24d ----
