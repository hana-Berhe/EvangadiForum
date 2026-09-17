import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor";
import btn from "../../styles/buttons.module.css";
import styles from "./QuestionForm.module.css";
import ui from "../../styles/pageStates.module.css";

export default function QuestionForm({
  onSubmit,
  onDraftCoach,
  submitting = false,
  coaching = false,
  onCancel,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  function validate() {
    if (title.trim().length < 5 || title.trim().length > 255) {
      return "Title must be between 5 and 255 characters.";
    }

    if (content.trim().length < 10) {
      return "Question details must contain at least 10 characters.";
    }

    return "";
  }

  async function submit(event) {
    event.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    await onSubmit?.({
      title: title.trim(),
      content: content.trim(),
    });
  }

  async function coach() {
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    await onDraftCoach?.({
      title: title.trim(),
      content: content.trim(),
    });
  }

  return (
    <form className={`question-form ${ui.designForm}`} onSubmit={submit}>
      <div className={ui.formField}>
        <label htmlFor="question-title">Title</label>
        <small>
          Be specific and imagine you're asking a question to another person.
        </small>
        <input
          id="question-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. How do I handle state management using Context API in React?"
          maxLength={255}
        />
      </div>

      <div className={ui.formField}>
        <label htmlFor="question-editor">
          What are the details of your problem?
        </label>
        <small>
          Introduce the problem and expand on what you put in the title. Minimum
          10 characters.
        </small>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          rows={12}
          minLength={10}
          ariaLabel="Question details"
          placeholder="Include all the information someone would need to answer your question... Select text and use the toolbar for bold, italic, code, links, lists, and quotes."
        />
      </div>

      {error && <p className={ui.formError}>{error}</p>}

      <div className={styles.aiSuggestionRow}>
        <button
          type="button"
          className={btn.aiButton}
          onClick={coach}
          disabled={coaching || submitting}
        >
          <Sparkles size={16} />
          {coaching ? "Checking..." : "AI suggestions"}
        </button>
        <span>Suggestions only. You still choose what to post.</span>
      </div>

      <div className={styles.formBottomActions}>
        <button type="button" className={btn.textButton} onClick={onCancel}>
          Cancel
        </button>
        <button className={btn.primaryButton} disabled={submitting || coaching}>
          {submitting ? (
            "Posting..."
          ) : (
            <>
              Post Question <Send size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
