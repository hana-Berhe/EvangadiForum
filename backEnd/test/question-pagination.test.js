import "../test-support/test-env.js";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  buildCursorCondition,
  decodeQuestionCursor,
  encodeQuestionCursor,
  normalizePageSize,
} from "../src/api/question/service/question-pagination.js";

describe("normalizePageSize (how many questions one page holds)", () => {
  test("should return 100 questions when no limit is given, like before pagination", () => {
    assert.equal(DEFAULT_PAGE_SIZE, 100);
    assert.equal(normalizePageSize(undefined), 100);
    assert.equal(normalizePageSize("not a number"), 100);
  });

  test("should use the requested limit when it is within range", () => {
    assert.equal(normalizePageSize(20), 20);
    assert.equal(normalizePageSize("5"), 5);
  });

  test("should cap the limit at 100 when a client asks for more", () => {
    assert.equal(normalizePageSize(5000), MAX_PAGE_SIZE);
  });

  test("should fall back to the default when the limit is zero or negative", () => {
    assert.equal(normalizePageSize(0), 100);
    assert.equal(normalizePageSize(-3), 100);
  });
});

describe("question cursors (where the next page starts)", () => {
  test("should give back the same date and id after encoding and decoding", () => {
    const createdAt = new Date("2026-10-12T09:30:00.000Z");
    const cursor = encodeQuestionCursor({ createdAt, id: 42 });
    const position = decodeQuestionCursor(cursor);
    assert.equal(position.id, 42);
    assert.equal(position.createdAt.getTime(), createdAt.getTime());
  });

  test("should produce a cursor that is safe to put in a URL", () => {
    const cursor = encodeQuestionCursor({ createdAt: new Date(), id: 7 });
    assert.match(cursor, /^[A-Za-z0-9_-]+$/);
  });

  test("should reject a cursor that is not valid JSON with 400 Bad Request", () => {
    assert.throws(
      () => decodeQuestionCursor("hello"),
      (error) => error.statusCode === 400 && /Invalid cursor/.test(error.message),
    );
  });

  test("should reject a cursor whose id is missing, zero or not a number", () => {
    const make = (value) =>
      Buffer.from(JSON.stringify(value)).toString("base64url");
    for (const bad of [{ t: 1 }, { t: 1, id: 0 }, { t: 1, id: "1; DROP" }]) {
      assert.throws(() => decodeQuestionCursor(make(bad)), /Invalid cursor/);
    }
  });
});

describe("buildCursorCondition (SQL for questions after the cursor)", () => {
  test("should continue with older questions and break same-second ties by id", () => {
    const createdAt = new Date("2026-10-12T09:30:00.000Z");
    const { condition, params } = buildCursorCondition({ createdAt, id: 42 });
    assert.equal(
      condition,
      "(q.created_at < ? OR (q.created_at = ? AND q.question_id < ?))",
    );
    assert.deepEqual(params, [createdAt, createdAt, 42]);
  });

  test("should pass the cursor values as parameters, never inside the SQL text", () => {
    const { condition } = buildCursorCondition({
      createdAt: new Date(0),
      id: 99,
    });
    assert.ok(!condition.includes("99"));
  });
});
