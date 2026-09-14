import { NavLink, useNavigate } from "react-router-dom";

import { BookOpen, Home, LogOut, MessageSquare, Plus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import styles from "./Sidebar.module.css";

import ui from "../../styles/pageStates.module.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Keep the avatar usable while authentication data is still loading.
  const initials =
    `${user?.firstName?.[0] || "U"}${user?.lastName?.[0] || ""}`.toUpperCase();
  function onLogout() {
    logout();
    // Replace history so a signed-out user cannot return to a protected view.
    navigate("/auth", { replace: true });
  }
  return (
    <aside className={styles.sidebar}>
      <div>
        {/* The brand returns users to the dashboard from any authenticated page. */}
        <NavLink to="/dashboard" className={styles.sidebarBrand}>
          <span className={ui.brandMark}>
            <MessageSquare size={19} />
          </span>

          <span>
            <strong>Evangadi Forum</strong>
            <small>Learn together. Ask with context.</small>
          </span>
        </NavLink>
        <div className={styles.sidebarSectionLabel}>Navigate</div>
        {/* Keep the main destinations together so the sidebar remains scannable. */}
        <nav className={styles.sidebarNav}>
          {/* NavLink supplies the active state used to highlight the current view. */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.sidebarLink}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            <Home size={18} />
            Home
          </NavLink>
          <NavLink
            to="/my-questions"
            className={({ isActive }) =>
              `${styles.sidebarLink}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            <MessageSquare size={18} />
            Your Topics
          </NavLink>
          <NavLink
            to="/rag-documents"
            className={({ isActive }) =>
              `${styles.sidebarLink}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            <BookOpen size={18} />
            Knowledge Base
          </NavLink>
        </nav>
      </div>
      <div className={styles.sidebarBottom}>
        {/* This action stays separate from browsing links because it starts content creation. */}
        <NavLink to="/questions/ask" className={styles.sidebarNew}>
          <Plus size={17} />
          New Question
        </NavLink>
        {/* Show the authenticated user's identity without requiring a separate profile page. */}
        <div className={styles.sidebarUser}>
          <span className={ui.avatar}>{initials}</span>
          <span>
            <strong>
              {user?.firstName || "User"} {user?.lastName || ""}
            </strong>
            <small>Learner</small>
          </span>
        </div>
        <button
          type="button"
          className={styles.sidebarLogout}
          onClick={onLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
