
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
 * 
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

export function getRelativeTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);

  return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
}
