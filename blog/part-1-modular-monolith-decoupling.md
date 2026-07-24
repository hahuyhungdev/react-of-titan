# The Micro Frontend Dilemma (Part 1): From Simple SPA to Nx Modular Monolith

*Why did the team's build speed double, but their deployment anxiety shoot through the roof? Welcome to Part 1 of our Micro Frontend series. Today, we trace the evolution of frontend architecture: how a startup grows from a simple SPA to an Nx Modular Monolith—and why this transition is the most critical step you can take.*

---

## 🎭 The Evolution: A Startup's Journey

Every successful frontend project begins with a dream. 

You start with a simple **Single Page Application (SPA)** using Vite and React. It has one directory, one team, and one developer (you). The code compiles in milliseconds, deployments are a simple push to Vercel or S3, and there is no coordination overhead.

Then, the business takes off. 

You hire ten more developers. You split them into two teams: Team Accounts and Team Transfers. They all write code in the same repository. Suddenly, the codebase starts to decay:
*   **Spaghetti Imports**: A junior developer imports the `TransfersButton` directly into the `AccountsPage` using a brittle relative import: `import { Button } from '../../transfers/components/button'`.
*   **The Shared Trash Can**: A folder named `shared-common-utils` is created. Within months, it holds 150 unrelated helper functions, database types, and UI components. Changing a single date formatter triggers test failures across the entire system.
*   **Merge Conflict Hell**: Both teams are constantly modifying `main.tsx` and `App.tsx` to register routes, causing daily merge blocks.

The developer experience grinds to a halt. In the Slack channels, developers start posting memes and debating:
> *"We need to split this monolith into Micro Frontends! Each team should have their own repository and run their own app!"*

But jumping straight from a messy SPA to Micro Frontends is a recipe for disaster. Before you can coordinate applications running across the network, you must learn to decouple your code inside a **Modular Monolith**.

---

## 🚫 Common Monolith Anti-Patterns (From the Trenches)

Based on the [micro-frontend.md](../docs/micro-frontend.md) reference architecture, there are three common mistakes teams make when organizing a monolith:

### 1. The Directory Import Jungle
Lacking structural enforcement, developers rely on deep, brittle paths:
```typescript
// ❌ Brittle relative imports couple the folder structure of separate domains
import { formatCurrency } from '../../../../shared/utils/format';
```

### 2. The Shared Core Hotspot
Putting business logic or domain services inside a shared folder. The shared core should change rarely, remain backward-compatible, and contain *only* primitive UI components (design tokens, buttons) or framework-agnostic helpers.

### 3. Circular Dependency Loops
Feature A imports Feature B, which imports Feature A. This makes independent compiling impossible and causes runtime initialization errors.

---

## 🛠️ The Solution: The Nx Modular Monolith

An **Nx Modular Monolith** divides your codebase into isolated packages (libraries) at compile-time. It keeps code in a single repository for version safety, but enforces strict boundaries.

Let's look at the implementation pattern modeled after [acme-platform](../acme-platform).

### 1. The "Thin Apps" Philosophy
We keep our application (`apps/shell`) as a thin, deployable wrapper. It contains *zero* business logic. Its only responsibilities are:
*   Bootstrapping the React application.
*   Registering top-level routes.
*   Setting up environment variables.

All actual business features live inside modular directories under `packages/` (or `libs/`):

```
acme-platform/
├── apps/
│   └── shell/               # Thin deployable app
├── packages/
│   ├── platform/
│   │   └── ui/              # Primitive shared UI component library
│   └── accounts/
│       ├── feature/          # Smart component layout for Accounts
│       └── data-access/      # API fetching and state hooks (Zustand/React Query)
```

### 2. Configure Conditional Package Exports
Instead of path mappings in `tsconfig.json` (which can slow down builds), we use **Package Manager Workspaces** combined with Vite's **Conditional Exports**.

Here is the configuration for `@acme-platform/ui` in [packages/platform/ui/package.json](../acme-platform/packages/platform/ui/package.json):

```json
{
  "name": "@acme-platform/ui",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@acme-platform/source": "./src/index.ts", // 💡 Resolves directly to source files during development
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",                // 💡 Resolves to built output for production compilation
      "default": "./dist/index.js"
    }
  }
}
```

By adding `"customConditions": ["@acme-platform/source"]` to the root [tsconfig.base.json](../acme-platform/tsconfig.base.json) compiler options, Vite loads the raw TypeScript source file directly during local development:
```typescript
import { Button } from '@acme-platform/ui'; // Vite resolves directly to src/index.ts!
```
This grants you **instant Hot Module Replacement (HMR)** with zero build-watch lag.

---

## 🛡️ Enforcing Boundaries with Nx Tags

You cannot enforce architecture using verbal agreements. We tag each package with a `scope` (domain namespace) and a `type` (layer purpose) inside its local config and use **ESLint** to block illegal imports:

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          depConstraints: [
            {
              // 1. Enforce Domain Scopes
              sourceTag: 'scope:accounts',
              onlyDependOnLibsWithTags: ['scope:accounts', 'scope:platform'] // ❌ Accounts cannot import Transfers
            },
            {
              // 2. Enforce Layer Types
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'] // ❌ UI dumb component cannot import features
            }
          ]
        }
      ]
    }
  }
];
```

---

## 🏁 Scorecard: When to Stay with a Monolith?

According to the MFE decision rules, you should remain on an **Nx Modular Monolith** if:
*   You only have one frontend team.
*   Your teams still deploy everything together on a single release cycle.
*   Your main goal is just to make builds faster (Nx caching and `affected` analysis solve this at build-time).

By modularizing first, you get code cleanliness without paying the network complexity tax.

*But what if your teams grow larger, and a synchronized release cycle is blocking your business velocity? In the next article, we take the leap into dynamic runtime composition. Read **Part 2: Going Dynamic with Vite + Module Federation**.*
