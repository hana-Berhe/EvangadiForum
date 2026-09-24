// The AI chat assistant. One message in, one reply out.
//
// It answers ONLY from our own data:
//   - forum questions and their answers (everyone's)
//   - the PDFs of the user who is asking (never another user's)
//
// Steps for one message:
//   1. A greeting gets a fixed reply. No AI call.
//   2. Make sure this user's PDF chunks are in Qdrant.
//   3. Turn the message into a vector (Gemini embedding, RETRIEVAL_QUERY).
//   4. Ask Qdrant for the closest points. Keep the ones above the threshold.
//   5. Nothing close enough -> say "I do not know". No Gemini text call.
//   6. Read the real text fresh from MySQL (MySQL is the source of truth).
//   7. Ask Gemini to answer using only these numbered sources.
//   8. Show only the sources the answer really cites as [n].
//
// The reply has a "kind":
//   chat     -> greeting
//   answer   -> answered, with sources
//   related  -> not answered, but these threads are close
//   notfound -> nothing in our data. The UI offers "Ask the community".

import { safeExecute } from "../../../../schema/db.config.js";
import { ServiceUnavailableError } from "../../../utility/errors/errors.js";
import { generateQuestionEmbedding } from "../../question/service/vector.service.js";
import { normalizeQuestionText } from "../../question/service/vector.service.js";
import { answerFromChatSourcesService } from "../../question/service/geminiTextCoach.service.js";
import { qdrant } from "../config/qdrant.config.js";
import { ensureChatCollection } from "../config/qdrant.config.js";
import { POINT_TYPES } from "../config/qdrant.config.js";
import { syncUserDocumentChunks } from "./index.service.js";

// Minimum cosine score per type. Questions and PDF chunks use the same
// vectors and the same query embedding as search, so they start at the
// measured 0.62. The answer value is NOT measured yet: "npm run measure:chat"
// (a later step) will replace it with a real number.
const THRESHOLDS = {
  [POINT_TYPES.question]: Number(process.env.CHAT_QUESTION_THRESHOLD) || 0.62,
  [POINT_TYPES.answer]: Number(process.env.CHAT_ANSWER_THRESHOLD) || 0.62,
  [POINT_TYPES.document]: Number(process.env.CHAT_DOCUMENT_THRESHOLD) || 0.62,
};
const QDRANT_LIMIT = 12; // points asked from Qdrant
const MAX_SOURCES = Number(process.env.CHAT_MAX_SOURCES) || 5; // sent to Gemini
const MAX_SOURCE_CHARS = 1500; // per source, in the prompt
const MAX_QUESTION_CHARS = 600;
const MAX_ANSWER_CHARS = 500;

const NOT_FOUND_TEXT =
  "I could not find this in the forum or in your PDFs. You can ask the community, and someone may answer you.";
const RELATED_TEXT =
  "I could not find a clear answer in the forum or in your PDFs. These threads look related:";

const GREETING_PATTERN =
  /^(hi|hello|hey|selam|good (morning|afternoon|evening)|thanks|thank you|thank u|ok|okay|bye)\b[\s!.,?]*$/i;

function greetingReply(firstName) {
  const name = firstName ? ` ${firstName}` : "";
  return `Hi${name}! Ask me about anything in the forum or in your own PDFs. I answer only from those, and I show you my sources.`;
}

// ---------- step 4: search Qdrant ----------
async function searchPoints({ vector, userId }) {
  try {
    const collection = await ensureChatCollection();
    const result = await qdrant.query(collection, {
      query: vector,
      limit: QDRANT_LIMIT,
      with_payload: true,
      // Every question and answer, plus the PDF chunks of THIS user only.
      filter: {
        should: [
          { key: "type", match: { value: POINT_TYPES.question } },
          { key: "type", match: { value: POINT_TYPES.answer } },
          {
            must: [
              { key: "type", match: { value: POINT_TYPES.document } },
              { key: "user_id", match: { value: Number(userId) } },
            ],
          },
        ],
      },
    });
    return result.points ?? [];
  } catch (error) {
    console.error("chat searchPoints:", error);
    throw new ServiceUnavailableError(
      "The AI assistant cannot reach its search index right now. Please try again later.",
    );
  }
}

