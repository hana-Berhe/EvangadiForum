import "../test-support/test-env.js";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  smallTalkReply,
  extractKeywords,
  pickBestCandidates,
  buildThreadText,
  scoreVector,
} from "../src/api/chat/service/chat.service.js";

describe("smallTalkReply (answers greetings without calling Gemini)", () => {
  const cases = [
    ["hi", "greeting"],
    ["Hello!!", "greeting"],
    ["how are you?", "howAreYou"],
    ["Thank you!", "thanks"],
    ["ok cool", "acknowledge"],
    ["bye", "bye"],
  ];
  for (const [message, kind] of cases) {
    test(`"${message}" is small talk (${kind})`, () => {
      const reply = smallTalkReply(message);
      assert.ok(reply, "expected a canned reply");
      assert.equal(reply.kind, kind);
      assert.ok(reply.text.length > 0);
      assert.ok(Array.isArray(reply.suggestions));
    });
  }

  test("a real question is NOT small talk", () => {
    assert.equal(smallTalkReply("How does JWT login work?"), null);
    assert.equal(smallTalkReply("hi, how do I connect MySQL to Express?"), null);
  });

  test("uses the user's first name when given", () => {
    const reply = smallTalkReply("bye", "Hana");
    assert.match(reply.text, /Hana/);
  });
});

describe("extractKeywords (keyword fallback search)", () => {
  test("lowercases, removes duplicates and keeps content words", () => {
    const keywords = extractKeywords("React React HOOKS useEffect");
    assert.ok(keywords.includes("react"));
    assert.ok(keywords.includes("hooks"));
    assert.equal(keywords.filter((k) => k === "react").length, 1);
  });

  test("drops common stop words", () => {
    const keywords = extractKeywords("what is the best way to use react");
    assert.ok(!keywords.includes("the"));
    assert.ok(!keywords.includes("is"));
    assert.ok(keywords.includes("react"));
  });

  test("returns at most 5 keywords", () => {
    const keywords = extractKeywords(
      "express mysql react node docker nginx redis jwt gemini",
    );
    assert.ok(keywords.length <= 5);
  });

  test("empty message gives no keywords", () => {
    assert.deepEqual(extractKeywords(""), []);
  });
});

describe("pickBestCandidates", () => {
  test("mixes threads and PDF chunks, best score first, at most 5", () => {
    const threads = [0.7, 0.9, 0.65].map((score, i) => ({ kind: "thread", id: i, score }));
    const chunks = [0.8, 0.95, 0.6, 0.75].map((score, i) => ({ kind: "document", id: i, score }));
    const best = pickBestCandidates(threads, chunks);
    assert.deepEqual(
      best.map((c) => c.score),
      [0.95, 0.9, 0.8, 0.75, 0.7],
    );
  });
});

describe("buildThreadText (what Gemini sees about a thread)", () => {
  test("says so when a question has no answers", () => {
    const text = buildThreadText({ content: "How do I hash passwords?", answers: [] });
    assert.match(text, /Question: How do I hash passwords\?/);
    assert.match(text, /no answers yet/);
  });

  test("includes each answer and is cut to 3000 characters + \"...\"", () => {
    const text = buildThreadText({
      content: "Q".repeat(5000),
      answers: Array.from({ length: 20 }, () => ({ content: "A".repeat(5000) })),
    });
    assert.match(text, /Answer: /);
    // cut() keeps 3000 characters and adds "..." so Gemini can tell the
    // thread was shortened.
    assert.equal(text.length, 3000 + "...".length);
    assert.ok(text.endsWith("..."));
  });
});

describe("scoreVector (reading stored vectors from MySQL)", () => {
  test("scores an array vector", () => {
    assert.equal(scoreVector([1, 0], [1, 0]), 1);
  });

  test("accepts a vector stored as a JSON string", () => {
    assert.equal(scoreVector([1, 0], "[1, 0]"), 1);
  });

  test("skips broken or wrong-sized vectors instead of crashing", () => {
    assert.equal(scoreVector([1, 0], "not json"), null);
    assert.equal(scoreVector([1, 0], [1, 0, 0]), null);
    assert.equal(scoreVector([1, 0], null), null);
  });
});
