import {
  ArrowRight,
  BookOpen,
  FileText,
  MessageSquare,
  Search,
  Sparkles,
  Database,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import btn from "../../styles/buttons.module.css";
import styles from "./Landing.module.css";
import ui from "../../styles/pageStates.module.css";

// Scroll-triggered reveal shared by every feature card. viewport.once keeps a
// card visible after its first pass instead of re-animating on every scroll.
const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return (
    <div className={styles.landingPage}>
      <header className={styles.landingNav}>
        <Link to="/" className={styles.landingBrand}>
          <span className={ui.brandMark}>
            <MessageSquare size={19} />
          </span>
          <span>
            <strong>Evangadi Forum</strong>
            <small>Learn together. Ask with context.</small>
          </span>
        </Link>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#rag">Course RAG</a>
          <a href="#how">How it works</a>
        </nav>
        <div className={btn.landingActions}>
          <Link to="/auth">Sign in</Link>
          <Link to="/auth" className={btn.primaryButton}>
            Create account
          </Link>
        </div>
      </header>
      <main>
        <section className={styles.landingHero} id="overview">
          <div>
            <span className={styles.heroChip}>
              Keyword search + embedding similarity
            </span>
            <h1>
              A calm place for <em>technical Q&amp;A</em>
            </h1>
            <p>
              Post with enough context for peers to help in one pass. Search the
              archive by phrase or by meaning, keep your threads in one place,
              and ground questions in <strong>course documents</strong> with
              retrieval-augmented generation (RAG) so answers cite the right
              syllabus, readings, and handouts.
            </p>
            <div className={styles.heroActions}>
              <Link to="/auth" className={btn.primaryButton}>
                Get started <ArrowRight size={17} />
              </Link>
              <a href="#how" className={btn.secondaryButton}>
                See how it works
              </a>
            </div>
          </div>
          <aside className={styles.glanceCard}>
            <span>At a glance</span>
            <ul>
              <li>Markdown threads and replies</li>
              <li>Semantic search on question embeddings</li>
              <li>Optional AI draft tips when you ask or answer</li>
              <li>
                <strong>Course RAG:</strong> upload or sync course materials,
                retrieve the best chunks for each question.
              </li>
            </ul>
          </aside>
        </section>
        <section className={styles.landingSoftSection} id="rag">
          <div className={styles.landingSectionCopy}>
            <span className={ui.eyebrow}>Retrieval-augmented generation</span>
            <h2>How course RAG works with the forum</h2>
            <p>
              Forum search already helps you find similar questions from peers.
              RAG goes further: it finds evidence inside your own documents,
              readings, rubrics, lab specs, and surfaces those snippets when you
              write or review an answer.
            </p>
          </div>
          <div className={`${styles.landingCardGrid} ${styles.three}`}>
            <Motion.article {...reveal}>
              <FileText />
              <h3>Ingest &amp; chunk</h3>
              <p>
                Upload or connect course files; split them into overlapping
                chunks and store embeddings.
              </p>
            </Motion.article>
            <Motion.article {...reveal}>
              <Database />
              <h3>Retrieve at question time</h3>
              <p>
                When you open Ask or run a search, the app pulls the
                top-matching chunks.
              </p>
            </Motion.article>
            <Motion.article {...reveal}>
              <Sparkles />
              <h3>Grounded responses</h3>
              <p>
                Downstream prompts quote or summarize only from retrieved spans.
              </p>
            </Motion.article>
          </div>
        </section>
        <section className={styles.landingSection}>
          <h2>Built for cohort coursework</h2>
          <div className={`${styles.landingCardGrid} ${styles.four}`}>
            <Motion.article {...reveal}>
              <Search />
              <h3>Find related work</h3>
              <p>Keyword filters for exact matches, plus similarity search.</p>
            </Motion.article>
            <Motion.article {...reveal}>
              <MessageSquare />
              <h3>Readable threads</h3>
              <p>
                Questions and answers stay structured so the group can reuse
                explanations.
              </p>
            </Motion.article>
            <Motion.article {...reveal}>
              <Sparkles />
              <h3>Lightweight AI help</h3>
              <p>
                Suggestions on your question draft and a quick relevance check
                on answer drafts.
              </p>
            </Motion.article>
            <Motion.article {...reveal}>
              <BookOpen />
              <h3>RAG over your course library</h3>
              <p>PDFs, syllabi, and notes live in a controlled corpus.</p>
            </Motion.article>
          </div>
        </section>
        <section className={styles.landingSection} id="how">
          <h2>How it works</h2>
          <div className={styles.howGrid}>
            <Motion.article {...reveal}>
              <strong>Ask with context</strong>
              <p>Title, environment, errors, and what you tried.</p>
            </Motion.article>
            <Motion.article {...reveal}>
              <strong>Get answers</strong>
              <p>Replies live in one thread with markdown and code blocks.</p>
            </Motion.article>
            <Motion.article {...reveal}>
              <strong>Search two ways</strong>
              <p>
                Classic text search or semantic search when questions use
                different words.
              </p>
            </Motion.article>
            <Motion.article {...reveal}>
              <strong>Own your trail</strong>
              <p>Your topics list keeps authorship clear.</p>
            </Motion.article>
          </div>
        </section>
        <section className={styles.landingCta}>
          <h2>Ready when you are</h2>
          <p>
            Create a free learner account to post, reply, and search the forum
            index.
          </p>
          <Link to="/auth" className={btn.primaryButton}>
            Create free account <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <footer className={styles.landingFooter}>
        <strong>Evangadi Forum</strong>
        <span>© 2026 · Learner-led Q&amp;A</span>
        <div>
          <a>Sign in</a>
          <a>Privacy</a>
          <a>Terms</a>
        </div>
      </footer>
    </div>
  );
}
