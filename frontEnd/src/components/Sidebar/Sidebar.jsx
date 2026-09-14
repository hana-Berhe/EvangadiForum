import { NavLink, useNavigate } from "react-router-dom";

import { BookOpen, Home, LogOut, MessageSquare, Plus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import styles from "./Sidebar.module.css";

import ui from "../../styles/pageStates.module.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials =
    `${user?.firstName?.[0] || "U"}${user?.lastName?.[0] || ""}`.toUpperCase();
    function onLogout() {
    logout();
    navigate("/auth", { replace: true });
  }
    return (
    <aside className={styles.sidebar}>
      <div>
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
        <nav className={styles.sidebarNav}>
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