// Keeps the hits above the threshold of their own type.
function keepCloseHits(points) {
  return points.filter((point) => {
    const threshold = THRESHOLDS[point.payload?.type];
    return threshold !== undefined && point.score >= threshold;
  });
}

// A question hit and an answer hit of the same thread become ONE candidate.
// Returns candidates, best score first.
function groupHits(hits) {
  const threads = new Map(); // question_id -> candidate
  const chunks = [];

  for (const hit of hits) {
    const { type } = hit.payload;
    if (type === POINT_TYPES.document) {
      chunks.push({
        kind: "document",
        chunkId: hit.payload.chunk_id,
        score: hit.score,
      });
      continue;
    }
    const questionId = hit.payload.question_id;
    const thread = threads.get(questionId) ?? {
      kind: "thread",
      questionId,
      score: hit.score,
      hitAnswerIds: [],
    };
    thread.score = Math.max(thread.score, hit.score);
    if (type === POINT_TYPES.answer) {
      thread.hitAnswerIds.push(hit.payload.answer_id);
    }
    threads.set(questionId, thread);
  }

  return [...threads.values(), ...chunks]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SOURCES);
}

const placeholders = (items) => items.map(() => "?").join(", ");

// ---------- step 6: read the real text from MySQL ----------
async function loadThreads(candidates) {
  const ids = candidates.map((candidate) => candidate.questionId);
  if (ids.length === 0) return new Map();

  const questions = await safeExecute(
    `SELECT question_id, question_hash, title, content
     FROM questions
     WHERE question_id IN (${placeholders(ids)})`,
    ids,
  );
  const answers = await safeExecute(
    `SELECT answer_id, question_id, content
     FROM answers
     WHERE question_id IN (${placeholders(ids)})
     ORDER BY created_at ASC`,
    ids,
  );

  const threads = new Map();
  for (const question of questions) {
    threads.set(question.question_id, { ...question, answers: [] });
  }
  for (const answer of answers) {
    threads.get(answer.question_id)?.answers.push(answer);
  }
  return threads;
}

async function loadChunks(candidates, userId) {
  const ids = candidates.map((candidate) => candidate.chunkId);
  if (ids.length === 0) return new Map();

  // Second lock: even if the Qdrant filter had a bug, the text of another
  // user's PDF can never leave MySQL, because of "d.user_id = ?".
  const rows = await safeExecute(
    `SELECT c.chunk_id, c.content, c.page_start, d.document_id, d.title
     FROM document_chunks c
     JOIN documents d ON d.document_id = c.document_id
     WHERE d.user_id = ? AND c.chunk_id IN (${placeholders(ids)})`,
    [userId, ...ids],
  );
  return new Map(rows.map((row) => [row.chunk_id, row]));
}

const cut = (text, max) => {
  const clean = `${text || ""}`.trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
};

// The text of one thread for the prompt. The answers that matched the
// message come first, so they are not cut off in a long thread.
function buildThreadText(thread, hitAnswerIds) {
  const isHit = (answer) => hitAnswerIds.includes(answer.answer_id);
  const ordered = [
    ...thread.answers.filter(isHit),
    ...thread.answers.filter((answer) => !isHit(answer)),
  ];
  const lines = [`Question: ${cut(thread.content, MAX_QUESTION_CHARS)}`];
  if (ordered.length === 0) lines.push("This question has no answers yet.");
  for (const answer of ordered) {
    lines.push(`Answer: ${cut(answer.content, MAX_ANSWER_CHARS)}`);
  }
  return cut(lines.join("\n"), MAX_SOURCE_CHARS);
}

