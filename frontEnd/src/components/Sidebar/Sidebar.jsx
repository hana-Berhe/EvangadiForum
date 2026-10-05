import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Home, LogOut, MessageSquare, Plus } from "lucide-react";
import { Users } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../UserAvatar/UserAvatar";
import styles from "./Sidebar.module.css";
import ui from "../../styles/pageStates.module.css";

export default function Sidebar({ isCollapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/auth", { replace: true });
  }

  return (
    <aside
      className={`${styles.sidebar}${isCollapsed ? ` ${styles.collapsed}` : ""}`}
    >
      <div>
        <NavLink to="/" className={styles.sidebarBrand}>
          <span className={`${ui.brandMark} ${styles.brandTile}`}>
            <MessageSquare size={20} />
          </span>

          <span className={styles.brandText}>
            <strong>
              Evangadi <span className={styles.brandAccent}>Forum</span>
            </strong>
            <small>
              Learn together.
              <br />
              Ask with context.
            </small>
          </span>
        </NavLink>

        <div className={styles.sidebarSectionLabel}>Navigate</div>

        <nav className={styles.sidebarNav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.sidebarLink}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            <Home size={18} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/my-questions"
            className={({ isActive }) =>
              `${styles.sidebarLink}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            <MessageSquare size={18} />
            <span>Your Topics</span>
          </NavLink>

          <NavLink
            to="/rag-documents"
            className={({ isActive }) =>
              `${styles.sidebarLink}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            <BookOpen size={18} />
            <span>Knowledge Base</span>
          </NavLink>

          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `${styles.sidebarLink}${isActive ? ` ${styles.active}` : ""}`
            }
          >
            <Users size={18} />
            <span>Rooms</span>
          </NavLink>
        </nav>
      </div>

      <div className={styles.sidebarBottom}>
        <NavLink to="/questions/ask" className={styles.sidebarNew}>
          <Plus size={17} />
          <span>New Question</span>
        </NavLink>

        <div className={styles.sidebarUser}>
          <div className={styles.userInfo}>
            <button
              type="button"
              className={styles.avatarToggle}
              onClick={onToggle}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <UserAvatar person={user} size="nav" />
            </button>

            <span className={styles.userText}>
              <strong>
                {user.firstName} {user.lastName}
              </strong>

              <small>Learner</small>
            </span>
          </div>

          <button
            type="button"
            className={styles.sidebarLogout}
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
