# Routing Configuration Strategies Test Plan

This document outlines the test plan and verification matrix for validating the three distinct routing configurations supported by the **React of Titan** template repository:

1.  **`explicit`** (Default manual React Router v7 config)
2.  **`vite-plugin-pages`** (Auto-scanned file-system routing config)
3.  **`framework`** (Native React Router v7 build-time routing config)

---

## 1. Test Matrix & Criteria

For each strategy, we will run the `select-routing.py` script to switch configurations and then execute the following checks:

| Strategy                | Swapping | `npm install` | `npm run typecheck` | `npm run lint` | `npm run build` | Verdict   |
| :---------------------- | :------- | :------------ | :------------------ | :------------- | :-------------- | :-------- |
| **`explicit`**          | Active   | Yes           | Expected: Pass      | Expected: Pass | Expected: Pass  | _Pending_ |
| **`vite-plugin-pages`** | Swapped  | Yes           | Expected: Pass      | Expected: Pass | Expected: Pass  | _Pending_ |
| **`framework`**         | Swapped  | Yes           | Expected: Pass      | Expected: Pass | Expected: Pass  | _Pending_ |

---

## 2. Test Execution Workflow

We will run the tests sequentially using the CLI. Since each strategy replaces file structures, we will ensure that:

- We run `npm install` after switching strategies to align `node_modules` with `package.json` changes.
- We run `npm run typecheck` to verify that TS files compile under the strategy's specific `tsconfig.json` configurations.
- We run `npm run lint` to confirm ESLint configuration continues to pass.
- We run `npm run build` to verify that the bundling pipeline (Vite or React Router Dev Compiler) executes correctly.

Let's begin the verification process.
