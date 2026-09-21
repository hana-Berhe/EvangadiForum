// RAG services. All database work and all Gemini work for PDF documents.
//
// Write your functions between your own markers and use "export const".
// Imports: add them below, one per line. On a merge conflict in the imports,
// keep BOTH lines.
//
// Project rules that matter here:
// - Database: always use safeExecute from schema/db.config.js.
// - Embeddings: always use generateQuestionEmbedding from
//   question/service/vector.service.js. Do not call Gemini directly.
// - Another user's document is reported as 404, never 403.

// ---- T-24b (Haymanot Y.): assertOwnedDocument (shared by 5 tasks), getDocumentMetaService ----
// ---- end T-24b ----

// ---- T-22 (Yabets): extractPdfText, chunkTextWithOverlap, embedChunks, createDocumentFromUploadService ----
// ---- end T-22 ----

// ---- T-24a (Natinael): listDocumentsForUserService ----
export const listDocumentsForUserService = async (userId) => {
  // No user_id and no storage_path here: the list does not need them.
  const rows = await safeExecute(
    `SELECT document_id, title, mime_type, byte_size, status, error_message,
            created_at, updated_at
       FROM documents
      WHERE user_id = ?
      ORDER BY created_at DESC`,
    [userId],
  );

  // byte_size is BIGINT in MySQL, so make sure the JSON holds a number.
  return rows.map((row) => ({ ...row, byte_size: Number(row.byte_size) }));
};
// ---- end T-24a ----

// ---- T-24c (Wonde): resolveDocumentAbsolutePath (reused by T-24d) ----
// ---- end T-24c ----

// ---- T-23a (Abel): embedQueryText, rankChunksByCosine, searchInDocumentService ----
// ---- end T-23a ----

// ---- T-23b (Desalew): queryDocumentService ----
// ---- end T-23b ----

// ---- T-24d (Haymanot B.): removeDocumentFileFromDisk, deleteDocumentService ----
// ---- end T-24d ----
