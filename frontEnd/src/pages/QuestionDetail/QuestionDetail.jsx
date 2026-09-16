import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  MessageSquare,
  Share2,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  checkAnswerFit,
  getAllQuestions,
  getQuestion,
  getSimilarQuestions,
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

import { useAuth } from "../../context/AuthContext";

import {
  getAuthorName,
  getErrorMessage,
  getQuestionId,
  getQuestionOwnerId,
  unwrapArray,
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

function getQuestionHash(question) {
  return (
    question?.questionHash ?? question?.question_hash ?? question?.hash ?? null
  );
}

function normalizeRelated(items, currentHash) {
  const seen = new Set();

  return items.filter((item) => {
    const hash = getQuestionHash(item);

    if (!hash || hash === currentHash || seen.has(hash)) {
      return false;
    }

    seen.add(hash);
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

  const loadQuestion = useCallback(async () => {
    const data = await getQuestion(questionHash);

    return data?.question ?? data?.data?.question ?? data?.data ?? data;
  }, [questionHash]);

  const loadAnswers = useCallback(async (questionId) => {
    if (!questionId) return [];

    const data = await getAnswers(questionId);

    return unwrapArray(data, ["answers", "results"]);
  }, []);

  const loadRelatedQuestions = useCallback(
    async (currentQuestion) => {
      setRelatedLoading(true);

      try {
        const semanticData = await getSimilarQuestions(questionHash, {
          k: 5,
          threshold: 0.35,
        });

        const semanticMatches = normalizeRelated(
          unwrapArray(semanticData, ["questions", "results", "similar"]),
          questionHash,
        );

        if (semanticMatches.length > 0) {
          setSimilar(semanticMatches.slice(0, 5));
          return;
        }

        const terms = makeFallbackTerms(currentQuestion?.title);
        const collected = [];

        for (const term of terms) {
          try {
            const keywordData = await getAllQuestions({
              search: term,
            });

            collected.push(
              ...unwrapArray(keywordData, ["questions", "results"]),
            );
          } catch {
            // Continue trying the remaining fallback keywords.
          }

          if (normalizeRelated(collected, questionHash).length >= 5) {
            break;
          }
        }

        setSimilar(normalizeRelated(collected, questionHash).slice(0, 5));
      } catch {
        try {
          const terms = makeFallbackTerms(currentQuestion?.title);
          const collected = [];

          for (const term of terms) {
            const keywordData = await getAllQuestions({
              search: term,
            });

            collected.push(
              ...unwrapArray(keywordData, ["questions", "results"]),
            );

            if (normalizeRelated(collected, questionHash).length >= 5) {
              break;
            }
          }

          setSimilar(normalizeRelated(collected, questionHash).slice(0, 5));
        } catch {
          setSimilar([]);
        }
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

        const questionId = getQuestionId(questionData);

        setAnswers(await loadAnswers(questionId));

        await loadRelatedQuestions(questionData);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load this question."));
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [questionHash, loadQuestion, loadAnswers, loadRelatedQuestions]);

  const currentUserId = user?.id ?? user?.user_id ?? user?.userId;

  const ownerId = getQuestionOwnerId(question);

  const isOwnQuestion = useMemo(
    () =>
      ownerId != null &&
      currentUserId != null &&
      String(ownerId) === String(currentUserId),
    [ownerId, currentUserId],
  );

  async function refreshAnswers() {
    setAnswers(await loadAnswers(getQuestionId(question)));
  }

  async function add({ content }) {
    setBusy(true);
    setActionError("");

    try {
      await postAnswer({
        questionId: getQuestionId(question),
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

  async function fit(answerText) {
    setCheckingFit(true);
    setActionError("");

    try {
      const response = await checkAnswerFit(questionHash, answerText);
      // POST /api/questions/:questionHash/answer-fit responds with
      // { success, message, data: { level, note } }
      setFitResult(response?.data ?? response ?? null);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not check answer fit."));
    } finally {
      setCheckingFit(false);
    }
  }

  async function shareQuestion() {
    const shareUrl = window.location.href;

    const shareData = {
      title: question?.title || "Evangadi Forum question",
      text: question?.title || "Take a look at this Evangadi Forum question.",
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
                {author.slice(0, 2).toUpperCase()}
              </span>

              <div>
                <strong>{author}</strong>
                <small>Posted recently</small>
              </div>
            </div>

            <h1>{question?.title}</h1>

            <div className={`${styles.discussionContent} ${ui.proseContent}`}>
              <MarkdownContent>
                {question?.content || question?.description || ""}
              </MarkdownContent>
            </div>

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
            </div>
          </article>

          <section className={styles.answersSection}>
            <h2>Community Answers ({answers.length})</h2>

            {answers.length === 0 ? (
              <EmptyState
                title="No answers yet"
                message="Be the first person to help with this question."
              />
            ) : (
              <div className={styles.replyList}>
                {answers.map((answer, index) => (
                  <ReplyItem
                    key={
                      answer.answer_id || answer.answerId || answer.id || index
                    }
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
            <h2>Add your answer</h2>

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
                    className={`${styles.fitBadge} ${FIT_LEVELS[fitResult.level]?.className ?? `${styles.unknown}`}`}
                  >
                    {FIT_LEVELS[fitResult.level]?.label ?? "Not rated"}
                  </span>
                </div>
                <p>{fitResult.note || "No explanation was returned."}</p>
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
            similar.map((item, index) => {
              const hash = getQuestionHash(item);

              return (
                <Link
                  key={hash || index}
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
                </Link>
              );
            })
          )}
        </aside>
      </div>
    </div>
  );
}
