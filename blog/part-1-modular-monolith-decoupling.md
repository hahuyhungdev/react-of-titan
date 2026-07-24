# The Micro Frontend Dilemma (Part 1): From Simple SPA to a Modular Monolith

*Why did our team's build speed double, but our deployment anxiety shoot through the roof? Welcome to Part 1 of our Micro Frontend series. Today, we’re tracing the evolution of frontend architecture: how a startup grows from a simple SPA to a Modular Monolith—and why this transition is the most critical step you can take before touching runtime federation.*

---

## 🎭 The Evolution: A Developer's Descent into Spaghetti

Every successful frontend project begins with a dream. 

You start with a simple **Single Page Application (SPA)** using Vite and React. It has one directory, one team, and one developer (you). The local server boots up in 150ms. Deployments are a simple push to Vercel or S3. Life is good, you write code at the speed of thought, and you feel like a 10x developer.

Then, the business takes off. 

Suddenly, your solo project becomes a company. You hire ten more developers and split them into two teams: **Team Accounts** and **Team Transfers**. They all write code in the same repository. Within months, the codebase begins to decay under the weight of scaling. The dev server now takes 30 seconds to start. Running `npm run build` is a great excuse to go make coffee. 

You notice three symptoms of architectural decay:

### 1. The Directory Import Jungle
A developer on Team Accounts needs a button. They find one in the Transfers folder and import it using a brittle relative path:
```typescript
// ❌ Brittle relative imports couple the folder structure of separate domains
import { TransfersButton } from '../../transfers/components/button';
```
When Team Transfers refactors their folder structure, Team Accounts' build breaks. Nobody is happy.

### 2. The Shared Trash Can (The "Utils" Trap)
To "solve" the import issue, someone creates a folder named `shared-common-utils`. Within six months, it becomes a dumping ground containing 150 unrelated helper functions, database types, and UI components. Changing a single date formatter triggers test failures across the entire system. It has no owner, no structure, and infinite gravity.

### 3. Merge Conflict Hell
Both teams are constantly modifying `main.tsx` and a giant `routes.tsx` to register pages and navigation. Morning standups consist of coordinating who gets to merge their PR first to avoid resolving a 200-line git conflict.

---

## 🚫 The Sirens of Micro Frontends

At this point, a senior engineer will inevitably post in Slack:
> *"This monolith is holding us back! We need to split this into Micro Frontends. Each team should have their own repository and deploy their own app independently!"*

It sounds like paradise. But jumping straight from a messy SPA to Micro Frontends (MFE) usually multiplies the existing coupling problems. If you cannot decouple your code inside a single repository (compile-time), coordinating multiple applications running across the network (runtime) will result in a distributed, un-debuggable mess. 

Before you pay the network complexity tax, you must learn to decouple your code inside a **Modular Monolith**.

### Three Principles That Guide the Rest of This Series:
1.  **Conway's Law**: *Architecture tends to mirror the communication structure of the organization.* If you have two product teams, your modules will naturally evolve into two distinct domains.
2.  **Micro Frontends are a deployment strategy, not a code organization strategy.** Splitting your code into multiple repositories will not magically fix bad import habits; it will only distribute them over the network.
3.  **Nx is an architecture enforcement tool, not the architecture itself.** Tooling can enforce boundaries, but you must define where those boundaries belong.

---

## 📦 Why Package by Business Domain?

In early-stage projects, developers usually group code by technical layers:
```
src/
├── components/   # Every UI button and modal in the app
├── hooks/        # Every custom React hook
├── pages/        # All page components
└── utils/        # All helper functions
```
While this seems organized, it has **low cohesion and high coupling**. When Team Accounts works on a new feature, they must touch four separate folders spread across the app. This creates friction and merge conflicts.

Instead, we organize packages around business domains, following a key principle from Domain-Driven Design: keep code aligned with business capabilities and ownership boundaries.

```
packages/
├── accounts/     # Contains accounts pages, state, and specific UI
├── transfers/    # Contains transfers pages, state, and specific UI
└── platform/     # Contains global UI design tokens and shared primitives
```
This keeps related code close together, making features easier to read, refactor, and delete.

---

## 🛠️ The Architecture of a Modular Monolith (Implemented with Nx)

A **Modular Monolith** divides your codebase into isolated packages (libraries) at compile-time. It keeps code in a single repository for version safety, but enforces strict boundaries.

Here is how the architecture is structured:

```
                          Shell App (bootstrap, routes)
                                │
                    ┌───────────┴────────────┐
               Accounts Domain          Transfers Domain
              (feature, data-access)   (feature, data-access)
                    │                         │
                    └────────────┬────────────┘
                          Platform UI (Design Tokens, Buttons)
                          Platform Utilities (Helpers)
```

> [!NOTE]
> **A Note on Platform Utilities**:
> While we criticize the "Shared Utils" dumping ground, stable and domain-neutral utilities (like general browser storage access or cryptographic helpers) are acceptable when placed inside a dedicated `platform/utilities` workspace library. Unrelated convenience functions with no clear owner must be avoided. Domain-specific helpers should remain inside their owning domain.

### 1. The "Thin Apps" Philosophy
We keep our application (`apps/shell`) as a thin, deployable wrapper. It contains *zero* business logic. Its only responsibilities are:
*   Bootstrapping the React application.
*   Registering top-level routes.
*   Setting up environment variables and global contexts.

All actual business features live inside modular directories under `packages/` (or `libs/`).

---

