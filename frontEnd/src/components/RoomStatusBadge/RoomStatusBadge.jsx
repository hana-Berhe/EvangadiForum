// ROOMS FEATURE OWNERSHIP: A = Browse & view rooms, Whole file. Search "[Rooms X" (your letter) to find your parts.
import { Lock } from "lucide-react";
import styles from "./RoomStatusBadge.module.css";

/** The green "Open" or grey "Closed" badge of a discussion room. */
export default function RoomStatusBadge({ status }) {
  if (status === "closed") {
    return (
      <span className={`${styles.badge} ${styles.closed}`}>
        <Lock size={12} />
        Closed
      </span>
    );
  }
  return (
    <span className={`${styles.badge} ${styles.open}`}>
      <span className={styles.dot} />
      Open
    </span>
  );
}
