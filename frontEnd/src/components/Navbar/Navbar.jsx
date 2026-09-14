import { LogOut, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import btn from "../../styles/buttons.module.css";
import styles from "./Navbar.module.css";
import ui from "../../styles/pageStates.module.css";

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
  "/search": [
    "Semantic search",
    "Find questions by meaning, not only exact words.",
  ],
};

export default function Navbar() {
  const { pathname } = useLocation(),
    navigate = useNavigate(),
    { user, logout } = useAuth(),
    [search, setSearch] = useState("");

  // Question detail routes include a dynamic ID, so they need a shared title
  // instead of an entry for every possible pathname.
  const [title, subtitle] =
    pathname.startsWith("/questions/") && !TITLES[pathname]
      ? [
          "Discussion",
          "Read the thread, review related topics, and reply with markdown if you can help.",
        ]
      : TITLES[pathname] || ["Evangadi Forum", "Technical Q&A for learners."];
  function submit(e) {
    e.preventDefault();
    // Encode the query so spaces and reserved URL characters remain valid.
    if (search.trim())
      navigate(`/questions?search=${encodeURIComponent(search.trim())}`);
  }
  function onLogout() {
    logout();
    // Replace history so the signed-out user cannot return to a protected page
    // with the browser Back button.
    navigate("/auth", { replace: true });
  }
  return (
    <header className={styles.navbar}>
      <div className={styles.navbarPageTitle}>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
      <form className={styles.navbarSearch} onSubmit={submit}>
        <Search size={17} />
        {/* Keep the field controlled so its value is available to submit(). */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions by keyword..."
        />
      </form>
      <div className={styles.navbarUser}>
        {/* Auth data may load after the navbar mounts, so provide stable fallbacks. */}
        <strong>
          {user?.firstName || "User"} {user?.lastName || ""}
        </strong>
        <span className={`${ui.avatar} ${ui.small}`}>
          {`${user?.firstName?.[0] || "U"}${user?.lastName?.[0] || ""}`.toUpperCase()}
        </span>
        {/* The icon-only action keeps the account area compact in the header. */}
        <button className={btn.iconButton} onClick={onLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
