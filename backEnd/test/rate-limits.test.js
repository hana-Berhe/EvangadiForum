import "../test-support/test-env.js";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { createAuthRateLimit } from "../src/middleware/auth-rate-limit.js";
import { createUserRateLimit } from "../src/middleware/user-rate-limit.js";

// Runs a middleware once with a fake request and response.
// Resolves to 200 when the request is let through, or the error's status.
const call = (middleware, req) =>
  new Promise((resolve) => {
    const res = { headers: {}, set(name, value) { this.headers[name] = value; } };
    middleware(req, res, (error) =>
      resolve({
        status: error ? error.statusCode : 200,
        message: error?.message,
        retryAfter: res.headers["Retry-After"],
      }),
    );
  });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("createAuthRateLimit (login and register, per IP)", () => {
  test("should allow 10 attempts from one IP, then block the 11th with 429 and a Retry-After header", async () => {
    const limit = createAuthRateLimit();
    const ip = "10.0.0.1";
    for (let i = 1; i <= 10; i += 1) {
      assert.equal((await call(limit, { ip })).status, 200, `attempt ${i}`);
    }
    const blocked = await call(limit, { ip });
    assert.equal(blocked.status, 429);
    assert.match(blocked.message, /Too many attempts/);
    assert.ok(Number(blocked.retryAfter) > 0, "Retry-After header is set");
  });

  test("should keep allowing other IPs when one IP is blocked", async () => {
    const limit = createAuthRateLimit();
    for (let i = 0; i < 11; i += 1) await call(limit, { ip: "10.0.0.2" });
    assert.equal((await call(limit, { ip: "10.0.0.2" })).status, 429);
    assert.equal((await call(limit, { ip: "10.0.0.3" })).status, 200);
  });

  test("should still allow register from an IP that is blocked on login", async () => {
    const loginLimit = createAuthRateLimit({ max: 2 });
    const registerLimit = createAuthRateLimit({ max: 2 });
    const ip = "10.0.0.4";
    for (let i = 0; i < 2; i += 1) await call(loginLimit, { ip });
    assert.equal((await call(loginLimit, { ip })).status, 429);
    assert.equal((await call(registerLimit, { ip })).status, 200);
  });

  test("should forget the oldest IP when it tracks more IPs than its cap", async () => {
    const limit = createAuthRateLimit({ max: 1, maxTrackedIps: 2 });
    await call(limit, { ip: "10.0.0.5" });
    assert.equal((await call(limit, { ip: "10.0.0.5" })).status, 429);
    // Two new IPs fill the cap, so the oldest one (10.0.0.5) is forgotten.
    await call(limit, { ip: "10.0.0.6" });
    await call(limit, { ip: "10.0.0.7" });
    assert.equal((await call(limit, { ip: "10.0.0.5" })).status, 200);
  });
});

describe("createUserRateLimit (AI and chat, per user)", () => {
  test("should allow `max` requests per user, then block the next one with 429", async () => {
    const limit = createUserRateLimit({ max: 3, what: "AI requests" });
    const req = { user: { id: 1 } };
    for (let i = 0; i < 3; i += 1) assert.equal((await call(limit, req)).status, 200);
    const blocked = await call(limit, req);
    assert.equal(blocked.status, 429);
    assert.match(blocked.message, /Too many AI requests/);
  });

  test("should count each user separately, so a blocked user does not block others", async () => {
    const limit = createUserRateLimit({ max: 1 });
    assert.equal((await call(limit, { user: { id: 1 } })).status, 200);
    assert.equal((await call(limit, { user: { id: 1 } })).status, 429);
    assert.equal((await call(limit, { user: { id: 2 } })).status, 200);
  });

  test("should let a blocked user through again once the time window ends", async () => {
    const limit = createUserRateLimit({ max: 1, windowMs: 50 });
    const req = { user: { id: 7 } };
    assert.equal((await call(limit, req)).status, 200);
    assert.equal((await call(limit, req)).status, 429);
    await wait(70);
    assert.equal((await call(limit, req)).status, 200);
  });

  test("should forget the oldest user when it tracks more users than its cap", async () => {
    const limit = createUserRateLimit({ max: 1, maxTrackedUsers: 2 });
    await call(limit, { user: { id: 1 } });
    assert.equal((await call(limit, { user: { id: 1 } })).status, 429);
    // Two new users fill the cap, so the oldest one (user 1) is forgotten.
    await call(limit, { user: { id: 2 } });
    await call(limit, { user: { id: 3 } });
    assert.equal((await call(limit, { user: { id: 1 } })).status, 200);
  });
});
