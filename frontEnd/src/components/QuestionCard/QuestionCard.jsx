import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAuthorInitials,
  getAuthorName,
  getRelativeTime,
} from "../../utils/data";
import styles from "./QuestionCard.module.css";
import ui from "../../styles/pageStates.module.css";

export default function QuestionCard({ question, yours = false }) {
  const author = getAuthorName(question);
  const initials = getAuthorInitials(question);
  const relativeTime = getRelativeTime(question.createdAt);

  return (
    <Link
      to={`/questions/${question.questionHash}`}
      className={`${ui.threadRow}${yours ? ` ${ui.yours}` : ""}`}
    >
      <span className={ui.threadAvatar}>{initials}</span>

      <div className={styles.threadMain}>
        <div className={styles.threadTitleRow}>
          <h3>{question.title}</h3>

          {yours && <span className={styles.yoursBadge}>Yours</span>}
        </div>

        <p>{question.content}</p>

        <div className={styles.threadMeta}>
          <span>
            <MessageSquare size={13} /> {question.answerCount} replies
          </span>

          <span>
            {relativeTime} by {yours ? "You" : author}
          </span>
        </div>
      </div>
    </Link>
  );
}
