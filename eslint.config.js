import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Prevent cross-feature imports — enforce architecture boundaries
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/components/*", "@/features/*/hooks/*", "@/features/*/api/*", "@/features/*/utils/*", "@/features/*/types/*", "@/features/*/constants/*"],
              message: "Import from the feature's index (e.g. @/features/auth) instead of internal paths.",
            },
          ],
        },
      ],
    },
  },
]);
