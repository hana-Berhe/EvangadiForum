/**
 * Builds a display name. Every question and answer from the API carries
 * `author: { id, firstName, lastName }`.
 */
export function getAuthorName(item) {
  return `${item.author.firstName} ${item.author.lastName}`;
}

/**
 * Two-letter initials for avatar bubbles, derived from getAuthorName.
 */
export function getAuthorInitials(item) {
  return getAuthorName(item)
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.msg ||
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
