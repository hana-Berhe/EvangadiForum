// Qdrant connection for the AI chat assistant.
// Settings come from .env: QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION.
//
// MySQL stays the source of truth. Qdrant only holds a copy of the vectors
// plus a small payload, and "npm run sync:qdrant" can rebuild all of it.
//
// Importing this file never talks to Qdrant, so the server still starts
// when Qdrant is off. The first real call is in ensureChatCollection().

import dotenv from "dotenv";
import { QdrantClient } from "@qdrant/js-client-rest";

// Scripts import this file directly, so .env is loaded here too.
dotenv.config({ quiet: true });

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
// Local Docker needs no key. Qdrant Cloud needs one.
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || undefined;
// Every developer has their own MySQL, so question id 5 is a different
// question on every machine. Never share one collection between developers.
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "evangadi_chat";

// Must match outputDimensionality in vector.service.js.
const VECTOR_SIZE = 768;

// The "type" value in every point's payload.
const POINT_TYPES = {
  question: "question",
  answer: "answer",
  document: "document",
};

// A Qdrant point id must be a whole number (or a UUID), and all types share
// one collection. Each type gets its own number range so ids never collide:
//   question  ->                 question_id
//   answer    -> 1,000,000,000 + answer_id
//   document  -> 2,000,000,000 + chunk_id
const ANSWER_ID_OFFSET = 1_000_000_000;
const DOCUMENT_ID_OFFSET = 2_000_000_000;

const questionPointId = (questionId) => Number(questionId);
const answerPointId = (answerId) => ANSWER_ID_OFFSET + Number(answerId);
const chunkPointId = (chunkId) => DOCUMENT_ID_OFFSET + Number(chunkId);

const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
  // 10 seconds. When Qdrant is off we want a fast, clear error.
  timeout: 10000,
  // Skip the version check on start. It is one extra request and it only
  // prints a warning.
  checkCompatibility: false,
});

// Filters use these payload fields. An index keeps each filter fast.
const PAYLOAD_INDEXES = [
  { field_name: "type", field_schema: "keyword" },
  { field_name: "user_id", field_schema: "integer" },
  { field_name: "question_id", field_schema: "integer" },
  { field_name: "document_id", field_schema: "integer" },
];

let collectionReady = null;

async function createCollectionIfMissing() {
  const { collections } = await qdrant.getCollections();
  const exists = collections.some((item) => item.name === QDRANT_COLLECTION);
  if (!exists) {
    await qdrant.createCollection(QDRANT_COLLECTION, {
      vectors: { size: VECTOR_SIZE, distance: "Cosine" },
    });
  }
  // Creating an index that already exists is fine, so this is safe to repeat.
  for (const index of PAYLOAD_INDEXES) {
    await qdrant.createPayloadIndex(QDRANT_COLLECTION, {
      ...index,
      wait: true,
    });
  }
  return QDRANT_COLLECTION;
}

/**
 * Makes sure the collection and its payload indexes exist.
 * The work runs once per process. If it fails (Qdrant is off), the next call
 * tries again.
 * @returns {Promise<string>} The collection name.
 */
function ensureChatCollection() {
  if (!collectionReady) {
    collectionReady = createCollectionIfMissing().catch((error) => {
      collectionReady = null;
      throw error;
    });
  }
  return collectionReady;
}

export {
  qdrant,
  ensureChatCollection,
  QDRANT_URL,
  QDRANT_COLLECTION,
  VECTOR_SIZE,
  POINT_TYPES,
  questionPointId,
  answerPointId,
  chunkPointId,
};