// Builds the numbered sources. A hit that MySQL no longer has is dropped.
// The server builds every link. The model never writes a link.
async function buildSources({ candidates, userId }) {
  const threads = await loadThreads(
    candidates.filter((candidate) => candidate.kind === "thread"),
  );
  const chunks = await loadChunks(
    candidates.filter((candidate) => candidate.kind === "document"),
    userId,
  );

  const sources = [];
  for (const candidate of candidates) {
    if (candidate.kind === "thread") {
      const thread = threads.get(candidate.questionId);
      if (!thread) continue;
      sources.push({
        ref: sources.length + 1,
        type: "question",
        title: thread.title,
        url: `/questions/${thread.question_hash}`,
        score: Number(candidate.score.toFixed(3)),
        label: `Forum thread: ${thread.title}`,
        text: buildThreadText(thread, candidate.hitAnswerIds),
      });
    } else {
      const chunk = chunks.get(candidate.chunkId);
      if (!chunk) continue;
      sources.push({
        ref: sources.length + 1,
        type: "document",
        title: chunk.title,
        url: "/rag-documents",
        documentId: chunk.document_id,
        page: chunk.page_start,
        score: Number(candidate.score.toFixed(3)),
        label: `The user's PDF "${chunk.title}", page ${chunk.page_start ?? "?"}`,
        text: cut(chunk.content, MAX_SOURCE_CHARS),
      });
    }
  }
  return sources;
}

// What the client gets for one source: no prompt text, no label.
const toPublicSource = ({ label, text, ...source }) => source;

const reply = (kind, answer, extra = {}) => ({
  kind,
  answer,
  grounded: kind === "answer",
  sources: [],
  related: [],
  ...extra,
});

/**
 * Answers one chat message.
 * @param {{ userId: number; firstName?: string; message: string }} param
 * @returns {Promise<{ kind: string; answer: string; grounded: boolean; sources: Array<Object>; related: Array<Object> }>}
 */
export const chatService = async ({ userId, firstName, message }) => {
  // 1. Greeting: fixed reply, no AI call.
  if (GREETING_PATTERN.test(message.trim())) {
    return reply("chat", greetingReply(firstName));
  }

  // 2. This user's PDF chunks. A problem here must not stop the chat.
  try {
    await syncUserDocumentChunks(userId);
  } catch (error) {
    console.error("chat syncUserDocumentChunks:", error.message);
  }

  // 3. Message -> vector, the same way as semantic search.
  let vector;
  try {
    const { embedding } = await generateQuestionEmbedding(
      normalizeQuestionText({ title: message }),
      { taskType: "RETRIEVAL_QUERY" },
    );
    vector = embedding;
  } catch {
    throw new ServiceUnavailableError(
      "The AI assistant is temporarily unavailable. Please try again later.",
    );
  }

  // 4. Closest points, then the threshold of each type.
  const points = await searchPoints({ vector, userId });
  const candidates = groupHits(keepCloseHits(points));

  // 5 + 6. Real text from MySQL. Nothing left -> honest "I do not know".
  const sources = await buildSources({ candidates, userId });
  if (sources.length === 0) {
    return reply("notfound", NOT_FOUND_TEXT);
  }

  // 7. Gemini answers from the numbered sources only.
  const { answer } = await answerFromChatSourcesService({
    message,
    sources: sources.map(({ ref, label, text }) => ({ ref, label, text })),
  });

  // 8. Honest sources: only the ones the answer really cites as [n].
  // Gemini writes [1] and sometimes [1, 2]. Both forms are read.
  const citedRefs = new Set(
    [...answer.matchAll(/\[(\d+(?:\s*,\s*\d+)*)\]/g)].flatMap((match) =>
      match[1].split(",").map(Number),
    ),
  );
  const cited = sources.filter((source) => citedRefs.has(source.ref));
  if (cited.length > 0) {
    return reply("answer", answer, { sources: cited.map(toPublicSource) });
  }

  // No citation means the model could not answer from the sources.
  // Its text is not shown. Close forum threads are offered instead.
  const related = sources
    .filter((source) => source.type === "question")
    .map(toPublicSource);
  if (related.length > 0) {
    return reply("related", RELATED_TEXT, { related });
  }
  return reply("notfound", NOT_FOUND_TEXT);
};

// Exported for tests and for the measure script.
export { keepCloseHits, groupHits, buildThreadText, GREETING_PATTERN };
