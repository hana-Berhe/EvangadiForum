import "../test-support/test-env.js";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { chunkTextWithOverlap } from "../src/api/rag/service/rag.service.js";

// "word0 word1 word2 ..." : easy to check that no word is cut in half.
const words = (count) =>
  Array.from({ length: count }, (_, i) => `word${i}`).join(" ");

describe("chunkTextWithOverlap", () => {
  test("empty or blank text gives no chunks", () => {
    assert.deepEqual(chunkTextWithOverlap(""), []);
    assert.deepEqual(chunkTextWithOverlap("   \n\t  "), []);
  });

  test("short text becomes exactly one chunk", () => {
    const chunks = chunkTextWithOverlap("Hello world, this is a short PDF.");
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].content, "Hello world, this is a short PDF.");
  });

  test("extra spaces and tabs are cleaned", () => {
    const chunks = chunkTextWithOverlap("  one   two\t\tthree  ");
    assert.equal(chunks[0].content, "one two three");
  });

  test("long text is split into chunks of at most 1000 characters", () => {
    const chunks = chunkTextWithOverlap(words(1000)); // about 7,900 chars
    assert.ok(chunks.length > 1, "expected more than one chunk");
    for (const chunk of chunks) {
      assert.ok(chunk.content.length <= 1000, `chunk too long: ${chunk.content.length}`);
    }
  });

  test("neighbouring chunks overlap, so boundary sentences are not lost", () => {
    const chunks = chunkTextWithOverlap(words(1000));
    for (let i = 1; i < chunks.length; i += 1) {
      assert.ok(
        chunks[i].start < chunks[i - 1].end,
        `chunk ${i} does not overlap chunk ${i - 1}`,
      );
    }
  });

  test("chunks start and end on whole words", () => {
    const chunks = chunkTextWithOverlap(words(1000));
    for (const chunk of chunks) {
      for (const piece of chunk.content.split(" ")) {
        assert.match(piece, /^word\d+$/, `cut word found: "${piece}"`);
      }
    }
  });

  test("every word of the text ends up in some chunk", () => {
    const text = words(1000);
    const seen = new Set(
      chunkTextWithOverlap(text).flatMap((chunk) => chunk.content.split(" ")),
    );
    for (const word of text.split(" ")) {
      assert.ok(seen.has(word), `missing word: ${word}`);
    }
  });

  test("never makes more than 1000 chunks, even for a huge text", () => {
    const huge = "abcdefghi ".repeat(200_000); // 2,000,000 chars
    assert.equal(chunkTextWithOverlap(huge).length, 1000);
  });
});
