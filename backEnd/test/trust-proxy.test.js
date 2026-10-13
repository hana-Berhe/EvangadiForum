import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { parseTrustProxy } from "../src/utility/trustProxy.js";

describe("parseTrustProxy (reading the TRUST_PROXY setting)", () => {
  test("should fall back to 2 proxies when the setting is missing or empty", () => {
    assert.equal(parseTrustProxy(undefined), 2);
    assert.equal(parseTrustProxy(""), 2);
    assert.equal(parseTrustProxy("   "), 2);
  });

  test("should turn a whole number into a proxy count", () => {
    assert.equal(parseTrustProxy("1"), 1);
    assert.equal(parseTrustProxy(" 3 "), 3);
    assert.equal(parseTrustProxy("0"), 0);
  });

  test("should turn true and false into booleans", () => {
    assert.equal(parseTrustProxy("true"), true);
    assert.equal(parseTrustProxy("false"), false);
  });

  test("should keep any other value as text, such as a list of IP ranges", () => {
    assert.equal(parseTrustProxy("loopback"), "loopback");
    assert.equal(
      parseTrustProxy("loopback, 10.0.0.0/8"),
      "loopback, 10.0.0.0/8",
    );
  });
});
