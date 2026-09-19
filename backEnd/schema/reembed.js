/**
 * Rebuilds the vector of every question with the current embedding code.
 * Run from the backEnd folder:  npm run reembed
 *
 * When to run it:
 * - after the text that is embedded changes (for example title -> title + content)
 * - to retry vectors that are marked "failed"
 *
 * It is safe to run again: a question whose vector is already ready and was
 * built from the same text is skipped, so a second run only does what is left.
 *
 * It never deletes anything. It only writes to the question_vectors table.
 * If Gemini fails for a question, that question keeps the vector it had, and
 * you can run the script again later.
 *
 * Cost: one Gemini embedding call per question that needs a new vector.
 */
import { db, safeExecute } from "./db.config.js";
import {
  generateQuestionEmbedding,
  normalizeQuestionText,
  storeQuestionVector,
} from "../src/api/question/service/vector.service.js";

const PAUSE_MS = 300; // be gentle with the Gemini rate limit
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const questions = await safeExecute(
    `SELECT q.question_id AS id, q.title, q.content,
            v.source_text AS sourceText, v.status
     FROM questions q
     LEFT JOIN question_vectors v ON v.question_id = q.question_id
     ORDER BY q.question_id ASC`,
    [],
  );

  console.log(`Questions found: ${questions.length}`);

  let rebuilt = 0;
  let skipped = 0;
  let failed = 0;

  for (const question of questions) {
    const sourceText = normalizeQuestionText({
      title: question.title,
      content: question.content,
    });

    if (question.status === "ready" && question.sourceText === sourceText) {
      skipped += 1;
      continue;
    }

    try {
      const { embedding } = await generateQuestionEmbedding(sourceText, {
        questionId: question.id,
      });
      await storeQuestionVector({
        questionId: question.id,
        sourceText,
        embedding,
        status: "ready",
      });
      rebuilt += 1;
      console.log(`  ok      #${question.id} ${question.title}`);
    } catch (error) {
      failed += 1;
      console.log(`  FAILED  #${question.id} ${question.title}`);
      console.log(`          ${error.message}`);
    }

    await wait(PAUSE_MS);
  }

  console.log("\nDone.");
  console.log(`  Rebuilt: ${rebuilt}`);
  console.log(`  Skipped (already up to date): ${skipped}`);
  console.log(`  Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nRun "npm run reembed" again to retry the failed ones.');
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Reembed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
