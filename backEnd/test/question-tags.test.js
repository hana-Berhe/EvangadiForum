import "../test-support/test-env.js";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { QUESTION_TAGS } from "../src/api/question/constants/question-tags.js";
import { selectQuestionTag } from "../src/api/question/service/question-tagging.service.js";
import { getTagsService } from "../src/api/tag/service/tag.service.js";

// One fake "direction" per tag: tag i points along axis i.
const fakeTagEmbeddings = QUESTION_TAGS.map((_, i) =>
  QUESTION_TAGS.map((__, j) => (i === j ? 1 : 0)),
);
const indexOf = (name) => QUESTION_TAGS.findIndex((tag) => tag.name === name);

describe("QUESTION_TAGS list", () => {
  test("every tag has a unique name, a description and matching examples", () => {
    const names = QUESTION_TAGS.map((tag) => tag.name);
    assert.equal(new Set(names).size, names.length, "duplicate tag name");
    for (const tag of QUESTION_TAGS) {
      assert.ok(tag.description.length > 0, `${tag.name} has no description`);
      assert.ok(tag.examples.length > 40, `${tag.name} needs longer examples`);
    }
  });

  test("the tags API shows only name and description", async () => {
    const tags = await getTagsService();
    assert.equal(tags.length, QUESTION_TAGS.length);
    for (const tag of tags) {
      assert.deepEqual(Object.keys(tag).sort(), ["description", "name"]);
    }
  });
});

describe("selectQuestionTag", () => {
  test("picks the tag whose embedding is closest to the question", () => {
    const question = fakeTagEmbeddings[indexOf("database")].map((v, i) =>
      i === indexOf("nodejs-express") ? 0.4 : v,
    );
    assert.equal(selectQuestionTag(question, fakeTagEmbeddings), "database");
  });

  test("every tag can win (no tag is impossible to get)", () => {
    for (const tag of QUESTION_TAGS) {
      const question = fakeTagEmbeddings[indexOf(tag.name)];
      assert.equal(selectQuestionTag(question, fakeTagEmbeddings), tag.name);
    }
  });

  test("rejects an invalid question embedding", () => {
    assert.throws(() => selectQuestionTag([], fakeTagEmbeddings), /invalid/);
    assert.throws(() => selectQuestionTag([1, NaN], fakeTagEmbeddings), /invalid/);
  });

  test("rejects an incomplete list of tag embeddings", () => {
    assert.throws(
      () => selectQuestionTag([1, 0], fakeTagEmbeddings.slice(0, 3)),
      /incomplete/,
    );
  });
});
