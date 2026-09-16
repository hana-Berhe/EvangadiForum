// src/pages/Landing/Landing.jsx .
import { ArrowRight, BookOpen, MessageSquare, Search, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import btn from "../../styles/buttons.module.css";
import styles from "./Landing.module.css";
import ui from "../../styles/pageStates.module.css";

// One animation recipe, reused by every card.
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
          <span className={ui.brandMark}><MessageSquare size={19} /></span>
          <span><strong>Evangadi Forum</strong><small>Learn together. Ask with context.</small></span>
        </Link>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#how">How it works</a>
        </nav>
        <div className={btn.landingActions}>
          <Link to="/auth">Sign in</Link>
          <Link to="/auth" className={btn.primaryButton}>Create account</Link>
        </div>
      </header>

      <main>
        <section className={styles.landingHero} id="overview">
          <div>
            <span className={styles.heroChip}>Keyword search + embedding similarity</span>
            <h1>A calm place for <em>technical Q&amp;A</em></h1>
            <p>Post with enough context for peers to help in one pass. Search by phrase or by meaning...</p>
            <div className={styles.heroActions}>
              <Link to="/auth" className={btn.primaryButton}>Get started <ArrowRight size={17} /></Link>
              <a href="#how" className={btn.secondaryButton}>See how it works</a>
            </div>
          </div>
          <aside className={styles.glanceCard}>
            <span>At a glance</span>
            <ul>
              <li>Markdown threads and replies</li>
              <li>Semantic search on question embeddings</li>
              <li>Optional AI draft tips when you ask or answer</li>
            </ul>
          </aside>
        </section>

        <section className={styles.landingSection}>
          <h2>Built for cohort coursework</h2>
          <div className={`${styles.landingCardGrid} ${styles.three}`}>
            <Motion.article {...reveal}>
              <Sparkles />
              <h3>AI Draft Coach</h3>
              <p>Suggestions on your question draft before you post.</p>
            </Motion.article>
            <Motion.article {...reveal}>
              <Search />
              <h3>Semantic Search</h3>
              <p>Find related questions even when they use different words.</p>
            </Motion.article>
            <Motion.article {...reveal}>
              <BookOpen />
              <h3>RAG Knowledge Base</h3>
              <p>Answers grounded in course documents, syllabi and notes.</p>
            </Motion.article>
          </div>
        </section>

        <section className={styles.landingSection} id="how">
          <h2>How it works</h2>
          {/* four Motion.article steps, same {...reveal} pattern */}
        </section>

        <section className={styles.landingCta}>
          <h2>Ready when you are</h2>
          <Link to="/auth" className={btn.primaryButton}>Create free account <ArrowRight size={17} /></Link>
        </section>
      </main>

      <footer className={styles.landingFooter}>
        <strong>Evangadi Forum</strong>
        <span>© 2026 · Learner-led Q&amp;A</span>
      </footer>
    </div>
  );
}
