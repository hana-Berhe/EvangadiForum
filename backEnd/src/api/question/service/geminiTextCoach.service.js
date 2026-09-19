import { GoogleGenerativeAI } from "@google/generative-ai";
import { ServiceUnavailableError } from "../../../utility/errors/errors.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_TEXT_MODEL =
  process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const textModel = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL });

/**
 * Strip optional markdown fence and parse JSON object from model text.
 * @param {string} raw
 * @returns {object|null}
 */
function parseJsonObjectFromGeminiText(raw) {
  if (!raw || typeof raw !== "string") return null;
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  }
  try {
    const v = JSON.parse(t);
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

async function fetchGeminiJsonTextResponse(userPrompt) {
  // JSON mode: Gemini must reply with JSON, not with text around it.
  // Temperature stays at the default: Google advises this for Gemini 3 models.
  const result = await textModel.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });
  const text = result?.response?.text?.();
  return typeof text === "string" ? text : "";
}

/**
 * Short coaching tips for a question draft (forum / coursework context).
 * @param {{ title: string; content: string }} param
 * @returns {Promise<{ tips: string[] }>}
 */
const generateQuestionDraftCoachService = async ({ title, content }) => {
  const userPrompt = `You help learners write clearer technical forum posts.
Question TITLE:
${title}

Question BODY (markdown allowed):
${content}

Reply with ONLY valid JSON (no markdown fences), exactly this shape:
{"tips":["...","..."]}
Rules:
- tips: array of 0 to 5 short strings (each under 120 characters).
- Every tip must point at something that is missing or unclear in THIS draft. Do not give general advice.
- If the draft is already clear and complete, return an empty array. Do not invent problems.
- Focus on: missing context (error message, expected vs actual), reproducibility, a sharper title idea if needed, tone for peers.
- Do not claim the question is "correct" or grade homework; give constructive checklist-style tips only.`;

  try {
    const raw = await fetchGeminiJsonTextResponse(userPrompt);
    const parsed = parseJsonObjectFromGeminiText(raw);
    // An empty list is a real answer ("the draft is clear"). A reply without
    // a tips list is a broken reply, so report it and do not invent tips.
    if (!Array.isArray(parsed?.tips)) {
      throw new Error("Gemini reply has no tips array");
    }
    let tips = parsed.tips
      .filter((t) => typeof t === "string" && t.trim())
      .map((t) => t.trim());
    tips = tips.slice(0, 5);
    return { tips };
  } catch (error) {
    console.error("generateQuestionDraftCoachService:", error);
    throw new ServiceUnavailableError(
      "AI draft suggestions are temporarily unavailable. Please try again later.",
    );
  }
};

const assessAnswerAgainstQuestionService = async ({
  questionTitle,
  questionContent,
  answerText,
}) => {
  const userPrompt = `You review whether a forum ANSWER draft addresses the QUESTION (relevance and completeness of engagement — not whether the answer is factually correct).

QUESTION TITLE:
${questionTitle}

QUESTION BODY:
${questionContent}

ANSWER DRAFT:
${answerText}

Reply with ONLY valid JSON (no markdown fences), exactly this shape:
{"level":"strong"|"partial"|"weak","note":"one short sentence"}
Rules:
- level: "strong" if the draft clearly engages with the question; "partial" if somewhat related but missing key parts of the ask; "weak" if mostly off-topic or too vague.
- note: one sentence, plain language, no markdown, under 200 characters. Frame as fit/relevance, not grading.`;

  try {
    const raw = await fetchGeminiJsonTextResponse(userPrompt);
    const parsed = parseJsonObjectFromGeminiText(raw);
    // "level":"strong"|"partial"|"weak"
    const levelRaw = parsed?.level;
    //- note: one sentence, plain language, no markdown, under 200 characters. Frame as fit/relevance, not grading.`;
    const noteRaw = parsed?.note;
    // A missing or invalid level is a broken reply. Report it; do not invent a level.
    const level =
      levelRaw === "strong" || levelRaw === "partial" || levelRaw === "weak"
        ? levelRaw
        : null;
    if (!level) {
      throw new Error("Gemini reply has no valid level");
    }
    //default to a fallback note if missing or empty
    const note =
      typeof noteRaw === "string" && noteRaw.trim()
        ? noteRaw.trim().slice(0, 280)
        : "No short explanation was returned.";
    return { level, note };
  } catch (error) {
    console.error("assessAnswerAgainstQuestionService:", error);
    throw new ServiceUnavailableError(
      "AI fit check is temporarily unavailable. Please try again later.",
    );
  }
};
export {
  assessAnswerAgainstQuestionService,
  generateQuestionDraftCoachService,
};
