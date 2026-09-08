import styles from "./Footer.module.css";
export default function Footer() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.siteFooterCopy}>
        <h3>Evangadi Forum</h3>
        <p>
          A practice space for technical Q&amp;A, peer feedback, and AI-assisted
          search, built for Evangadi learners and mentors.
        </p>
        <small>© 2026 Evangadi Forum. For educational use.</small>
      </div>

      <nav className={styles.siteFooterLinks} aria-label="Footer links">
        <a href="#about">About</a>
        <a href="#privacy">Privacy</a>
        <a href="#terms">Terms</a>
        <a href="#contact">Contact</a>
      </nav>
    </footer>
  );
}
