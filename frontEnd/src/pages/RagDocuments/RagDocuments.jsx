import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Sparkles, Trash2, Upload } from "lucide-react";

import {
  deleteDocument,
  fetchPdfObjectUrl,
  getDocumentMeta,
  listDocuments,
  queryDocument,
  searchInDocument,
  uploadPdf,
} from "../../api/rag.api";

import RagAnswerBody from "../../components/RagAnswerBody/RagAnswerBody";
import { getErrorMessage } from "../../utils/data";

import styles from "./RagDocuments.module.css";

const formatBytes = (bytes) => {
  // byte_size can arrive as a string (BIGINT columns), so coerce first.
  const size = Number(bytes);
  if (!size) return "";
  const mb = size / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return size >= 1024 ? `${Math.round(size / 1024)} KB` : `${size} B`;
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const STATUS_LABELS = {
  ready: "Ready",
  processing: "Processing",
  failed: "Failed",
};

export default function RagDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [activeId, setActiveId] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [askQuery, setAskQuery] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [askError, setAskError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchHits, setSearchHits] = useState(null);
  const [searchError, setSearchError] = useState("");

  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfError, setPdfError] = useState("");

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.document_id === activeId) ?? null,
    [documents, activeId],
  );

  const isReady = activeDocument?.status === "ready";

  const refreshDocuments = useCallback(async () => {
    // GET /api/rag/documents responds with { success, message, data: [] }
    const response = await listDocuments();
    const list = Array.isArray(response?.data) ? response.data : [];
    setDocuments(list);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await listDocuments();
        if (!cancelled)
          setDocuments(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        if (!cancelled)
          setListError(getErrorMessage(err, "Could not load documents."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // A document only sits in 'processing' if the server was interrupted while
  // embedding it. Poll until it settles so the panel is never stale.
  useEffect(() => {
    if (activeDocument?.status !== "processing") return undefined;

    const timer = setInterval(async () => {
      try {
        const { data } = await getDocumentMeta(activeDocument.document_id);
        if (data?.status !== "processing") {
          setDocuments((current) =>
            current.map((doc) =>
              doc.document_id === data.document_id ? { ...doc, ...data } : doc,
            ),
          );
        }
      } catch {
        // Leave the status alone and try again on the next tick.
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [activeDocument?.document_id, activeDocument?.status]);

  // The reader is always on screen for a ready document, so the PDF loads as
  // soon as one is selected. The object URL is handed back on cleanup.
  useEffect(() => {
    if (!isReady) return undefined;

    let cancelled = false;
    let createdUrl = "";

    (async () => {
      try {
        const url = await fetchPdfObjectUrl(activeDocument.document_id);
        createdUrl = url;

        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        setPdfUrl(url);
      } catch {
        // The error body is a blob here, not JSON, so there is no msg to read.
        if (!cancelled) setPdfError("Could not load the PDF.");
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
      setPdfUrl("");
    };
  }, [isReady, activeDocument?.document_id]);

  function selectDocument(documentId) {
    setActiveId(documentId);
    setAnswer(null);
    setSearchHits(null);
    setAskError("");
    setSearchError("");
    setPdfError("");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    setUploadError("");

    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please choose a PDF file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      // At 100% the bytes are sent; the same request then waits while the
      // server extracts and indexes the PDF, shown as "Processing".
      const { data } = await uploadPdf(selectedFile, {
        onProgress: setUploadProgress,
      });
      await refreshDocuments();
      selectDocument(data.document_id);

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError(getErrorMessage(err, "Upload failed."));
      // A PDF that could not be processed is still saved as FAILED with its
      // reason. Show it, so the user can read why and delete it.
      await refreshDocuments().catch(() => {});
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(documentId, title) {
    const warning = `Delete "${title}"? Its search index is removed too.`;
    if (!window.confirm(warning)) return;

    setListError("");
    try {
      await deleteDocument(documentId);
      setDocuments((current) =>
        current.filter((doc) => doc.document_id !== documentId),
      );
      if (activeId === documentId) setActiveId(null);
    } catch (err) {
      setListError(getErrorMessage(err, "Could not delete this document."));
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (!activeDocument || searching) return;

    const value = searchQuery.trim();
    if (value.length < 3) {
      setSearchError("Enter at least 3 characters to search.");
      return;
    }

    setSearching(true);
    setSearchError("");
    setSearchHits(null);

    try {
      const { data } = await searchInDocument(activeDocument.document_id, {
        query: value,
        k: 5,
      });
      setSearchHits(data.results ?? []);
    } catch (err) {
      setSearchError(getErrorMessage(err, "Search failed."));
    } finally {
      setSearching(false);
    }
  }

  async function handleAsk(event) {
    event.preventDefault();
    if (!activeDocument || asking) return;

    const value = askQuery.trim();
    if (value.length < 3) {
      setAskError("Ask a question of at least 3 characters.");
      return;
    }

    setAsking(true);
    setAskError("");
    setAnswer(null);

    try {
      const { data } = await queryDocument(activeDocument.document_id, value);
      setAnswer(data);
    } catch (err) {
      setAskError(getErrorMessage(err, "Could not get an answer."));
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className={styles.knowledgePage}>
      <section className={styles.knowledgeHero}>
        <span className={styles.knowledgeEyebrow}>KNOWLEDGE BASE</span>
        <h1>Ask questions about your own PDFs</h1>
        <p>
          Upload course notes, book chapters or documentation as PDF files. Each
          file is indexed so you can search it by meaning and ask the AI
          questions about it. Answers are built only from passages in that
          document and cite where they came from. Your uploads are private;
          other users never see them.
        </p>
        <ol className={styles.knowledgeSteps}>
          <li>Upload a PDF.</li>
          <li>Wait until it shows Ready.</li>
          <li>Select it to read, search, or ask AI.</li>
        </ol>
      </section>

      {listError && <p className={styles.ragError}>{listError}</p>}

      <div className={styles.knowledgeLayout}>
        {/* LEFT: LIBRARY */}
        <aside className={styles.knowledgeLibraryCard}>
          <div className={styles.knowledgeSectionTitle}>
            <h2>Library</h2>
            <p>
              Your uploaded PDFs. Select one marked Ready to use search and Ask
              with AI.
            </p>
          </div>

          <div className={styles.knowledgeUploadBox}>
            <p>PDF files only. Maximum file size: 10 MB.</p>

            <input
              id="rag-pdf-input"
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              hidden
            />

            <div className={styles.knowledgeUploadActions}>
              <label
                htmlFor="rag-pdf-input"
                className={`${styles.knowledgeFileButton} ${uploading ? styles.disabled : ""}`}
              >
                <FileText size={16} />
                Choose file
              </label>

              <button
                type="button"
                className={styles.knowledgeUploadButton}
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                <Upload size={16} />
                {uploading
                  ? uploadProgress < 100
                    ? "Uploading..."
                    : "Processing..."
                  : "Upload"}
              </button>
            </div>

            {uploading && (
              <div className={styles.ragUploadProgress} role="status">
                <span>
                  {uploadProgress < 100
                    ? `Uploading... ${uploadProgress}%`
                    : "Processing: extracting text and building the search index..."}
                </span>
                <div
                  className={styles.ragProgressTrack}
                  role="progressbar"
                  aria-label="Upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={uploadProgress}
                >
                  <div
                    className={`${styles.ragProgressBar} ${
                      uploadProgress >= 100 ? styles.processing : ""
                    }`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {selectedFile ? (
              <div className={styles.ragFileChip}>
                <FileText size={15} />
                <span className={styles.ragFileName}>{selectedFile.name}</span>
                <span className={styles.ragFileSize}>
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
            ) : (
              <p className={styles.knowledgeSelectedFile}>No file selected.</p>
            )}

            {uploadError && <p className={styles.ragError}>{uploadError}</p>}
          </div>

          {loading ? (
            <p className={styles.ragLibraryNote}>Loading your library...</p>
          ) : documents.length === 0 ? (
            <p className={styles.ragLibraryNote}>
              No documents yet. Upload a PDF above, then select it to ask
              questions about its content.
            </p>
          ) : (
            <div className={styles.knowledgeDocumentList}>
              {documents.map((doc) => (
                <button
                  key={doc.document_id}
                  type="button"
                  className={`${styles.knowledgeDocumentItem} ${
                    activeId === doc.document_id ? styles.active : ""
                  }`}
                  onClick={() => selectDocument(doc.document_id)}
                >
                  <div>
                    <strong title={doc.title}>{doc.title}</strong>
                    {/* Metadata lines render only when the API returns them. */}
                    <span className={styles.knowledgeDocumentMeta}>
                      {["PDF", formatBytes(doc.byte_size)]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                    {formatDate(doc.created_at) && (
                      <span className={styles.knowledgeDocumentMeta}>
                        Uploaded {formatDate(doc.created_at)}
                      </span>
                    )}
                    {doc.chunk_count != null && (
                      <span className={styles.knowledgeDocumentMeta}>
                        {Number(doc.chunk_count)}{" "}
                        {Number(doc.chunk_count) === 1 ? "chunk" : "chunks"}
                      </span>
                    )}
                    <span
                      className={`${styles.knowledgeReadyBadge} ${styles[doc.status] ?? ""}`}
                    >
                      {STATUS_LABELS[doc.status] ?? doc.status}
                    </span>
                  </div>

                  <span
                    className={styles.knowledgeDeleteButton}
                    role="button"
                    tabIndex={0}
                    aria-label={`Delete ${doc.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(doc.document_id, doc.title);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        handleDelete(doc.document_id, doc.title);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* RIGHT: READER, SEARCH AND ASK, STACKED */}
        <section className={styles.knowledgeMainCard}>
          {!activeDocument ? (
            <div className={styles.ragNotice}>
              Choose a document from the library to open the reader, run
              semantic search over its text, and ask questions with AI-assisted
              answers grounded in that file.
            </div>
          ) : !isReady ? (
            <div className={styles.ragNotice}>
              <p>
                This document is not ready for preview or AI tools. Current
                status: <strong>{activeDocument.status}</strong>.
              </p>

              {/* Without this the library just shows FAILED and the reason
                  stays buried in the database. */}
              {activeDocument.status === "failed" &&
                activeDocument.error_message && (
                  <p className={styles.ragNoticeReason}>
                    {activeDocument.error_message}
                  </p>
                )}
            </div>
          ) : (
            <>
              {/* READER */}
              <section className={styles.ragSection}>
                <h2>Reader</h2>
                <p className={styles.ragSectionNote}>
                  Inline preview of the selected PDF.
                </p>

                {pdfError ? (
                  <p className={styles.ragError}>{pdfError}</p>
                ) : (
                  <div className={styles.knowledgeReaderFrame}>
                    {pdfUrl ? (
                      <iframe src={pdfUrl} title={activeDocument.title} />
                    ) : (
                      <p>Loading document preview...</p>
                    )}
                  </div>
                )}
              </section>

              <div className={styles.ragDivider} />

              {/* SEMANTIC SEARCH */}
              <section className={styles.ragSection}>
                <h2>Semantic search</h2>
                <p className={styles.ragSectionNote}>
                  Finds passages by meaning (embeddings), not only exact
                  keywords.
                </p>

                <form onSubmit={handleSearch}>
                  <label className={styles.ragLabel} htmlFor="rag-search-input">
                    Search query
                  </label>
                  <input
                    id="rag-search-input"
                    className={styles.ragInput}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Describe the topic or phrase you are looking for"
                  />

                  <button
                    type="submit"
                    className={styles.ragActionButton}
                    disabled={searching}
                  >
                    <Sparkles size={16} />
                    {searching ? "Searching..." : "Search"}
                  </button>
                </form>

                {searchError && (
                  <p className={styles.ragError}>{searchError}</p>
                )}

                {searchHits?.length === 0 && (
                  <p className={styles.ragLibraryNote}>
                    No passage in this document was close enough to match. Try a
                    longer, more specific phrase.
                  </p>
                )}

                {searchHits?.length > 0 && (
                  <ul className={styles.ragHitList}>
                    {searchHits.map((hit) => (
                      <li key={hit.chunkId} className={styles.ragHit}>
                        <div className={styles.ragHitHead}>
                          <span className={styles.ragHitIndex}>
                            chunk {hit.chunkIndex + 1}
                            {hit.pageStart ? ` · page ${hit.pageStart}` : ""}
                          </span>
                          <span className={styles.ragHitScore}>
                            {(hit.score * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p>{hit.excerpt}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className={styles.ragDivider} />

              {/* ASK WITH AI */}
              <section className={styles.ragSection}>
                <h2>Ask with AI</h2>
                <p className={styles.ragSectionNote}>
                  Answers use only retrieved excerpts from this PDF, with
                  citations where possible. When the document includes code, the
                  reply may show it in formatted blocks you can copy.
                </p>

                <form onSubmit={handleAsk}>
                  <label className={styles.ragLabel} htmlFor="rag-ask-input">
                    Question
                  </label>
                  <textarea
                    id="rag-ask-input"
                    className={styles.ragTextarea}
                    rows={3}
                    value={askQuery}
                    onChange={(event) => setAskQuery(event.target.value)}
                    placeholder="Ask a clear question in plain language. If the document does not cover it, the model should say so."
                  />

                  <button
                    type="submit"
                    className={styles.ragActionButton}
                    disabled={asking}
                  >
                    <Sparkles size={16} />
                    {asking ? "Asking..." : "Ask"}
                  </button>
                </form>

                {askError && <p className={styles.ragError}>{askError}</p>}

                {answer && (
                  <RagAnswerBody
                    answer={answer.answer}
                    citations={answer.citations}
                  />
                )}
              </section>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
