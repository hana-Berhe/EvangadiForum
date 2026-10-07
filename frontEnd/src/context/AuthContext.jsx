import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/auth.api";

import { SESSION_EXPIRED_EVENT } from "../api/axios";

const AuthContext = createContext(null);

function toSessionUser(data) {
  if (!data?.id) return null;
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // True until the first /auth/me check finishes. Protected pages must wait
  // for it, or a logged-in user would be sent to the login page on reload.
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [sessionExpired, setSessionExpired] = useState(false);
  const isAuthenticated = Boolean(user);

  // On page load, ask the backend who is logged in (based on the cookie).
  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((data) => {
        if (!cancelled) setUser(toSessionUser(data.data));
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      setSessionExpired(true);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  async function login(credentials) {
    const data = await loginUser(credentials);
    setUser(toSessionUser(data.data.user));
    setSessionExpired(false);
    return data;
  }

  // Re-reads the logged-in user from the backend, e.g. after a profile edit
  // changed the name (the backend then issues a new cookie).
  async function refreshUser() {
    try {
      const data = await getCurrentUser();
      setUser(toSessionUser(data.data));
    } catch {
      // Keep the current user; a real session loss is handled elsewhere.
    }
  }

  async function register(payload) {
    return registerUser(payload);
  }

  function logout() {
    // Clear the user right away so the UI updates, then clear the cookie.
    setUser(null);
    return logoutUser().catch(() => {
      // The cookie may already be gone; nothing else to do.
    });
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isCheckingSession,
      sessionExpired,
      login,
      register,
      logout,
      refreshUser,
    }),

    [user, isAuthenticated, isCheckingSession, sessionExpired],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
