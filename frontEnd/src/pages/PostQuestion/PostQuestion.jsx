import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { createQuestion, runDraftCoach } from "../../api/question.api";
import QuestionForm from "../../components/QuestionForm/QuestionForm";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { getErrorMessage } from "../../utils/data";
import styles from "./PostQuestion.module.css";
import ui from "../../styles/pageStates.module.css";
export default function PostQuestion() {
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false),
    [coaching, setCoaching] = useState(false),
    [error, setError] = useState(""),
    [coachTips, setCoachTips] = useState(null);
  async function post(payload) {
    setSubmitting(true);
    setError("");
    try {
      const response = await createQuestion(payload);
      // POST /api/questions responds with { success, message, data: { questionHash, ... } }
      const created = response?.data ?? response?.question ?? response;
      const questionHash =
        created?.questionHash ?? created?.question_hash ?? created?.hash;
      nav(questionHash ? `/questions/${questionHash}` : "/dashboard");
    } catch (e) {
      setError(getErrorMessage(e, "Could not post the question."));
    } finally {
      setSubmitting(false);
    }
  }
  async function coach(payload) {
    setCoaching(true);
    setError("");
    try {
      const response = await runDraftCoach(payload);
      // POST /api/questions/draft-coach responds with { success, message, data: { tips: [] } }
      setCoachTips(response?.data?.tips ?? response?.tips ?? []);
    } catch (e) {
      setError(getErrorMessage(e, "AI draft coach is unavailable."));
    } finally {
      setCoaching(false);
    }
  }
  return (
    <div className={`${ui.pageStack} ${styles.askPage}`}>
      <section className={styles.askIntro}>
        <span className={ui.eyebrow}>Ask the cohort</span>
        <h1>Publish to the forum</h1>
        <p>
          Public threads help the whole cohort. Write as if a classmate will
          debug your issue tomorrow. They only know what you put on the page.
        </p>
      </section>
      <section className={styles.guidanceCard}>
        <h2>Write questions people can answer in one pass</h2>
        <p>
          Mentors volunteer their time. Give them runnable context, expected vs
          actual behavior, and a tight scope so they can reproduce the issue
          without guessing your setup.
        </p>
        <h3>Checklist before you post</h3>
        <ul>
          <li>
            <strong>Title as a headline</strong> that states the symptom and
            tech stack.
          </li>
          <li>
            <strong>Repro steps</strong> numbered, with environment details.
          </li>
          <li>
            <strong>Minimal code</strong> in fenced markdown blocks.
          </li>
          <li>
            <strong>Exact errors</strong> copied verbatim.
          </li>
        </ul>
        <h3>Validation rules (enforced by the form)</h3>
        <ul>
          <li>
            <strong>Title length:</strong> 5 to 255 characters.
          </li>
          <li>
            <strong>Body length:</strong> minimum 10 characters.
          </li>
          <li>
            <strong>Single topic:</strong> split unrelated bugs into separate
            threads.
          </li>
        </ul>
      </section>
      <section className={`${ui.panel} ${styles.questionFormCard}`}>
        {error && <ErrorMessage message={error} />}
        <QuestionForm
          onSubmit={post}
          onDraftCoach={coach}
          submitting={submitting}
          coaching={coaching}
          onCancel={() => nav("/dashboard")}
        />
      </section>
      {coachTips && (
        <section className={`${ui.panel} ${ui.aiPanel}`}>
          <h2>AI suggestions</h2>
          {coachTips.length === 0 ? (
            <p>The coach did not return any tips for this draft.</p>
          ) : (
            <ul className={styles.aiTipList}>
              {coachTips.map((tip, index) => (
                <li key={index}>
                  <Sparkles size={15} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
