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