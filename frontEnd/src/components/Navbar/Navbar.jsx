import { LogOut, Moon, Search, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../UserAvatar/UserAvatar";
import btn from "../../styles/buttons.module.css";
import styles from "./Navbar.module.css";
const TITLES = {
  "/dashboard": [
    "Home",
    "Browse the feed, search by keyword, or run AI similarity search.",
  ],
  "/questions/ask": [
    "Ask a question",
    "A clear title and reproducible steps get faster, more accurate answers.",
  ],
  "/my-questions": [
    "Your topics",
    "Questions you have posted. Open any thread to read replies or edit context.",
  ],
  "/rag-documents": [
    "Knowledge Base",
    "Course files, retrieval, and grounded references.",
  ],
};
export default function Navbar() {
  const { pathname } = useLocation(),
    navigate = useNavigate(),
    { user, logout } = useAuth(),
    [search, setSearch] = useState("");
  // index.html applies the saved theme before React mounts; start from it.
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const [title, subtitle] =
    pathname.startsWith("/questions/") && !TITLES[pathname]
      ? [
          "Discussion",
          "Read the thread, review related topics, and reply with markdown if you can help.",
        ]
      : TITLES[pathname] || ["Evangadi Forum", "Technical Q&A for learners."];
  function submit(e) {
    e.preventDefault();
    if (search.trim())
      navigate(`/questions?search=${encodeURIComponent(search.trim())}`);
  }
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage unavailable: the theme still applies for this visit.
    }
    setTheme(next);
  }
  function onLogout() {
    logout();
    navigate("/auth", { replace: true });
  }
  return (
    <header className={styles.navbar}>
      <div className={styles.navbarPageTitle}>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
      {/* The Dashboard has its own keyword/semantic search. */}
      {pathname !== "/dashboard" && (
        <form className={styles.navbarSearch} onSubmit={submit}>
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword..."
          />
        </form>
      )}
      <div className={styles.navbarUser}>
        <strong>
          {user.firstName} {user.lastName}
        </strong>
        <UserAvatar person={user} size="nav" />
        <button
          type="button"
          className={btn.iconButton}
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className={btn.iconButton} onClick={onLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
