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
         <form className={styles.navbarSearch} onSubmit={submit}>
        <Search size={17} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions by keyword..."
        />
      </form>   