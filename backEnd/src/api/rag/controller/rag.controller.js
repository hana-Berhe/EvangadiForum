// RAG controllers. A controller reads the request, calls one service and
// sends the JSON reply. Errors go to next(error).
//
// Write your controller between your own markers and use "export const".
// Imports: add them below, one per line. On a merge conflict in the imports,
// keep BOTH lines.
import { createDocumentFromUploadService } from "../service/rag.service.js";

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
// ---- end T-24a ----

// ---- T-24b (Haymanot Y.): getDocumentMetaController ----
// ---- end T-24b ----

// ---- T-24c (Wonde): getDocumentFileController ----
// ---- end T-24c ----

// ---- T-23a (Abel): searchInDocumentController ----
// ---- end T-23a ----

// ---- T-23b (Desalew): queryDocumentController ----
// ---- end T-23b ----

// ---- T-24d (Haymanot B.): deleteDocumentController ----
// ---- end T-24d ----
