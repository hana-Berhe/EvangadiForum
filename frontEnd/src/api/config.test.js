import { describe, expect, it } from "vitest";
import { normalizeApiBaseUrl } from "./config.js";

describe("normalizeApiBaseUrl", () => {
  it("keeps a correct address as it is", () => {
    expect(normalizeApiBaseUrl("https://my-api.onrender.com/api")).toBe(
      "https://my-api.onrender.com/api",
    );
  });

  it("removes a trailing slash", () => {
    expect(normalizeApiBaseUrl("https://my-api.onrender.com/api/")).toBe(
      "https://my-api.onrender.com/api",
    );
  });

  it('adds "/api" when it is missing', () => {
    expect(normalizeApiBaseUrl("https://my-api.onrender.com")).toBe(
      "https://my-api.onrender.com/api",
    );
    expect(normalizeApiBaseUrl("https://my-api.onrender.com/")).toBe(
      "https://my-api.onrender.com/api",
    );
  });

  it("ignores spaces around the address", () => {
    expect(normalizeApiBaseUrl("  http://localhost:5000/api  ")).toBe(
      "http://localhost:5000/api",
    );
  });

  it("falls back to the local backend when nothing is set", () => {
    expect(normalizeApiBaseUrl(undefined)).toBe("http://localhost:5000/api");
    expect(normalizeApiBaseUrl("")).toBe("http://localhost:5000/api");
  });
});
