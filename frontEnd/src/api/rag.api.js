// RAG API calls. Same style as question.api.js: one small function per
// endpoint, each returns response.data.
//
// ---- T-25 (Hana): listDocuments, uploadPdf, getDocumentMeta, deleteDocument,
//      searchInDocument, queryDocument, fetchPdfObjectUrl ----
// ---- end T-25 ----

import api from "./axios";

export async function listDocuments() {
  const response = await api.get("/rag/documents");
  return response.data;
}

export async function uploadPdf(file, { onProgress } = {}) {
  const form = new FormData();
  form.append("file", file);

  const response = await api.post("/rag/documents", form, {
    // Let the browser set the multipart boundary itself.
    headers: { "Content-Type": undefined },
    // Embedding every chunk takes a while, so override the default timeout.
    timeout: 180000,
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return response.data;
}

export async function getDocumentMeta(documentId) {
  const response = await api.get(`/rag/documents/${documentId}`);
  return response.data;
}

export async function deleteDocument(documentId) {
  const response = await api.delete(`/rag/documents/${documentId}`);
  return response.data;
}

export async function searchInDocument(documentId, params) {
  const response = await api.get(`/rag/documents/${documentId}/search`, {
    params,
  });
  return response.data;
}

export async function queryDocument(documentId, query) {
  const response = await api.post(`/rag/documents/${documentId}/query`, {
    query,
  });
  return response.data;
}

/**
 * The file route is protected, so the PDF cannot be dropped straight into an
 * <iframe src>. Fetch it as a blob with the bearer token attached, then hand
 * back an object URL. The caller must revoke it.
 */
export async function fetchPdfObjectUrl(documentId) {
  const response = await api.get(`/rag/documents/${documentId}/file`, {
    responseType: "blob",
  });

  return URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" }),
  );
}
