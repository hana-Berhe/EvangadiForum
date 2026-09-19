import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  MessageSquare,
  Pencil,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  checkAnswerFit,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  getSimilarQuestions,
  updateQuestion,
} from "../../api/question.api";

import {
  deleteAnswer,
  getAnswers,
  postAnswer,
  updateAnswer,
} from "../../api/answer.api";

import ReplyForm from "../../components/ReplyForm/ReplyForm";
import ReplyItem from "../../components/ReplyItem/ReplyItem";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/EmptyState/EmptyState";
import MarkdownContent from "../../components/MarkdownContent/MarkdownContent";
import MarkdownEditor from "../../components/MarkdownEditor/MarkdownEditor";

import { useAuth } from "../../context/AuthContext";

import {
  getAuthorName,
  getErrorMessage,
  getRelativeTime,
  getAuthorInitials,
} from "../../utils/data";
import btn from "../../styles/buttons.module.css";
import styles from "./QuestionDetail.module.css";
import ui from "../../styles/pageStates.module.css";

/** Levels returned by POST /api/questions/:questionHash/answer-fit. */
const FIT_LEVELS = {
  strong: { label: "Strong fit", className: "strong" },
  partial: { label: "Partial fit", className: "partial" },
  weak: { label: "Weak fit", className: "weak" },
};

function normalizeRelated(items, currentHash) {
  const seen = new Set();

  return items.filter((item) => {
    const title = item.title.trim().toLowerCase();

    if (
      item.questionHash === currentHash ||
      seen.has(item.questionHash) ||
      seen.has(title)
    ) {
      return false;
    }

    seen.add(item.questionHash);
    seen.add(title);
    return true;
  });
}

function makeFallbackTerms(title = "") {
  const stopWords = new Set([
    "what",
    "when",
    "where",
    "which",
    "why",
    "how",
    "with",
    "from",
    "this",
    "that",
    "into",
    "does",
    "have",
    "about",
    "your",
    "and",
    "the",
    "for",
    "are",
    "was",
    "were",
    "can",
  ]);

  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !stopWords.has(word))
    .slice(0, 4);
}

