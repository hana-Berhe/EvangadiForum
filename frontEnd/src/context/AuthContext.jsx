// Import React tools (Context, Hooks)
import {
  createContext, // Creates an authentication Context
  useContext, // Reads data from the Context
  useEffect, // Runs side effects
  useMemo, // Memoizes the Context value
  useState, // Creates and updates state
} from "react";

// Import login and register API functions
import { loginUser, registerUser } from "../api/auth.api";

// Import the custom event used when the session expires
import { SESSION_EXPIRED_EVENT } from "../api/axios";

// Create the Authentication Context
// null is the default value before AuthProvider provides data
const AuthContext = createContext(null);

// ======================================================
// clearStoredSession()
// ======================================================
// Removes authentication information from localStorage.
function clearStoredSession() {
  // Remove JWT token from browser storage
  localStorage.removeItem("token");

  // Remove stored user information from browser storage
  localStorage.removeItem("user");
}

// ======================================================
// readStoredUser()
// ======================================================
// Reads the user object saved in localStorage.
function readStoredUser() {
  // try is used because JSON.parse() can throw an error
  try {
    // Get the "user" string from localStorage
    // JSON.parse() converts the string into a JavaScript object
    //
    // If no user exists, return null
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    // If the stored JSON is invalid,
    // return null instead of crashing the application
    return null;
  }
}

// ======================================================
// decodeTokenPayload()
// ======================================================
// Reads the payload part of a JWT token.
//
// JWT structure:
//
// HEADER.PAYLOAD.SIGNATURE
//
// Example:
//
// abc123.xyz456.def789
//
//                 ↑
//              payload
// ======================================================
function decodeTokenPayload(token) {
  // Split JWT using "."
  //
  // [0] = header
  // [1] = payload
  // [2] = signature
  //
  // Therefore [1] gives us the payload
  const segment = token
    .split(".")[1]
    // Convert Base64URL "-" back to "+"
    .replace(/-/g, "+")

    // Convert Base64URL "_" back to "/"
    .replace(/_/g, "/");

  // Base64 sometimes needs "=" padding.
  // padEnd() adds the required "=" characters.
  const padded = segment.padEnd(Math.ceil(segment.length / 4) * 4, "=");

  // Convert Base64 encoded data into bytes.
  //
  // atob() decodes Base64.
  // Uint8Array stores the decoded bytes.
  const bytes = Uint8Array.from(
    atob(padded),

    // Convert each character into its byte number
    (char) => char.charCodeAt(0),
  );

  // Convert bytes into UTF-8 text
  // Then convert the JSON string into a JavaScript object.
  return JSON.parse(new TextDecoder().decode(bytes));
}

// ======================================================
// isTokenExpired()
// ======================================================
// Checks whether a JWT token is expired.
// Returns:
// true  -> token is expired/invalid
// false -> token is still valid
// ======================================================
function isTokenExpired(token) {
  // If there is no token,
  // consider the session expired.
  if (!token) return true;

  // Try to decode and check the token
  try {
    // Get the JWT payload
    const payload = decodeTokenPayload(token);

    // JWT expiration time is stored in "exp".
    //
    // If "exp" doesn't exist,
    // we don't consider the token expired here.
    if (!payload.exp) return false;

    // JWT exp is in seconds.
    //
    // Date.now() is in milliseconds.
    //
    // Therefore:
    //
    // seconds × 1000 = milliseconds
    //
    // If expiration time is less than or equal
    // to the current time, token is expired.
    return payload.exp * 1000 <= Date.now();
  } catch {
    // If the token cannot be decoded,
    // consider it invalid/expired.
    return true;
  }
}

