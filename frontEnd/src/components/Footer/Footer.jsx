// import link from react-router-dom
import { Link } from "react-router-dom";
// import styles from "./Footer.module.css";
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

      {/* links tag  */}
      <nav className={styles.siteFooterLinks} aria-label="Footer links">
  <Link to="/dashboard">About</Link>
  <Link to="/dashboard">Privacy</Link>
  <Link to="/dashboard">Terms</Link>
  <Link to="/dashboard">Contact</Link>
</nav>
    </footer>
  );
}

