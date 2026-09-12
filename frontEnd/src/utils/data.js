export function unwrapArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

export function getQuestionId(question) {
  return question?.question_id ?? question?.questionId ?? question?.id ?? null;
}

/**
 * Reads the id of whoever wrote a question or an answer.
 * The API nests it as `author: { id, firstName, lastName }`; the flat keys are
 * fallbacks for older shapes.
 */
export function getQuestionOwnerId(question) {
  return (
    question?.author?.id ??
    question?.user_id ??
    question?.userId ??
    question?.author_id ??
    question?.authorId ??
    null
  );
}

/**
 * Builds a display name from the same nested `author` object.
 */
export function getAuthorName(item, fallback = "Forum member") {
  const firstName =
    item?.author?.firstName ?? item?.firstName ?? item?.first_name ?? "";

  const lastName =
    item?.author?.lastName ?? item?.lastName ?? item?.last_name ?? "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || item?.author_name || item?.user_name || fallback;
}

/**
 * Two-letter initials for avatar bubbles, derived from getAuthorName.
 */
export function getAuthorInitials(item, fallback = "FM") {
  const initials = getAuthorName(item, "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (initials || fallback).toUpperCase();
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}
