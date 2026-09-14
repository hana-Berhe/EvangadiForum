import { LogOut, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import btn from "../../styles/buttons.module.css";
import styles from "./Navbar.module.css";
import ui from "../../styles/pageStates.module.css";