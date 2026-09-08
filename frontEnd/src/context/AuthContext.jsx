import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api/auth.api";
import { SESSION_EXPIRED_EVENT } from "../api/axios";

const AuthContext = createContext(null);

function clearStoredSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

// JWT segments are base64url: "-" and "_" stand in for "+" and "/", and atob
// rejects both. Convert back before decoding, or a valid token reads as expired.
function decodeTokenPayload(token) {
  const segment = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = segment.padEnd(Math.ceil(segment.length / 4) * 4, "=");

  // atob yields one character per byte, so a name like "Zoë" would come back
  // mangled. Read the bytes as UTF-8 instead.
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));

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
  const [loading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const isAuthenticated = Boolean(
    user && storedToken && !isTokenExpired(storedToken),
  );

  async function login(credentials) {
    const data = await loginUser(credentials);

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setSessionExpired(false);
    }

    return data;
  }

  async function register(payload) {
    return registerUser(payload);
  }

  function logout() {
    clearStoredSession();
    setUser(null);
  }

  // The axios interceptor already cleared storage, but only React can clear
  // React. Without this the guard keeps rendering a page whose session is gone.
  // The handler does the work itself rather than calling logout(), so the
  // listener is attached once instead of on every render.
  useEffect(() => {
    function handleSessionExpired() {
      clearStoredSession();
      setUser(null);
      setSessionExpired(true);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  function refreshUser() {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      logout();
      return false;
    }

    const storedUser = readStoredUser();
    setUser(storedUser);
    return Boolean(storedUser);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      sessionExpired,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, isAuthenticated, sessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
