import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// One-time cleanup: login data now lives in an httpOnly cookie, so remove
// what older versions of the app saved in localStorage.
try {
  Object.keys(localStorage)
    .filter(
      (key) => key === "token" || key === "user" || key.startsWith("profile:"),
    )
    .forEach((key) => localStorage.removeItem(key));
} catch {
  // storage unavailable: nothing to clean
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
