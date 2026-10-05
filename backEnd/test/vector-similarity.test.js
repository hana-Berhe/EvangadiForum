import "../test-support/test-env.js";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { calculateCosineSimilarity } from "../src/api/question/service/vector.service.js";

const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} is not ${expected}`);

describe("calculateCosineSimilarity", () => {
  test("identical direction scores 1", () => {
    close(calculateCosineSimilarity([1, 2, 3], [2, 4, 6]), 1);
  });

  test("unrelated (perpendicular) vectors score 0", () => {
    close(calculateCosineSimilarity([1, 0], [0, 1]), 0);
  });

  test("opposite vectors score -1", () => {
    close(calculateCosineSimilarity([1, 1], [-1, -1]), -1);
  });

  test("vectors of different sizes are an error", () => {
    assert.throws(() => calculateCosineSimilarity([1, 2], [1, 2, 3]), /same length/);
  });
});
