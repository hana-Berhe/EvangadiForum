import { useState } from "react";
import styles from "./UserAvatar.module.css";

const COLORS = [
  { background: "#ede4ff", color: "#6b3fc4" },
  { background: "#d9e8ff", color: "#1f5fbf" },
  { background: "#dcf5e3", color: "#1f7a3d" },
  { background: "#ffe4d1", color: "#b04508" },
  { background: "#ffdfe9", color: "#c0396b" },
  { background: "#d5f3f1", color: "#0f766e" },
  { background: "#fff1c9", color: "#8a6100" },
  { background: "#ffe0dd", color: "#b3362b" },
];

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

function resolveAvatarUrl(avatar) {
  if (!avatar || typeof avatar !== "string") return null;
  const trimmed = avatar.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const origin = apiBase.replace(/\/api$/, "");
    return `${origin}${trimmed}`;
  }

  return trimmed;
}

export default function UserAvatar({ person, size = "medium" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = resolveAvatarUrl(person?.avatar);

  if (avatarUrl && !imageFailed) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${styles.avatar} ${styles[size] ?? styles.medium}`}
        style={{ objectFit: "cover" }}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${styles.avatar} ${styles[size] ?? styles.medium}`}
      style={colorFor(person)}
      aria-hidden="true"
    >
      {initialsOf(person)}
    </span>
  );
}
