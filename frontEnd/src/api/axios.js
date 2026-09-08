import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Name of the event AuthContext listens for. Interceptors live outside React,
// so they cannot call setUser directly — they announce it and the provider reacts.
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

// A 401 from login or register means "wrong password", not "your session ended".
// Those belong to the form, so they must not tear the session down.
function isAuthEndpoint(url = "") {
  return url.includes("/auth/login") || url.includes("/auth/register");
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionLoss =
      error.response?.status === 401 && !isAuthEndpoint(error.config?.url);

    if (isSessionLoss) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  },
);

export default api;
