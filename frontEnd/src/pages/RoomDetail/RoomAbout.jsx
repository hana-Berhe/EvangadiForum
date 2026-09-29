import { CalendarDays, MessageSquare, Users } from "lucide-react";
import styles from "./RoomDetail.module.css";

// "Sep 19" for the About card.
function formatShortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

/** The right column of the member view: about the room. */
export default function RoomAbout({ room, messageCount }) {
  const memberCount = room.memberCount;

  return (
    <aside className={styles.side}>
      <section className={styles.sideCard}>
        <h2>About this room</h2>
        <p className={styles.aboutText}>
          {room.description || "This room has no description."}
        </p>
        <dl className={styles.stats}>
          <div>
            <Users size={18} />
            <dd>{memberCount}</dd>
            <dt>{memberCount === 1 ? "Member" : "Members"}</dt>
          </div>
          <div>
            <MessageSquare size={18} />
            <dd>{messageCount}</dd>
            <dt>Messages</dt>
          </div>
          <div>
            <CalendarDays size={18} />
            <dd>{formatShortDate(room.createdAt)}</dd>
            <dt>Created</dt>
          </div>
        </dl>
        <p className={styles.createdBy}>
          Created by <strong>Evangadi Forum</strong>
        </p>
      </section>
    </aside>
  );
}
