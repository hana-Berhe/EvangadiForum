import "../test-support/test-env.js";
import { describe, test, before, after } from "node:test";
import assert from "node:assert/strict";
import { parseJsonObject } from "../src/api/question/service/geminiTextCoach.service.js";

// parseJsonObject logs bad replies with console.error. Silence it here so the
// test output stays readable (the logging itself is expected behaviour).
let originalError;
before(() => {
  originalError = console.error;
  console.error = () => {};
});
after(() => {
  console.error = originalError;
});

describe("parseJsonObject (reading Gemini's JSON replies)", () => {
  test("parses a clean JSON object", () => {
    assert.deepEqual(parseJsonObject('{"level":"strong","note":"Good."}'), {
      level: "strong",
      note: "Good.",
    });
  });

  test("removes a ```json code fence around the reply", () => {
    const raw = '```json\n{"tips":["Add an example"]}\n```';
    assert.deepEqual(parseJsonObject(raw), { tips: ["Add an example"] });
  });

  test("removes a plain ``` code fence too", () => {
    assert.deepEqual(parseJsonObject('```\n{"a":1}\n```'), { a: 1 });
  });

  test("repairs short junk after the JSON (seen in real Gemini replies)", () => {
    assert.deepEqual(parseJsonObject('{"answer":"Use JWT."}}'), {
      answer: "Use JWT.",
    });
    assert.deepEqual(parseJsonObject('{"answer":"Use JWT."(-0)}'), {
      answer: "Use JWT.",
    });
  });

  test("braces inside a string value do not confuse the repair", () => {
    assert.deepEqual(parseJsonObject('{"answer":"if (x) { y(); }"}}'), {
      answer: "if (x) { y(); }",
    });
  });

  test("refuses to cut a reply that broke in the middle of the text", () => {
    // A quote in the junk means the text itself is broken; showing half an
    // answer would be worse than showing none.
    assert.equal(parseJsonObject('{"answer":"Use JWT.","note":"unfinish'), null);
  });

  test("rejects plain text, arrays and empty input", () => {
    assert.equal(parseJsonObject("Sorry, I cannot help with that."), null);
    assert.equal(parseJsonObject("[1,2,3]"), null);
    assert.equal(parseJsonObject(""), null);
    assert.equal(parseJsonObject(null), null);
    assert.equal(parseJsonObject(undefined), null);
  });
});
