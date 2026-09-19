/**
 * Measures how good semantic search and related questions are.
 * Run from the backEnd folder:  npm run measure
 *
 * It only READS the database. It never inserts, updates or deletes.
 * It needs the sample data first:  npm run seed
 * It makes 10 small Gemini calls (one per test search).
 *
 * It uses the 10 seed questions as a test set, because we know the right
 * answer for them: every topic (React, Node, MySQL, CSS, AI) has two questions.
 *
 * TEST 1 - Related questions: for each seed question, is the other question
 *          of the same topic ranked above the seed questions of other topics?
 * TEST 2 - Semantic search: 10 searches written in other words than the
 *          title. Is the expected question in the top 3?
 *
 * Both tests call the real service functions, so the numbers change when the
 * embedding code changes. Run it before and after a change and compare.
 */
import { db, safeExecute } from "./db.config.js";
import { findSimilarQuestionsByQuestionId } from "../src/api/question/service/vector.service.js";
import { searchQuestionsSemanticService } from "../src/api/question/service/question.service.js";

// The 10 seed questions (same titles as schema/seed.js), each with one test search.
const TEST_SET = [
  {
    topic: "React",
    title: "Why does my useEffect run twice in development?",
    search: "my effect hook fires two times when the page loads",
  },
  {
    topic: "React",
    title: "How do I cancel a fetch request when a component unmounts?",
    search: "stop a network call after the user leaves the page",
  },
  {
    topic: "Node",
    title: "Express returns 404 for /search because /:id matches first",
    search: "a route with a parameter catches my other route",
  },
  {
    topic: "Node",
    title: "How do I verify a JWT in Express middleware?",
    search: "check the login token before protected endpoints",
  },
  {
    topic: "MySQL",
    title: "COUNT with LEFT JOIN gives the wrong number of answers",
    search: "sql total is too high after joining two tables",
  },
  {
    topic: "MySQL",
    title: "What does ON DELETE CASCADE do on a foreign key?",
    search: "remove child rows automatically when the parent row is deleted",
  },
  {
    topic: "CSS",
    title: "How do I center a div vertically and horizontally with flexbox?",
    search: "put a box in the middle of the screen",
  },
  {
    topic: "CSS",
    title: "CSS Modules class name is undefined in my component",
    search: "imported styles object has no value for my class",
  },
  {
    topic: "AI",
    title: "What is cosine similarity and why is it used for semantic search?",
    search: "how to compare two embedding vectors",
  },
  {
    topic: "AI",
    title: "Embedding request fails when the model name is missing from .env",
    search: "AI vector call breaks because a setting is not configured",
  },
];

const MAX_K = 20; // the service functions never return more than 20
const short = (text, n = 46) =>
  text.length > n ? `${text.slice(0, n - 1)}…` : text.padEnd(n);
const fmt = (score) => (score === null ? " none" : score.toFixed(3));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadSeedQuestions() {
  const found = [];
  for (const item of TEST_SET) {
    const rows = await safeExecute(
      `SELECT q.question_id AS id, v.status AS vectorStatus
       FROM questions q
       LEFT JOIN question_vectors v ON v.question_id = q.question_id
       WHERE q.title = ?
       ORDER BY q.question_id ASC
       LIMIT 1`,
      [item.title],
    );
    if (rows.length > 0) found.push({ ...item, ...rows[0] });
  }
  return found;
}

