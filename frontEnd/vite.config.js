import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Locally, send /api to the backend so the browser sees one address,
  // like on Vercel. This lets the httpOnly login cookie work in development.
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
