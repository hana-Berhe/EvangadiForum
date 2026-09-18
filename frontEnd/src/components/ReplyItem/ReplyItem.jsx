/**
 * ReplyItem renders an answer with its author and creation date, and provides
 * owner-only controls for editing and deleting the answer.
 */
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor";
import {
  getAuthorInitials,
  getAuthorName,
  getRelativeTime,
} from "../../utils/data";
import btn from "../../styles/buttons.module.css";
import styles from "./ReplyItem.module.css";
import ui from "../../styles/pageStates.module.css";

export default function ReplyItem({
  answer,
  currentUserId,
  onUpdate,
  onDelete,
  busy = false,
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(answer.content);

  const isOwner = String(currentUserId) === String(answer.author.id);

  const author = getAuthorName(answer);

  async function handleUpdate() {
    const value = content.trim();
    if (value.length < 20) return;

    await onUpdate?.(answer.id, { content: value });

    setEditing(false);
  }

  return (
    <article className={styles.replyItem}>
      <div className={styles.replyHeader}>
        <div className={styles.replyAuthor}>
          <span className={ui.threadAvatar}>{getAuthorInitials(answer)}</span>
          <div>
            <strong>{author}</strong>
            <small>Answered {getRelativeTime(answer.createdAt)}</small>
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
              onClick={() => onDelete?.(answer.id)}
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
                setContent(answer.content);
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
          <MarkdownContent>{answer.content}</MarkdownContent>
        </div>
      )}
    </article>
  );
}
