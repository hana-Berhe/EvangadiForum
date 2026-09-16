import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllQuestions } from "../../api/question.api";
import QuestionCard from "../../components/QuestionCard/QuestionCard";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/EmptyState/EmptyState";
import { getErrorMessage, unwrapArray } from "../../utils/data";
import btn from "../../styles/buttons.module.css";
import styles from "./MyQuestions.module.css";
import ui from "../../styles/pageStates.module.css";
export default function MyQuestions() {
  const [questions, setQuestions] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const d = await getAllQuestions({ mine: true });
        setQuestions(unwrapArray(d, ["questions", "results"]));
      } catch (e) {
        setError(getErrorMessage(e, "Could not load your questions."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <div className={ui.pageStack}>
      <section className={styles.topicsIntro}>
        <div>
          <span className={ui.eyebrow}>Your workspace</span>
          <h1>Your topics</h1>
          <p>
            Only questions you created. Open one to read answers or add
            follow-ups. Rows use the same left accent as your threads on Home.
          </p>
        </div>
        <Link to="/questions/ask" className={btn.primaryButton}>
          <Plus size={18} />
          New question
        </Link>
      </section>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}{" "}
      {!loading && !error && questions.length === 0 && (
        <EmptyState
          title="You have not posted a question yet"
          message="When you ask a question, it will appear here."
        />
      )}
      <div className={`${ui.threadList} ${styles.topicsList}`}>
        {questions.map((q, i) => (
          <QuestionCard key={q.question_hash || q.id || i} question={q} yours />
        ))}
      </div>
    </div>
  );
}
