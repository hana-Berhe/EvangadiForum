import { GoogleGenAI } from "@google/genai";
import { safeExecute } from "../../../../schema/db.config.js";

const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const RECOMMEND_THRESHOLD = Number(process.env.RECOMMEND_THRESHOLD) || 0.75;
const RECOMMEND_K = Number(process.env.RECOMMEND_K) || 5;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeQuestionText({ title }) {
  return normalizeWhitespace(`${title || ""}`.normalize("NFKC").toLowerCase());
}

const { taskType = "RETRIEVAL_DOCUMENT", questionId = null } = options;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
try {
  const result = await ai.models.embedContent({
    model: process.env.GEMINI_EMBEDDING_MODEL,
    contents: sourceText,
    taskType,
    config: {
      outputDimensionality: 768,
    },
  });

  // console.log(result.embeddings[0].values);

  let values = result?.embeddings[0]?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Gemini embedding response does not contain values");
  }

  return {
    embedding: values,
  };
} catch (error) {
  console.error("Error:", error);
  console.error("========================");
  throw error;
}

function validateEmbedding(embedding) {
  if (!Array.isArray(embedding)) {
    throw new Error("Embedding must be an array");
  }
  if (embedding.length === 0) {
    throw new Error("Embedding cannot be empty");
  }
  if (!embedding.every((v) => typeof v === "number" && !isNaN(v))) {
    throw new Error("Embedding must contain only valid numbers");
  }
}

async function storeQuestionVector({
  questionId,
  sourceText,
  embedding = [],
  status = "ready",
}) {