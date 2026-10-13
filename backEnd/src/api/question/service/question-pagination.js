// Cursor ("load more") pagination for the question feed.
//
// The feed is sorted newest first: by created_at, then by question_id, so two
// questions posted in the same second still have a fixed order. A cursor is
// the position of the last question the client already has. The next page is
// every question that comes after it in that order.
//
// Unlike page numbers, a cursor does not shift when someone posts a new
// question while you are reading, so nothing is shown twice or skipped.

import { BadRequestError } from "../../../utility/errors/errors.js";

// Without a limit the API returns 100 questions, as it did before pagination,
// so older frontends keep working. The "load more" UI asks for fewer.
export const DEFAULT_PAGE_SIZE = 100;
export const MAX_PAGE_SIZE = 100;

/**
 * Clamps the requested page size to 1..MAX_PAGE_SIZE.
 * @param {number|string|undefined} limit
 * @returns {number} A whole number that is safe to put in the SQL LIMIT.
 */
export function normalizePageSize(limit) {
  const size = Number.parseInt(limit, 10);
  if (!Number.isFinite(size) || size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

/**
 * Turns the last question of a page into an opaque cursor string.
 * @param {{ createdAt: Date|string, id: number }} question
 * @returns {string}
 */
export function encodeQuestionCursor({ createdAt, id }) {
  const time = new Date(createdAt).getTime();
  return Buffer.from(JSON.stringify({ t: time, id: Number(id) })).toString(
    "base64url",
  );
}

/**
 * Reads a cursor sent by the client.
 * @param {string} cursor
 * @returns {{ createdAt: Date, id: number }}
 * @throws {BadRequestError} If the cursor was not made by this API.
 */
export function decodeQuestionCursor(cursor) {
  try {
    const { t, id } = JSON.parse(
      Buffer.from(String(cursor), "base64url").toString("utf8"),
    );
    const validTime = Number.isSafeInteger(t) && t >= 0;
    const validId = Number.isSafeInteger(id) && id > 0;
    if (validTime && validId) return { createdAt: new Date(t), id };
  } catch {
    // Falls through to the error below.
  }
  throw new BadRequestError("Invalid cursor. Start again from the first page.");
}

/**
 * SQL condition for "questions after the cursor" in newest-first order.
 * Both values go in as ? parameters, never into the SQL text.
 * @param {{ createdAt: Date, id: number }} position
 * @returns {{ condition: string, params: Array }}
 */
export function buildCursorCondition({ createdAt, id }) {
  return {
    condition: "(q.created_at < ? OR (q.created_at = ? AND q.question_id < ?))",
    params: [createdAt, createdAt, id],
  };
}