// ======================================================
// AuthProvider
// ======================================================
// Provides authentication information to the entire app.
//
// Example:
//
// <AuthProvider>
//     <App />
// </AuthProvider>
// ======================================================
export function AuthProvider({ children }) {
  // Get the JWT token saved in localStorage
  const storedToken = localStorage.getItem("token");

  // ====================================================
  // User State
  // ====================================================
  //
  // If the token is valid:
  //     read the stored user
  //
  // If the token is expired:
  //     user = null
  //
  const [user, setUser] = useState(
    !isTokenExpired(storedToken) ? readStoredUser() : null,
  );

  // Authentication loading state.
  // Currently it starts as false.
  const [loading] = useState(false);

  // Tracks whether the current session has expired.
  //
  // false = session is active
  // true  = session expired
  const [sessionExpired, setSessionExpired] = useState(false);

  // ====================================================
  // isAuthenticated
  // ====================================================
  // Determines whether the user is currently authenticated.
  //
  // Three things must be true:
  //
  // 1. user exists
  // 2. token exists
  // 3. token is not expired
  //
  const isAuthenticated = Boolean(
    user && storedToken && !isTokenExpired(storedToken),
  );

  // ====================================================
  // login()
  // ====================================================
  // Logs the user into the application.
  //
  // credentials might contain:
  //
  // {
  //   email,
  //   password
  // }
  // ====================================================
  async function login(credentials) {
    // Send login information to the backend
    //
    // await waits until the API responds.
    const data = await loginUser(credentials);

    // Check whether the backend returned a token
    if (data?.token) {
      // Save JWT token in localStorage
      localStorage.setItem("token", data.token);
    }

    // Check whether the backend returned user data
    if (data?.user) {
      // Convert user object to JSON string
      // and save it in localStorage.
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update React user state
      setUser(data.user);

      // Login was successful,
      // so sessionExpired should be false.
      setSessionExpired(false);
    }

    // Return the API response
    return data;
  }

  // ====================================================
  // register()
  // ====================================================
  // Registers a new user.
  // ====================================================
  async function register(payload) {
    // Send registration data to backend
    return registerUser(payload);
  }

  // ====================================================
  // logout()
  // ====================================================
  // Logs the current user out.
  // ====================================================
  function logout() {
    // Remove token and user from localStorage
    clearStoredSession();

    // Remove user from React state
    setUser(null);
  }

  // ====================================================
  // useEffect()
  // ====================================================
  // Listens for a SESSION_EXPIRED_EVENT.
  //
  // For example:
  //
  // API request
  //     ↓
  // Backend returns 401
  //     ↓
  // Axios interceptor
  //     ↓
  // SESSION_EXPIRED_EVENT
  //     ↓
  // handleSessionExpired()
  // ====================================================
  useEffect(() => {
    // Function that runs when session expires
    function handleSessionExpired() {
      // Remove token and user from localStorage
      clearStoredSession();

      // Clear user from React state
      setUser(null);

      // Tell React that the session expired
      setSessionExpired(true);
    }

    // Add an event listener to the browser window
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    // Cleanup function
    //
    // When AuthProvider is removed,
    // remove the event listener.
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []); // [] means the effect is set up once

  // ====================================================
  // refreshUser()
  // ====================================================
  // Re-checks the stored authentication session.
  // ====================================================
  function refreshUser() {
    // Read the latest token from localStorage
    const token = localStorage.getItem("token");

    // If there is no token
    // OR the token has expired...
    if (!token || isTokenExpired(token)) {
      // Log the user out
      logout();

      // Tell the caller that refresh failed
      return false;
    }

    // Read the stored user from localStorage
    const storedUser = readStoredUser();

    // Update React user state
    setUser(storedUser);

    // Return true if user exists,
    // otherwise return false.
    return Boolean(storedUser);
  }

  // ====================================================
  // Context Value
  // ====================================================
  // This object contains everything that other
  // components can access through useAuth().
  // ====================================================
  const value = useMemo(
    () => ({
      // Current logged-in user
      user,

      // Loading status
      loading,

      // true or false authentication status
      isAuthenticated,

      // true if session expired
      sessionExpired,

      // Login function
      login,

      // Registration function
      register,

      // Logout function
      logout,

      // Refresh user/session
      refreshUser,
    }),

    // Re-create the value when these values change
    [user, loading, isAuthenticated, sessionExpired],
  );

  // ====================================================
  // AuthContext.Provider
  // ====================================================
  // Makes authentication data available to all
  // components inside AuthProvider.
  // ====================================================
  return (
    <AuthContext.Provider value={value}>
      {/* Render the components inside AuthProvider */}
      {children}
    </AuthContext.Provider>
  );
}

// ======================================================
// useAuth()
// ======================================================
// Custom Hook used to access AuthContext.
//
// Example:
//
// const { user, logout } = useAuth();
// ======================================================
export function useAuth() {
  // Get authentication context
  const context = useContext(AuthContext);

  // If useAuth() is used outside AuthProvider,
  // context will be null.
  if (!context) {
    // Show a clear error message
    throw new Error("useAuth must be used inside AuthProvider");
  }

  // Return all authentication data/functions
  return context;
}
