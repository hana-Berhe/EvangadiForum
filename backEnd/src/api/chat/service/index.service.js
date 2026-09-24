// Keeps the Qdrant collection equal to MySQL for the AI chat assistant.
//
// What goes into Qdrant:
//   question -> vector copied from question_vectors          (0 Gemini calls)
//   answer   -> vector made here from "title + answer text"  (Gemini batch)
//   document -> vector copied from document_chunk_vectors    (0 Gemini calls)
//
// The payload is small: ids, hash, title, type. The text of a question, an
// answer or a PDF chunk is NOT stored in Qdrant. The chat reads it fresh from
// MySQL, so MySQL stays the source of truth.

import crypto from "node:crypto";
import { safeExecute } from "../../../../schema/db.config.js";
import { generateEmbeddingsBatch } from "../../question/service/vector.service.js";
import {
  qdrant,
  ensureChatCollection,
  VECTOR_SIZE,
  POINT_TYPES,
  questionPointId,
  answerPointId,
  chunkPointId,
} from "../config/qdrant.config.js";

const UPSERT_BATCH_SIZE = 64; // points per Qdrant request
const SCROLL_PAGE_SIZE = 500; // points per Qdrant read
const MYSQL_PAGE_SIZE = 200; // rows per MySQL read (each row holds a vector)
const EMBED_BATCH_SIZE = 20; // texts per Gemini call, same as the PDF code
const EMBED_PAUSE_MS = 300; // be gentle with the Gemini rate limit
const MAX_ANSWER_CHARS = 2000; // same cut as question content

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanText(value) {
  return `${value || ""}`.normalize("NFKC").replace(/\s+/g, " ").trim();
}

// The text that is embedded for one answer. The question title is included
// because a short answer like "use useEffect" means nothing alone.
function buildAnswerText({ title, content }) {
  const cleanContent = cleanText(content).slice(0, MAX_ANSWER_CHARS);
  return `Question title: ${cleanText(title)}\n\nAnswer: ${cleanContent}`;
}

// A short fingerprint of the embedded text. It is saved in the payload, so
// the next sync can see that an answer did not change and skip Gemini.
function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

// MySQL gives a JSON column back as an array or as a string.
// Returns null when the value is not a usable vector.
function parseEmbedding(value) {
  try {
    const vector = typeof value === "string" ? JSON.parse(value) : value;
    const isValid =
      Array.isArray(vector) &&
      vector.length === VECTOR_SIZE &&
      vector.every((item) => typeof item === "number" && !Number.isNaN(item));
    return isValid ? vector : null;
  } catch {
    return null;
  }
}

async function upsertPoints(points) {
  if (points.length === 0) return;
  const collection = await ensureChatCollection();
  for (let first = 0; first < points.length; first += UPSERT_BATCH_SIZE) {
    await qdrant.upsert(collection, {
      wait: true,
      points: points.slice(first, first + UPSERT_BATCH_SIZE),
    });
  }
}

async function deletePoints(pointIds) {
  if (pointIds.length === 0) return;
  const collection = await ensureChatCollection();
  for (let first = 0; first < pointIds.length; first += UPSERT_BATCH_SIZE) {
    await qdrant.delete(collection, {
      wait: true,
      points: pointIds.slice(first, first + UPSERT_BATCH_SIZE),
    });
  }
}

/**
 * Reads every point of one type from Qdrant (no vectors, payload only).
 * @param {string} type - One of POINT_TYPES.
 * @param {Array<Object>} [extraMust] - More filter conditions, for example
 *   one user's PDF chunks only.
 * @returns {Promise<Map<number, Object>>} point id -> payload
 */
async function listPoints(type, extraMust = []) {
  const collection = await ensureChatCollection();
  const found = new Map();
  let offset;
  do {
    const page = await qdrant.scroll(collection, {
      filter: {
        must: [{ key: "type", match: { value: type } }, ...extraMust],
      },
      limit: SCROLL_PAGE_SIZE,
      offset,
      with_payload: true,
      with_vector: false,
    });
    for (const point of page.points) {
      found.set(Number(point.id), point.payload || {});
    }
    offset = page.next_page_offset;
  } while (offset !== null && offset !== undefined);
  return found;
}

