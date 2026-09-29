import { Users } from "lucide-react";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { getRelativeTime, plural } from "../../utils/data";
import btn from "../../styles/buttons.module.css";
import styles from "./RoomDetail.module.css";

/** View 2: not a member yet. Room info and a Join button. */
export default function JoinCard({ room, joining, joinError, onJoin }) {
  return (
    <section className={styles.joinCard}>
      <span className={styles.joinIcon}>
        <Users size={26} />
      </span>
      <div className={styles.joinTitle}>
        <h1>{room.name}</h1>
      </div>
      {room.description && <p>{room.description}</p>}
      <div className={styles.joinMeta}>
        <span>{plural(room.memberCount, "member")}</span>
        <span>{plural(room.messageCount, "message")}</span>
        <span>Active {getRelativeTime(room.lastActivityAt)}</span>
      </div>

      <p className={styles.joinNote}>
        Join this room to read its messages and to post.
      </p>
      <button
        type="button"
        className={`${btn.primaryButton} ${styles.joinButton}`}
        onClick={onJoin}
        disabled={joining}
      >
        {joining ? "Joining..." : "Join room"}
      </button>
      {joinError && <ErrorMessage message={joinError} />}
    </section>
  );
}