export default function QuestionDetail() {
  const { questionHash } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [similar, setSimilar] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [checkingFit, setCheckingFit] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // `error` is for failures that break the whole page (the question would not
  // load). Anything the user triggers from the answer box reports through
  // `actionError`, which renders beside that box — an error at the top of a
  // long thread is invisible to someone looking at the button they just
  // pressed, which reads as "the button does nothing".
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [fitResult, setFitResult] = useState(null);
  const [shareStatus, setShareStatus] = useState("");

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const loadQuestion = useCallback(async () => {
    const data = await getQuestion(questionHash);

    return data.question;
  }, [questionHash]);

  const loadAnswers = useCallback(async (questionId) => {
    const data = await getAnswers(questionId);

    return data.data;
  }, []);

  const loadRelatedQuestions = useCallback(
    async (currentQuestion) => {
      setRelatedLoading(true);

      try {
        // If the AI search fails, treat it as zero results so the keyword
        // search below runs instead.
        const semanticData = await getSimilarQuestions(questionHash, {
          k: 5,
        }).catch(() => ({ data: [] }));

        const semanticMatches = normalizeRelated(
          semanticData.data,
          questionHash,
        );

        if (semanticMatches.length > 0) {
          setSimilar(semanticMatches.slice(0, 5));
          return;
        }

        const terms = makeFallbackTerms(currentQuestion.title);
        const collected = [];

        for (const term of terms) {
          try {
            const keywordData = await getAllQuestions({
              search: term,
            });

            collected.push(...keywordData.data);
          } catch {
            // Continue trying the remaining fallback keywords.
          }

          if (normalizeRelated(collected, questionHash).length >= 5) {
            break;
          }
        }

        setSimilar(normalizeRelated(collected, questionHash).slice(0, 5));
      } catch {
        setSimilar([]);
      } finally {
        setRelatedLoading(false);
      }
    },
    [questionHash],
  );

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setError("");
      setSimilar([]);

      try {
        const questionData = await loadQuestion();
        setQuestion(questionData);

        setAnswers(await loadAnswers(questionData.id));

        await loadRelatedQuestions(questionData);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load this question."));
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [questionHash, loadQuestion, loadAnswers, loadRelatedQuestions]);

  const currentUserId = user.id;

  // `question` is still null while the page loads, hence the one `?.` here.
  const isOwnQuestion = String(question?.author.id) === String(currentUserId);

  async function refreshAnswers() {
    setAnswers(await loadAnswers(question.id));
  }

  async function add({ content }) {
    setBusy(true);
    setActionError("");

    try {
      await postAnswer({
        questionId: question.id,
        content,
      });

      await refreshAnswers();
      setFitResult(null); // the draft it described is gone
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not post your answer."));

      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function update(answerId, payload) {
    setBusy(true);
    setActionError("");

    try {
      await updateAnswer(answerId, payload);
      await refreshAnswers();
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update the answer."));
    } finally {
      setBusy(false);
    }
  }

  async function remove(answerId) {
    const confirmed = window.confirm("Delete this answer?");

    if (!confirmed) return;

    setBusy(true);
    setActionError("");

    try {
      await deleteAnswer(answerId);
      await refreshAnswers();
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not delete the answer."));
    } finally {
      setBusy(false);
    }
  }

  function startEditing() {
    setDraftTitle(question.title);
    setDraftContent(question.content);
    setEditing(true);
  }

  async function saveQuestion() {
    setBusy(true);
    setError("");

    try {
      await updateQuestion(questionHash, {
        title: draftTitle.trim(),
        content: draftContent.trim(),
      });

      setQuestion(await loadQuestion());
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update the question."));
    } finally {
      setBusy(false);
    }
  }

  async function removeQuestion() {
    const warning =
      answers.length === 0
        ? "Delete this question?"
        : `Delete this question? This also deletes its ${answers.length} answer${answers.length === 1 ? "" : "s"}.`;

    if (!window.confirm(warning)) return;

    setBusy(true);
    setError("");

    try {
      await deleteQuestion(questionHash);
      navigate("/my-questions", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete the question."));
      setBusy(false);
    }
  }

  async function fit(answerText) {
    setCheckingFit(true);
    setActionError("");

    try {
      const response = await checkAnswerFit(questionHash, answerText);
      // POST /api/questions/:questionHash/answer-fit responds with
      // { success, message, data: { level, note } }
      setFitResult(response.data);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not check answer fit."));
    } finally {
      setCheckingFit(false);
    }
  }

  async function shareQuestion() {
    const shareUrl = window.location.href;

    const shareData = {
      title: question.title,
      text: question.title,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("shared");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("copied");
      }

      window.setTimeout(() => {
        setShareStatus("");
      }, 1800);
    } catch (err) {
      if (err?.name === "AbortError") return;

      try {
        const textarea = document.createElement("textarea");

        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();
        document.execCommand("copy");

        textarea.remove();

        setShareStatus("copied");

        window.setTimeout(() => {
          setShareStatus("");
        }, 1800);
      } catch {
        setShareStatus("failed");

        window.setTimeout(() => {
          setShareStatus("");
        }, 1800);
      }
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading question..." />;
  }

  if (error && !question) {
    return <ErrorMessage message={error} />;
  }

  const author = getAuthorName(question);

  return (
    <div className="discussion-page">
      {error && <ErrorMessage message={error} />}

      <Link to="/dashboard" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to feed
      </Link>

      <div className={styles.discussionGrid}>
        <div>
          <article className={styles.discussionCard}>
            <div className={styles.questionAuthorLine}>
              <span className={ui.threadAvatar}>
                {getAuthorInitials(question)}
              </span>

              <div>
                <strong>{author}</strong>

                <small>Posted {getRelativeTime(question.createdAt)}</small>
              </div>
            </div>

            {editing ? (
              <div className={`${ui.replyEdit} ${styles.questionEdit}`}>
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  aria-label="Question title"
                  maxLength={255}
                />
                <MarkdownEditor
                  value={draftContent}
                  onChange={setDraftContent}
                  rows={10}
                  minLength={10}
                  ariaLabel="Question details"
                />
                <div className={styles.questionEditActions}>
                  <button
                    type="button"
                    className={btn.secondaryButton}
                    onClick={() => setEditing(false)}
                    disabled={busy}
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    type="button"
                    className={btn.primaryButton}
                    onClick={saveQuestion}
                    disabled={
                      busy ||
                      draftTitle.trim().length < 5 ||
                      draftContent.trim().length < 10
                    }
                  >
                    <Check size={16} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1>{question.title}</h1>

                <div
                  className={`${styles.discussionContent} ${ui.proseContent}`}
                >
                  <MarkdownContent>{question.content}</MarkdownContent>
                </div>
              </>
            )}

            <div className={styles.discussionActions}>
              <button
                type="button"
                className={btn.secondaryButton}
                onClick={shareQuestion}
              >
                {shareStatus === "copied" || shareStatus === "shared" ? (
                  <Check size={16} />
                ) : (
                  <Share2 size={16} />
                )}

                {shareStatus === "copied"
                  ? "Link copied"
                  : shareStatus === "shared"
                    ? "Shared"
                    : shareStatus === "failed"
                      ? "Copy failed"
                      : "Share"}
              </button>

              <button type="button" className={btn.secondaryButton}>
                <MessageSquare size={16} />
                {answers.length} Answer
                {answers.length === 1 ? "" : "s"}
              </button>

              {isOwnQuestion && !editing && (
                <>
                  <button
                    type="button"
                    className={btn.iconButton}
                    onClick={startEditing}
                    disabled={busy}
                    aria-label="Edit question"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className={btn.iconButton}
                    onClick={removeQuestion}
                    disabled={busy}
                    aria-label="Delete question"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </article>

          <section className={styles.answersSection}>
            <h2>Community Answers ({answers.length})</h2>

            {answers.length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={32} />}
                title="Be the first to help!"
                message="This question is waiting for someone like you. Share what you know."
              />
            ) : (
              <div className={styles.replyList}>
                {answers.map((answer) => (
                  <ReplyItem
                    key={answer.id}
                    answer={answer}
                    currentUserId={currentUserId}
                    onUpdate={update}
                    onDelete={remove}
                    busy={busy}
                  />
                ))}
              </div>
            )}
          </section>

          <section className={`${ui.panel} ${styles.answerFormPanel}`}>
            <h2>Contribute an answer</h2>

            {/* Shown here, not at the top of the thread, so the reason a click
                failed is visible without scrolling away from the button. */}
            {actionError && <ErrorMessage message={actionError} />}

            <ReplyForm
              onSubmit={add}
              onCheckFit={fit}
              submitting={busy}
              checkingFit={checkingFit}
              disabled={isOwnQuestion}
              disabledMessage="You cannot answer your own question."
            />

            {fitResult && (
              <div className={`${ui.aiPanel} ${ui.compact} ${styles.fitPanel}`}>
                <div className={styles.fitHead}>
                  <Sparkles size={15} />
                  <strong>Answer fit</strong>
                  <span
                    className={`${styles.fitBadge} ${styles[FIT_LEVELS[fitResult.level].className]}`}
                  >
                    {FIT_LEVELS[fitResult.level].label}
                  </span>
                </div>
                <p>{fitResult.note}</p>
              </div>
            )}
          </section>
        </div>

        <aside className={styles.relatedColumn}>
          <h2>Related Questions</h2>

          {relatedLoading ? (
            <p className={ui.muted}>Finding related questions...</p>
          ) : similar.length === 0 ? (
            <p className={ui.muted}>No related questions found.</p>
          ) : (
            similar.map((item) => {
              const hash = item.questionHash;

              return (
                <Link
                  key={hash}
                  to={`/questions/${hash}`}
                  className={styles.relatedCard}
                >
                  <strong>{item.title}</strong>

                  {item.score != null && (
                    <span className="related-score">
                      {Math.round(Number(item.score) * 100)}% match
                    </span>
                  )}

                  <small>{getAuthorName(item)}</small>
                  <small>{getRelativeTime(item.createdAt)}</small>
                </Link>
              );
            })
          )}
        </aside>
      </div>
    </div>
  );
}
// QuestionDetail component for displaying detailed question information, answers and related content.