// Deletes the points of one type that MySQL no longer has.
async function deleteOrphans(type, keepIds) {
  const existing = await listPoints(type);
  const orphanIds = [...existing.keys()].filter((id) => !keepIds.has(id));
  await deletePoints(orphanIds);
  return orphanIds.length;
}

// Copies vectors that are already in MySQL. No Gemini call.
// Rows are read page by page (WHERE id > lastId), so memory stays small.
async function copyReadyVectors({ type, pageSql, idColumn, toPoint }) {
  const keepIds = new Set();
  let upserted = 0;
  let skipped = 0;
  let lastId = 0;

  while (true) {
    const rows = await safeExecute(pageSql, [lastId]);
    if (rows.length === 0) break;

    const points = [];
    for (const row of rows) {
      lastId = row[idColumn];
      const vector = parseEmbedding(row.embedding);
      if (!vector) {
        skipped += 1;
        continue;
      }
      const point = toPoint(row, vector);
      keepIds.add(point.id);
      points.push(point);
    }
    await upsertPoints(points);
    upserted += points.length;
  }

  const deleted = await deleteOrphans(type, keepIds);
  return { upserted, skipped, deleted };
}

/**
 * Questions: copy every ready vector from question_vectors.
 * @returns {Promise<{upserted: number, skipped: number, deleted: number}>}
 */
function syncQuestions() {
  return copyReadyVectors({
    type: POINT_TYPES.question,
    idColumn: "question_id",
    pageSql: `
      SELECT q.question_id, q.question_hash, q.title, v.embedding
      FROM question_vectors v
      JOIN questions q ON q.question_id = v.question_id
      WHERE v.status = 'ready' AND q.question_id > ?
      ORDER BY q.question_id ASC
      LIMIT ${MYSQL_PAGE_SIZE}`,
    toPoint: (row, vector) => ({
      id: questionPointId(row.question_id),
      vector,
      payload: {
        type: POINT_TYPES.question,
        question_id: row.question_id,
        question_hash: row.question_hash,
        title: row.title,
      },
    }),
  });
}

/**
 * PDF chunks: copy every ready vector from document_chunk_vectors.
 * user_id is in the payload so the chat can filter "only my own PDFs".
 * @returns {Promise<{upserted: number, skipped: number, deleted: number}>}
 */
function syncDocumentChunks() {
  return copyReadyVectors({
    type: POINT_TYPES.document,
    idColumn: "chunk_id",
    pageSql: `
      SELECT c.chunk_id, c.document_id, c.page_start, c.page_end,
             d.user_id, d.title, v.embedding
      FROM document_chunk_vectors v
      JOIN document_chunks c ON c.chunk_id = v.chunk_id
      JOIN documents d ON d.document_id = c.document_id
      WHERE v.status = 'ready' AND d.status = 'ready' AND c.chunk_id > ?
      ORDER BY c.chunk_id ASC
      LIMIT ${MYSQL_PAGE_SIZE}`,
    toPoint: toChunkPoint,
  });
}

// Turns one MySQL row (chunk + its document) into a Qdrant point.
function toChunkPoint(row, vector) {
  return {
    id: chunkPointId(row.chunk_id),
    vector,
    payload: {
      type: POINT_TYPES.document,
      chunk_id: row.chunk_id,
      document_id: row.document_id,
      user_id: row.user_id,
      title: row.title,
      page_start: row.page_start,
      page_end: row.page_end,
    },
  };
}

/**
 * PDF chunks of ONE user: copy what is missing, delete what is gone.
 * The chat calls this before it searches, so a PDF that was uploaded or
 * deleted a minute ago is already right. No Gemini call, and the PDF code
 * (rag.service.js) does not need to know about Qdrant.
 * Cost when nothing changed: one small MySQL read and one Qdrant read.
 * @param {number} userId
 * @returns {Promise<{upserted: number, deleted: number}>}
 */
