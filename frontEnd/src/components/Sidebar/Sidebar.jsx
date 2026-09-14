import { NavLink, useNavigate } from "react-router-dom";

import { BookOpen, Home, LogOut, MessageSquare, Plus } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import styles from "./Sidebar.module.css";

import ui from "../../styles/pageStates.module.css";

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
