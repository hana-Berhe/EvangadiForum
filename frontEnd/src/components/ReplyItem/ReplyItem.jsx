import { Check, Pencil, Trash2, UserRound, X } from "lucide-react";
import { useState } from "react";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor";
import { getAuthorName, getQuestionOwnerId } from "../../utils/data";
import btn from "../../styles/buttons.module.css";
import styles from "./ReplyItem.module.css";
import ui from "../../styles/pageStates.module.css";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ReplyItem({
  answer,
  currentUserId,
  onUpdate,
  onDelete,
  busy = false,
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(answer.content || "");

  const answerUserId = getQuestionOwnerId(answer);

  const isOwner =
    currentUserId != null &&
    answerUserId != null &&
    String(currentUserId) === String(answerUserId);

  const author = getAuthorName(answer);

  async function handleUpdate() {
    const value = content.trim();
    if (value.length < 20) return;

    await onUpdate?.(answer.answer_id || answer.answerId || answer.id, {
      content: value,
    });

    setEditing(false);
  }

  return (
    <article className={styles.replyItem}>
      <div className={styles.replyHeader}>
        <div className={styles.replyAuthor}>
          <span className="reply-avatar">
            <UserRound size={17} />
          </span>
          <div>
            <strong>{author}</strong>
            <small>{formatDate(answer.created_at || answer.createdAt)}</small>
          </div>
        </div>

        {isOwner && !editing && (
          <div className={styles.replyActions}>
            <button
              type="button"
              className={btn.iconButton}
              onClick={() => setEditing(true)}
              disabled={busy}
              aria-label="Edit answer"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className={`${btn.iconButton} danger`}
              onClick={() =>
                onDelete?.(answer.answer_id || answer.answerId || answer.id)
              }
              disabled={busy}
              aria-label="Delete answer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className={ui.replyEdit}>
          <MarkdownEditor value={content} onChange={setContent} rows={7} />
          <div className={styles.replyEditActions}>
            <button
              type="button"
              className={btn.secondaryButton}
              onClick={() => {
                setContent(answer.content || "");
                setEditing(false);
              }}
              disabled={busy}
            >
              <X size={16} /> Cancel
            </button>
            <button
              type="button"
              className={btn.primaryButton}
              onClick={handleUpdate}
              disabled={busy || content.trim().length < 20}
            >
              <Check size={16} /> Save
            </button>
          </div>
        </div>
      ) : (
        <div className={`${styles.replyContent} ${ui.proseContent}`}>
          <MarkdownContent>{answer.content || ""}</MarkdownContent>
        </div>
      )}
    </article>
  );
}
