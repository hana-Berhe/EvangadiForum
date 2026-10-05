import { db, safeExecute } from "./db.config.js";
import {
  generateQuestionEmbedding,
  normalizeQuestionText,
  storeQuestionVector,
} from "../src/api/question/service/vector.service.js";
import {
  getQuestionTag,
  initializeQuestionTagEmbeddings,
} from "../src/api/question/service/question-tagging.service.js";

const isValidEmbedding = (embedding) =>
  Array.isArray(embedding) &&
  embedding.length > 0 &&
  embedding.every(
    (value) => typeof value === "number" && Number.isFinite(value),
  );

async function backfillTags() {
  try {
    await initializeQuestionTagEmbeddings();
    const questions = await safeExecute(
      `SELECT question_id AS id, title, content
       FROM questions
       WHERE tag IS NULL
       ORDER BY question_id`,
      [],
    );

    let taggedCount = 0;
    let failedCount = 0;

    for (const question of questions) {
      const sourceText = normalizeQuestionText({
        title: question.title,
        content: question.content,
      });

      try {
        const vectorRows = await safeExecute(
          `SELECT embedding, status
           FROM question_vectors
           WHERE question_id = ?
           LIMIT 1`,
          [question.id],
        );

        let embedding;
        let usingStoredEmbedding = false;
        if (vectorRows[0]?.status === "ready") {
          const stored = vectorRows[0].embedding;
          try {
            embedding =
              typeof stored === "string" ? JSON.parse(stored) : stored;
            usingStoredEmbedding = isValidEmbedding(embedding);
          } catch {
            embedding = null;
          }
        }

        if (!isValidEmbedding(embedding)) {
          const generated = await generateQuestionEmbedding(sourceText, {
            questionId: question.id,
          });
          embedding = generated.embedding;
          if (!isValidEmbedding(embedding)) {
            throw new Error("Embedding provider returned an invalid vector.");
          }
          try {
            await storeQuestionVector({
              questionId: question.id,
              sourceText,
              embedding,
              status: "ready",
            });
          } catch (error) {
            console.error(
              `Failed to store embedding for question ${question.id}:`,
              error,
            );
          }
        }

        let tag;
        try {
          tag = getQuestionTag(embedding);
        } catch (error) {
          if (!usingStoredEmbedding) throw error;

          console.warn(
            `Stored embedding for question ${question.id} is incompatible; regenerating it.`,
          );
          const generated = await generateQuestionEmbedding(sourceText, {
            questionId: question.id,
          });
          embedding = generated.embedding;
          if (!isValidEmbedding(embedding)) {
            throw new Error("Embedding provider returned an invalid vector.");
          }
          try {
            await storeQuestionVector({
              questionId: question.id,
              sourceText,
              embedding,
              status: "ready",
            });
          } catch (storeError) {
            console.error(
              `Failed to store regenerated embedding for question ${question.id}:`,
              storeError,
            );
          }
          tag = getQuestionTag(embedding);
        }
        await safeExecute(
          "UPDATE questions SET tag = ? WHERE question_id = ?",
          [tag, question.id],
        );
        taggedCount += 1;
        console.log(`Tagged question ${question.id}: ${tag}`);
      } catch (error) {
        failedCount += 1;
        console.error(`Failed to backfill question ${question.id}:`, error);
      }
    }

    console.log(
      `Tag backfill complete. Tagged: ${taggedCount}; failed: ${failedCount}.`,
    );
    if (failedCount > 0) process.exitCode = 1;
  } finally {
    await db.end();
  }
}

backfillTags().catch((error) => {
  console.error("Question tag backfill failed:", error);
  process.exitCode = 1;
});
