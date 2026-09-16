import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor";
import btn from "../../styles/buttons.module.css";
import styles from "./ReplyForm.module.css";
import ui from "../../styles/pageStates.module.css";

export default function ReplyForm({
  onSubmit,
  onCheckFit,
  submitting = false,
  checkingFit = false,
  disabled = false,
  disabledMessage = "",
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  function validate() {
    if (content.trim().length < 20) {
      return "Your answer must be at least 20 characters.";
    }
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    await onSubmit?.({ content: content.trim() });
    setContent("");
  }

  async function handleCheckFit() {
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    await onCheckFit?.(content.trim());
  }

  if (disabled) {
    return (
      <div className={styles.replyFormDisabled}>
        <p>{disabledMessage || "You cannot answer this question."}</p>
      </div>
    );
  }

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <MarkdownEditor
        value={content}
        onChange={setContent}
        rows={8}
        minLength={20}
        ariaLabel="Your answer"
        placeholder="Write a clear answer. You can format code, bold important words, add links, lists, and quotes."
      />

      {error && <p className={ui.formError}>{error}</p>}

      <div className={styles.answerHelperRow}>
        <button
          type="button"
          className={btn.aiButton}
          onClick={handleCheckFit}
          disabled={checkingFit || submitting}
        >
          <Sparkles size={16} />
          {checkingFit ? "Checking..." : "Check answer fit"}
        </button>
        <span>AI suggestions are optional; you decide what to submit.</span>
      </div>

      <div className={styles.replyFormActions}>
        <button
          type="submit"
          className={btn.primaryButton}
          disabled={submitting || checkingFit}
        >
          {submitting ? "Posting..." : "Post Your Answer"}
          {!submitting && <Send size={16} />}
        </button>
      </div>
    </form>
  );
}
