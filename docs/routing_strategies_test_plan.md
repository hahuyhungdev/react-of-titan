# Routing Configuration Strategies Test Plan

This document outlines the test plan and verification matrix for validating the three distinct routing configurations supported by the **React of Titan** template repository:

1.  **`explicit`** (Default manual React Router v7 config)
2.  **`vite-plugin-pages`** (Auto-scanned file-system routing config)
3.  **`framework`** (Native React Router v7 build-time routing config)

---

## 1. Test Matrix & Criteria

For each strategy, run the `select-routing.py` script to switch configurations and then execute the following checks:

| Strategy                | Swapping | `npm install` | `format:check` | `arch:check` | `typecheck` | `lint`   | `test`   | `build`  | Verdict |
| :---------------------- | :------- | :------------ | :------------- | :----------- | :---------- | :------- | :------- | :------- | :------ |
| **`explicit`**          | Required | Required      | Required       | Required     | Required    | Required | Required | Required | TBD     |
| **`vite-plugin-pages`** | Required | Required      | Required       | Required     | Required    | Required | Required | Required | TBD     |
| **`framework`**         | Required | Required      | Required       | Required     | Required    | Required | Required | Required | TBD     |

The active `explicit` strategy is verified in CI. Re-run the full matrix whenever routing templates or `scripts/select-routing.py` change.

---

## 2. Test Execution Workflow

Run the tests sequentially using the CLI. Since each strategy replaces file structures, ensure that:

- We ran `npm install` after switching strategies to align `node_modules` with `package.json` changes.
- We ran `npm run format:check` to verify formatting across source, docs, workflows, and the AI skill.
- We ran `npm run arch:check` to verify layer boundaries.
- We ran `npm run typecheck` to verify that TS files compile under the strategy's specific `tsconfig.json` configurations.
- We ran `npm run lint` to confirm ESLint configuration continues to pass.
- We ran `npm test` to confirm unit and integration test examples continue to pass.
- We ran `npm run build` to verify that the bundling pipeline (Vite or React Router Dev Compiler) executes correctly.

---

## 3. Historical Fixes Applied

To achieve passing verdicts for all routing strategies, the following corrections were applied:

### A. Template Fixes

1.  **`explicit` Strategy (`scripts/templates/explicit/src/router.tsx`):**
    - Corrected the page imports to use lowercase directory paths (`@/pages/login`, `@/pages/register`, `@/pages/dashboard`, `@/pages/settings`, `@/pages/profile`) to match the actual folder layout.
    - Corrected the route wrapper component imports to `@/shared/components/routing` (exporting `ProtectedRoute` and `PublicRoute`).
    - Registered the `/profile` route and imported `ProfilePage`.

2.  **`vite-plugin-pages` Strategy (`scripts/templates/vite-plugin-pages/src/router.tsx`):**
    - Corrected the route wrapper component imports (`ProtectedRoute` and `PublicRoute`) to use `@/shared/components/routing`.

3.  **`framework` Strategy (`scripts/templates/framework/src/routes.ts`):**
    - Updated routes file mapping paths to correct lowercase names ending in `/index.tsx` (e.g., `pages/login/index.tsx`, `pages/register/index.tsx`, `pages/dashboard/index.tsx`, `pages/settings/index.tsx`).
    - Registered the `profile` route pointing to `pages/profile/index.tsx`.

### B. Selector Fixes (`scripts/select-routing.py`)

- Added `".react-router"` to the cleanup array lists for both `"explicit"` and `"vite-plugin-pages"` strategies. This ensures that the generated compiler cache from the `framework` strategy is successfully deleted when reverting back to other strategies.

### C. Build Pre-requisites

- Installed the `sass` preprocessor dependency as a devDependency to allow Vite to compile SCSS styles properly during build tasks.
