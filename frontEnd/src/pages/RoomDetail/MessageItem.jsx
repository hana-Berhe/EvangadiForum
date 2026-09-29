import UserAvatar from "../../components/UserAvatar/UserAvatar";
import styles from "./RoomDetail.module.css";

// "10:07" for today, "16 Sep, 10:07" for another day.
function formatMessageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (date.toDateString() === new Date().toDateString()) return time;
  const day = date.toLocaleDateString([], { day: "numeric", month: "short" });
  return `${day}, ${time}`;
}

/** One message. The text is ALWAYS plain text, never HTML. */
export default function MessageItem({ message, own }) {
  const bubble = (
    <div className={`${styles.bubble}${own ? ` ${styles.bubbleOwn}` : ""}`}>
      <div className={styles.messageHead}>
        <strong>
          {own
            ? "You"
            : `${message.author.firstName} ${message.author.lastName}`}
        </strong>
        <time dateTime={message.createdAt}>
          {formatMessageTime(message.createdAt)}
        </time>
      </div>
      <p>{message.content}</p>
    </div>
  );

  // Other people: avatar on the left. Your own messages: on the right.
  return (
    <li className={`${styles.message}${own ? ` ${styles.messageOwn}` : ""}`}>
      {!own && <UserAvatar person={message.author} />}
      {bubble}
      {own && <UserAvatar person={message.author} />}
    </li>
  );
}