### 2. Enforcing the Downward Dependency Flow
Within each business domain, we divide our code into strict architectural layers:
*   **Feature**: Smart components and pages.
*   **Data Access**: State management, hooks, and API fetch calls.
*   **UI**: Dumb/presentational components.
*   **Util**: Pure helper functions.

Dependencies must flow **strictly downwards**:

```
Feature (Pages, Smart Components)
   │
   ├──────────────┐
   ▼              ▼
Data Access      UI (Presentational Components)
(API, state)      │
   │              │
   └──────┬───────┘
          ▼
        Utility (Helpers, Formatters)
```

#### Why enforce this flow?
*   **UI must never depend on Features or Data Access**: If a dumb `Button` in `@acme-platform/ui` imports a smart layout from `@acme-platform/accounts`, the button is no longer reusable.
*   **Data Access must never depend on UI or Features**: State fetching should remain presentation-agnostic so it can be tested in isolation.

---

### 3. What is Compile-Time Isolation?
**Compile-time isolation** means dependencies are validated before your application ships. Illegal imports fail during linting or build, rather than causing failures after deployment.

We enforce these boundaries using **ESLint** rules inside our monorepo. We tag each package with a `scope` (domain namespace) and a `type` (layer purpose) inside its local config:

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
              // 2. Enforce Layer Types (Downward Flow)
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'] // ❌ UI cannot import features
            }
          ]
        }
      ]
    }
  }
];
```
If a developer tries to import `@acme-platform/transfers` from `@acme-platform/accounts`, the IDE shows a red line immediately, and the CI/CD pipeline blocks the commit.

> [!TIP]
> **At this point, we have achieved three things:**
> 1. Domains own their business logic.
> 2. Layers depend only downward.
> 3. Tooling prevents invalid dependencies before deployment.

---

## ⚡ Solving Development Latency: Conditional Exports

Normally, Package A imports the built output of Package B. During local development, this creates watch/build latency—every time you edit Package B, you must wait for a compiler to rebuild it before Package A updates in the browser. 

We solve this by instructing Vite to bypass the build folder and load TypeScript source code directly. We configure this using **Package Manager Workspaces** combined with Vite's **Conditional Exports**.

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
      "@acme-platform/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

*   `@acme-platform/source`: points directly to raw TypeScript source files.
*   `types`: location of generated type declarations.
*   `import`: production JavaScript bundle import.
*   `default`: default fallback build file.

To connect this configuration: add the custom condition to TypeScript’s module resolution and ensure the Vite resolver includes the same condition. During development, both tools then resolve `@acme-platform/ui` to `src/index.ts`.

Here is the setup in both configuration files:

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "customConditions": ["@acme-platform/source"]
  }
}
```

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    conditions: ['@acme-platform/source']
  }
});
```

With this paired configuration, Vite reads the TypeScript source directly, giving you HMR in milliseconds.

---

## 🚀 Operational Benefits: Beyond Folder Organization

Modularizing your codebase with a tool like Nx does not just keep your imports clean; it unlocks powerful tools that accelerate your delivery pipelines:
*   **Affected Analysis**: Nx constructs a task graph of your code. When you open a PR, Nx analyzes which files changed and only runs tests, lints, and builds for the packages affected by those changes.
*   **Computation Caching**: If you build a package and haven't modified it, Nx retrieves the built output from its cache (either local or shared Remote Cache) in milliseconds instead of running the compiler again.
*   **Parallel Execution**: Tasks are run concurrently across CPU cores.

Here is how our CI Build Pipeline is structured:

```
Developer Push ──► Lint ──► Affected Test ──► Affected Build ──► Deploy Shell
```
If you only changed code in the Accounts domain, the Transfers tests and builds are skipped entirely, saving valuable CI minutes.

---

## 🏁 The Architectural Scorecard

Before you jump into runtime Module Federation, evaluate where you stand. A Modular Monolith is highly capable, but it has operational trade-offs and limits.

### Operational Trade-offs:
*   **Dependency Coordination**: Packages in the same application runtime usually need compatible versions of foundational dependencies such as React, routing, and state-management libraries. Major upgrades therefore require repository-wide coordination.
*   **Shared Release Pipeline**: Teams may have separate validation workflows, but changes ultimately converge into the same shell deployment and production release boundary.
*   **Single Version Boundary**: Even when Nx builds only the affected projects, the final frontend application is versioned and released as one deployable artifact.

### SPA vs. Modular Monolith vs. Runtime MFE

| Characteristic | SPA | Modular Monolith | Runtime MFE (Module Fed) |
| :--- | :--- | :--- | :--- |
| **Source boundaries** | Mostly internal folders | Enforced packages | Enforced applications/remotes |
| **Release boundary** | One application | One application | Multiple independently releasable units |
| **Runtime composition** | Single bundle/application | Single application | Multiple runtime applications |
| **Team autonomy** | Low–medium | Medium–high | High |
| **Operational complexity** | Low | Medium | High |
| **Runtime failure surface** | Small | Small | Larger |
| **Best fit** | Small product/team | Growing product teams | Teams requiring independent releases |

### Final Recommendation
*   **Modular Monolith**: Start here. Enforce strict package boundaries and downward dependency flow inside a single repository.
*   **Module Federation**: Transition here *only* when your teams grow too large to share a single synchronized release schedule.

*But what if your teams grow larger, and a synchronized release cycle is blocking your business velocity? In the next article, we take the leap into dynamic runtime composition. Read **[Part 2: Going Dynamic with Vite + Module Federation](./part-2-dynamic-vite-module-federation.md)**.*
