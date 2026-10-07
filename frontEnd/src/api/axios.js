import axios from "axios";
import { API_BASE_URL } from "./config.js";

const api = axios.create({
  baseURL: API_BASE_URL,
  // The browser sends the httpOnly auth cookie automatically.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Name of the event AuthContext listens for. Interceptors live outside React,
// so they cannot call setUser directly; they announce it and the provider reacts.
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

// A 401 from these routes is expected (wrong password, or simply not logged
// in yet), so it must not be treated as "your session ended".
function isAuthEndpoint(url = "") {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/me") ||
    url.includes("/auth/logout")
  );
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionLoss =
      error.response?.status === 401 && !isAuthEndpoint(error.config?.url);

    if (isSessionLoss) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  },
);

export default api;
