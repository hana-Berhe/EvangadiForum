# Evangadi Forum — Milestone 3

## Knowledge Base (RAG)

Milestone 3 adds a private Knowledge Base: each user uploads their own PDFs, searches inside them by meaning, and asks questions that are answered only from that PDF.

The main focus of this milestone is:

- PDF upload, text extraction and chunking
- Embeddings for every chunk
- Semantic search inside one document
- Retrieval-Augmented Generation (RAG): AI answers grounded in the PDF, with citations
- Reading, listing and deleting your own documents

Every document is private. All RAG routes need login, and a document that belongs to someone else answers **404**, as if it did not exist.

---

## How RAG Works Here

```text
Upload PDF
   ↓
Extract the text of every page (pdf-parse)
   ↓
Cut it into chunks of about 1000 characters, 150 overlapping
   ↓
Embed every chunk with Gemini (768 numbers, 20 chunks per call)
   ↓
Save chunks + vectors in MySQL, document becomes "ready"

Ask a question
   ↓
Embed the question (RETRIEVAL_QUERY)
   ↓
Cosine similarity against this document's chunks, keep scores ≥ 0.62, top 5
   ↓
Gemini answers ONLY from those numbered chunks, citing them as [1], [2]
   ↓
Return the answer + only the chunks it really cited (with page numbers)
```

If no chunk is close enough, the answer says so and Gemini is not called.

---

## Backend Structure

```text
backEnd/src/api/rag/
├── config/
│   └── rag.upload.config.js      # multer: one PDF, 10 MB, random file name
├── controller/
│   └── rag.controller.js
├── routes/
│   └── rag.routes.js
├── service/
│   └── rag.service.js
└── validations/
    └── rag.validation.js
```

Uploaded files are saved in `backEnd/uploads/rag/<userId>/` (git-ignored).

---

## RAG API

Base path:

```text
/api/rag
```

All routes are protected: **Yes**.

### 1. Upload a PDF

```http
POST /api/rag/documents
```

- Form field `file` (multipart/form-data), PDF only, at most 10 MB
- Extracts, chunks and embeds the PDF before answering
- `201` with the new document; a PDF that cannot be processed is saved as `failed` with a readable reason
- `400` for a non-PDF, a file over 10 MB, a PDF with no readable text, or more than 20 PDFs

### 2. List My Documents

```http
GET /api/rag/documents
```

- The logged-in user's PDFs, newest first

### 3. Get One Document

```http
GET /api/rag/documents/:documentId
```

- Title, size, status (`processing`, `ready`, `failed`) and dates
- The page polls this every 3 seconds while a document is `processing`

### 4. Stream the PDF File

```http
GET /api/rag/documents/:documentId/file
```

- Sends the PDF inline, so the page can show it
- The page downloads it as a blob (an `<iframe>` cannot send the login token)

### 5. Search Inside a Document

```http
GET /api/rag/documents/:documentId/search?query=...&k=5
```

- `query`: at least 3 characters; `k`: 1–20 (at most 10 results are returned)
- Returns matching chunks with score, chunk index and page

### 6. Ask the PDF

```http
POST /api/rag/documents/:documentId/query
```

- Body: `{ "query": "..." }`, at least 3 characters
- Returns `{ answer, citations, chunksUsed }`

### 7. Delete a Document

```http
DELETE /api/rag/documents/:documentId
```

- Removes the file from disk and the row; its chunks and vectors go with it (`ON DELETE CASCADE`)

---

## Frontend

- `src/pages/RagDocuments/RagDocuments.jsx`: the Knowledge Base page (library, upload with progress, reader, search, ask)
- `src/components/RagAnswerBody/RagAnswerBody.jsx`: shows the answer with `[n]` citation badges and the source pages
- `src/api/rag.api.js`: one function per endpoint

---

## Database

Three tables in `backEnd/schema/schema.sql` (section 5):

- `documents`: one row per PDF, owned by a user
- `document_chunks`: the text chunks, with page ranges
- `document_chunk_vectors`: one embedding per chunk

---

## Settings (`backEnd/.env`)

All optional; the defaults are shown in `.env.example`: `RAG_UPLOAD_DIR`, `RAG_MAX_UPLOAD_MB`, `RAG_CHUNK_CHARS`, `RAG_CHUNK_OVERLAP`, `RAG_MAX_CHUNKS_PER_DOC`, `RAG_MAX_PDFS_PER_USER`, `RAG_MIN_TEXT_CHARS`, `RAG_SEARCH_THRESHOLD`, `RAG_SEARCH_K`.

---

## Milestone 3 Checklist

- [x] Upload and process a PDF
- [x] List, read and delete my documents
- [x] Stream the PDF for the reader
- [x] Semantic search inside a document
- [x] Ask the PDF with grounded answers and citations
- [x] Ownership check on every document route (404 for others)
- [x] Knowledge Base page
- [x] Merge completed work into `main`

---

## Milestone Goal

By the end of Milestone 3, users can:

1. Upload their own PDFs and see when each one is ready.
2. Read a PDF inside the app.
3. Search inside it by meaning.
4. Ask questions answered only from that PDF, with the pages it came from.
5. Delete a PDF and everything built from it.