async function syncUserDocumentChunks(userId) {
  const readyRows = await safeExecute(
    `SELECT c.chunk_id
     FROM document_chunk_vectors v
     JOIN document_chunks c ON c.chunk_id = v.chunk_id
     JOIN documents d ON d.document_id = c.document_id
     WHERE v.status = 'ready' AND d.status = 'ready' AND d.user_id = ?`,
    [userId],
  );
  const readyIds = new Set(readyRows.map((row) => chunkPointId(row.chunk_id)));
  const existing = await listPoints(POINT_TYPES.document, [
    { key: "user_id", match: { value: Number(userId) } },
  ]);

  const orphanIds = [...existing.keys()].filter((id) => !readyIds.has(id));
  await deletePoints(orphanIds);

  const missingChunkIds = readyRows
    .map((row) => row.chunk_id)
    .filter((chunkId) => !existing.has(chunkPointId(chunkId)));

  let upserted = 0;
  for (
    let first = 0;
    first < missingChunkIds.length;
    first += MYSQL_PAGE_SIZE
  ) {
    const pageIds = missingChunkIds.slice(first, first + MYSQL_PAGE_SIZE);
    const rows = await safeExecute(
      `SELECT c.chunk_id, c.document_id, c.page_start, c.page_end,
              d.user_id, d.title, v.embedding
       FROM document_chunk_vectors v
       JOIN document_chunks c ON c.chunk_id = v.chunk_id
       JOIN documents d ON d.document_id = c.document_id
       WHERE d.user_id = ? AND c.chunk_id IN (${pageIds.map(() => "?").join(", ")})`,
      [userId, ...pageIds],
    );
    const points = [];
    for (const row of rows) {
      const vector = parseEmbedding(row.embedding);
      if (vector) points.push(toChunkPoint(row, vector));
    }
    await upsertPoints(points);
    upserted += points.length;
  }

  return { upserted, deleted: orphanIds.length };
}

/**
 * Answers: MySQL has no answer vectors, so they are made here.
 * An answer is embedded only when it is new or its text changed (text_hash).
 * If Gemini fails for one batch, that batch is counted as failed and the
 * sync goes on. Run the sync again to retry.
 * @returns {Promise<{embedded: number, unchanged: number, failed: number, deleted: number}>}
 */
async function syncAnswers() {
  const rows = await safeExecute(
    `SELECT a.answer_id, a.content, q.question_id, q.question_hash, q.title
     FROM answers a
     JOIN questions q ON q.question_id = a.question_id
     ORDER BY a.answer_id ASC`,
    [],
  );
  const existing = await listPoints(POINT_TYPES.answer);

  const keepIds = new Set();
  const changed = [];
  for (const row of rows) {
    const id = answerPointId(row.answer_id);
    const text = buildAnswerText(row);
    const textHash = hashText(text);
    keepIds.add(id);
    if (existing.get(id)?.text_hash !== textHash) {
      changed.push({ id, text, textHash, row });
    }
  }

  let embedded = 0;
  let failed = 0;
  for (let first = 0; first < changed.length; first += EMBED_BATCH_SIZE) {
    const batch = changed.slice(first, first + EMBED_BATCH_SIZE);

    let vectors;
    try {
      vectors = await generateEmbeddingsBatch(batch.map((item) => item.text));
    } catch (error) {
      failed += batch.length;
      console.log(`  Gemini failed for ${batch.length} answers:`);
      console.log(`    ${error.message}`);
      continue;
    }

    await upsertPoints(
      batch.map((item, index) => ({
        id: item.id,
        vector: vectors[index],
        payload: {
          type: POINT_TYPES.answer,
          answer_id: item.row.answer_id,
          question_id: item.row.question_id,
          question_hash: item.row.question_hash,
          title: item.row.title,
          text_hash: item.textHash,
        },
      })),
    );
    embedded += batch.length;
    await wait(EMBED_PAUSE_MS);
  }

  const deleted = await deleteOrphans(POINT_TYPES.answer, keepIds);
  return {
    embedded,
    unchanged: rows.length - changed.length,
    failed,
    deleted,
  };
}

export {
  buildAnswerText,
  hashText,
  parseEmbedding,
  upsertPoints,
  deletePoints,
  listPoints,
  syncQuestions,
  syncAnswers,
  syncDocumentChunks,
  syncUserDocumentChunks,
};
