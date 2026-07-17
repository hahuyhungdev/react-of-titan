// eslint.config.js — TRÁI TIM của kiến trúc này.
// Mọi luật dependency được enforce ở đây. Vi phạm = lint error = CI fail.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ── 1. LAYER BOUNDARIES ─────────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
      // Thứ tự quan trọng: pattern cụ thể (capability) đứng TRƯỚC pattern chung (feature)
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "pages", pattern: "src/pages/*", capture: ["page"] },
        {
          // Capabilities: features được phép import chúng (whitelist)
          type: "capability",
          pattern: "src/features/(notifications|search)",
          mode: "folder",
          capture: ["capability"],
        },
        { type: "feature", pattern: "src/features/*", capture: ["feature"] },
        { type: "entity", pattern: "src/entities/*", capture: ["entity"] },
        { type: "components", pattern: "src/shared/components" },
        { type: "infrastructure", pattern: "src/infrastructure" },
        { type: "shared", pattern: "src/shared" },
      ],
    },
    rules: {
      // Luật 1: ai được import ai — dependency chảy MỘT CHIỀU xuống dưới
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          message:
            "${file.type} không được import ${dependency.type}. Xem README > Luật dependency.",
          rules: [
            {
              from: "app",
              allow: [
                "app",
                "pages",
                "feature",
                "capability",
                "entity",
                "components",
                "shared",
                "infrastructure",
              ],
            },
            {
              from: "pages",
              allow: [
                "feature",
                "capability",
                "entity",
                "components",
                "shared",
              ],
            },
            {
              from: "feature",
              allow: [
                "capability", // notifications, search — được whitelist
                "entity",
                "components",
                "shared",
                "infrastructure",
                ["feature", { feature: "${from.feature}" }], // nội bộ chính nó
              ],
            },
            {
              from: "capability",
              allow: [
                "entity",
                "components",
                "shared",
                "infrastructure",
                ["capability", { capability: "${from.capability}" }],
              ],
            },
            {
              from: "entity",
              allow: [
                "shared",
                "components",
                ["entity", { entity: "${from.entity}" }],
              ],
            },
            { from: "components", allow: ["components", "shared"] },
            { from: "infrastructure", allow: ["infrastructure", "shared"] },
            { from: "shared", allow: ["shared"] },
          ],
        },
      ],

      // Luật 2: privacy KHÔNG dùng barrel (index.ts) — Bulletproof React khuyến nghị
      // tránh barrel với Vite (phá tree-shaking). Thay vào đó: import TRỰC TIẾP file,
      // và ranh giới public/private enforce theo SEGMENT:
      //   - components/, hooks/, model/  → public surface của feature
      //   - api/, internal/              → PRIVATE — ngoài feature import = error
      "boundaries/entry-point": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              target: ["feature", "capability"],
              allow: ["components/**", "hooks/**", "model/**", "index.ts", "index.tsx"],
            },
            {
              target: [
                "entity",
                "app",
                "pages",
                "components",
                "shared",
                "infrastructure",
              ],
              allow: "**",
            },
          ],
        },
      ],
    },
  },

  // ── 2. VENDOR ISOLATION ─────────────────────────────────────────────
  // SDK bên thứ ba chỉ được import trong adapter layer của nó.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/infrastructure/**", "src/shared/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@aws-sdk/*", "aws-amplify", "aws-amplify/*"],
              message:
                "AWS SDK chỉ được import trong src/infrastructure/aws/. Dùng adapter đã export.",
            },
            {
              group: ["@radix-ui/*", "@headlessui/*"],
              message:
                "Headless UI libs chỉ được import trong src/shared/components/. Dùng component đã wrap.",
            },
            {
              group: ["axios"],
              message:
                "HTTP client chỉ được cấu hình trong src/infrastructure/http/. Dùng httpClient.",
            },
          ],
        },
      ],
    },
  },

  // ── 3. CODE QUALITY & PLUGINS ─────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "import": importPlugin,
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      ...reactHooks.configs.recommended.rules,
      "import/no-cycle": "error",
    },
  },
);
