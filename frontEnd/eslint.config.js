import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      // AuthContext exports its hook next to the provider; that is fine.
      "react-refresh/only-export-components": "warn",
    },
  },
  {
    // The refs here are only read inside click handlers passed through
    // toolbarButton(); the rule can't see that, so it reports false errors.
    files: ["src/components/MarkdownEditor/MarkdownEditor.jsx"],
    rules: { "react-hooks/refs": "off" },
  },
]);
