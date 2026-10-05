import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { loginUser, registerUser } from "../api/auth.api";

import { SESSION_EXPIRED_EVENT } from "../api/axios";

const AuthContext = createContext(null);

function clearStoredSession() {
  // Remove JWT token from browser storage
  localStorage.removeItem("token");

  // Remove stored user information from browser storage
  localStorage.removeItem("user");
}

function readStoredUser() {
  try {
    const { id, firstName, lastName } = decodeTokenPayload(
      localStorage.getItem("token"),
    );

    return {
      id,
      firstName,
      lastName,
      email: "",
      avatar: null,
    };
  } catch {
    return null;
  }
}

function decodeTokenPayload(token) {
  const segment = token
    .split(".")[1]
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padded = segment.padEnd(Math.ceil(segment.length / 4) * 4, "=");
  const bytes = Uint8Array.from(
    atob(padded),
    (char) => char.charCodeAt(0),
  );
  return JSON.parse(new TextDecoder().decode(bytes));
}

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = decodeTokenPayload(token);
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem("token");

  const [user, setUser] = useState(
    !isTokenExpired(storedToken) ? readStoredUser() : null,
  );

  const [sessionExpired, setSessionExpired] = useState(false);
  const isAuthenticated = Boolean(
    user && storedToken && !isTokenExpired(storedToken),
  );

  async function login(credentials) {
    const data = await loginUser(credentials);
    localStorage.setItem("token", data.data.token);
    setUser(readStoredUser());
    setSessionExpired(false);

    return data;
  }

  async function register(payload) {
    return registerUser(payload);
  }

  function logout() {
    clearStoredSession();
    setUser(null);
  }

  function updateUser(updatedUser) {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  useEffect(() => {
    function handleSessionExpired() {
      clearStoredSession();
      setUser(null);
      setSessionExpired(true);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []); // [] means the effect is set up once

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      sessionExpired,
      login,
      register,
      logout,
      updateUser,
    }),

    [user, isAuthenticated, sessionExpired],
  );

  return (
    <AuthContext.Provider value={value}>
      {/* Render the components inside AuthProvider */}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