async function testRelated(seed) {
  console.log("\nTEST 1 - Related questions");
  console.log(
    "question".padEnd(46),
    "| partner | best wrong | margin | #1 in the whole forum",
  );

  let correct = 0;
  let marginSum = 0;
  let lowestPartner = 1;
  let highestWrong = 0;

  for (const item of seed) {
    const results = await findSimilarQuestionsByQuestionId({
      questionId: item.id,
      threshold: 0,
      k: MAX_K,
    });

    const scoreOf = (id) =>
      results.find((r) => String(r.id) === String(id))?.score ?? null;

    const partner = seed.find(
      (s) => s.topic === item.topic && s.id !== item.id,
    );
    const partnerScore = partner ? scoreOf(partner.id) : null;
    const wrongScores = seed
      .filter((s) => s.topic !== item.topic)
      .map((s) => scoreOf(s.id) ?? 0);
    const bestWrong = Math.max(0, ...wrongScores);

    const isCorrect = partnerScore !== null && partnerScore > bestWrong;
    if (isCorrect) correct += 1;
    marginSum += (partnerScore ?? 0) - bestWrong;
    lowestPartner = Math.min(lowestPartner, partnerScore ?? 0);
    highestWrong = Math.max(highestWrong, bestWrong);

    const top = results[0];
    console.log(
      short(item.title),
      `|  ${fmt(partnerScore)}  |   ${fmt(bestWrong)}    | ${(
        (partnerScore ?? 0) - bestWrong
      )
        .toFixed(3)
        .padStart(6)} |`,
      top ? `${fmt(top.score)} ${short(top.title, 40)}` : "nothing",
      isCorrect ? "" : "  <-- WRONG",
    );
  }

  return {
    correct,
    total: seed.length,
    avgMargin: marginSum / seed.length,
    lowestPartner,
    highestWrong,
  };
}

async function testSearch(seed) {
  console.log("\nTEST 2 - Semantic search");
  console.log("search text".padEnd(46), "| rank | score | #1 result");

  let inTop3 = 0;
  let lowestHit = 1;
  let highestWrong = 0;

  for (const item of seed) {
    const { data } = await searchQuestionsSemanticService({
      query: item.search,
      k: MAX_K,
      threshold: 0,
    });

    const index = data.findIndex((r) => String(r.id) === String(item.id));
    const rank = index === -1 ? null : index + 1;
    const score = index === -1 ? null : data[index].score;

    if (rank !== null && rank <= 3) inTop3 += 1;
    lowestHit = Math.min(lowestHit, score ?? 0);

    const wrongSeedIds = seed
      .filter((s) => s.topic !== item.topic)
      .map((s) => String(s.id));
    const bestWrong = Math.max(
      0,
      ...data.filter((r) => wrongSeedIds.includes(String(r.id))).map((r) => r.score),
    );
    highestWrong = Math.max(highestWrong, bestWrong);

    console.log(
      short(item.search),
      `| ${String(rank ?? ">20").padStart(4)} | ${fmt(score)} |`,
      data[0] ? `${fmt(data[0].score)} ${short(data[0].title, 40)}` : "nothing",
      rank !== null && rank <= 3 ? "" : "  <-- MISSED",
    );

    await wait(300); // be gentle with the Gemini rate limit
  }

  return { inTop3, total: seed.length, lowestHit, highestWrong };
}

async function main() {
  const seed = await loadSeedQuestions();

  if (seed.length < TEST_SET.length) {
    console.log(
      `Found only ${seed.length} of ${TEST_SET.length} seed questions. Run "npm run seed" first.`,
    );
    return;
  }

  const notReady = seed.filter((s) => s.vectorStatus !== "ready");
  if (notReady.length > 0) {
    console.log(
      `${notReady.length} seed question(s) have no ready vector. The numbers below will be too low.`,
    );
  }

  const related = await testRelated(seed);
  const search = await testSearch(seed);

  console.log("\nSUMMARY (copy this into the PR)");
  console.log(
    `Related questions: ${related.correct} of ${related.total} correct, average margin ${related.avgMargin.toFixed(3)}`,
  );
  console.log(
    `  lowest score of a right partner: ${related.lowestPartner.toFixed(3)} | highest score of a wrong topic: ${related.highestWrong.toFixed(3)}`,
  );
  console.log(
    `Semantic search:   ${search.inTop3} of ${search.total} in the top 3`,
  );
  console.log(
    `  lowest score of an expected result: ${search.lowestHit.toFixed(3)} | highest score of a wrong topic: ${search.highestWrong.toFixed(3)}`,
  );
  console.log(
    "\nA good threshold sits between the two numbers on each line.",
  );
}

main()
  .catch((error) => {
    console.error("Measure failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
