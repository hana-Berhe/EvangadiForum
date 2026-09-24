import styles from "./UserAvatar.module.css";

// Soft background + darker initials of the same color family.
// Every pair is checked for readable contrast.
const COLORS = [
  { background: "#ede4ff", color: "#6b3fc4" }, // purple
  { background: "#d9e8ff", color: "#1f5fbf" }, // blue
  { background: "#dcf5e3", color: "#1f7a3d" }, // green
  { background: "#ffe4d1", color: "#b04508" }, // orange
  { background: "#ffdfe9", color: "#c0396b" }, // pink
  { background: "#d5f3f1", color: "#0f766e" }, // teal
  { background: "#fff1c9", color: "#8a6100" }, // yellow
  { background: "#ffe0dd", color: "#b3362b" }, // red
];

// The color comes from the user id, so one person has the same color in
// every room and on every page. Without an id, the name decides.
function colorFor(person) {
  const id = Number(person?.id);
  if (Number.isInteger(id) && id > 0) return COLORS[id % COLORS.length];
  const name = `${person?.firstName ?? ""}${person?.lastName ?? ""}`;
  let sum = 0;
  for (const char of name) sum += char.codePointAt(0);
  return COLORS[sum % COLORS.length];
}

function initialsOf(person) {
  const first = person?.firstName?.trim()?.[0] ?? "";
  const last = person?.lastName?.trim()?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
}

/**
 * A round avatar with two initials.
 * @param {{ person: { id?: number, firstName?: string, lastName?: string },
 *           size?: "small" | "nav" | "thread" | "medium" | "large" }} props
 */
export default function UserAvatar({ person, size = "medium" }) {
  return (
    <span
      className={`${styles.avatar} ${styles[size] ?? styles.medium}`}
      style={colorFor(person)}
      // The name is already written next to the avatar, so a screen reader
      // does not need to read the initials too.
      aria-hidden="true"
    >
      {initialsOf(person)}
    </span>
  );
}
