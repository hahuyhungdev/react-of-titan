# Feature-Based React Architecture

A React project organized by **features**, not by file type. Each feature contains everything it needs — components, hooks, API calls, types, utils. Pages compose features, and shared utilities live separately.

**Stack:** React 19 · TypeScript · Vite · React Router v7

## Documentation

|     | Section                                                    | Description                                        |
| --- | ---------------------------------------------------------- | -------------------------------------------------- |
| 💻  | [Application Overview](./docs/application-overview.md)     | Tech stack, getting started, environment setup     |
| ⚙️  | [Project Standards](./docs/project-standards.md)           | TypeScript, ESLint, Prettier, git hooks, naming    |
| 🗄️  | [Project Structure](./docs/project-structure.md)           | Directory layout, dependency flow, adding features |
| 🧱  | [Components and Styling](./docs/components-and-styling.md) | Component patterns, CSS tokens, styling approach   |
| 📡  | [API Layer](./docs/api-layer.md)                           | API client, request declarations, error handling   |
| 🗃️  | [State Management](./docs/state-management.md)             | Component, feature, server, and global state       |
| 🧪  | [Testing](./docs/testing.md)                               | Testing strategy, tools, what to test              |
| ⚠️  | [Error Handling](./docs/error-handling.md)                 | API errors, error boundaries, validation           |
| 🔐  | [Security](./docs/security.md)                             | Auth, tokens, XSS prevention, CSP                  |
| 🚄  | [Performance](./docs/performance.md)                       | Code splitting, loading strategy, bundle budget    |
| 🌐  | [Deployment](./docs/deployment.md)                         | Build, CI/CD, deploy targets                       |
| 📚  | [Additional Resources](./docs/additional-resources.md)     | References, libraries, tools                       |

## AI Coding Config

This project uses [ai-coding-config](https://github.com/hahuyhungdev/ai-coding-config) for standardized AI assistant behavior. It provides specialized agents (`architect`, `code-reviewer`, `security-reviewer`, `tdd-guide`), skills (`frontend-design`, `tdd-workflow`, `verification-loop`), and coding rules that enforce quality standards.

```bash
python3 ~/.claude/skills/*/install.py --project . --claude
```

See [AGENTS.md](./AGENTS.md) for project-specific AI agent instructions.

## How Code Flows

```
shared  →  features  →  pages  →  app/router
```

Each layer only knows about the layers below it. This keeps things decoupled — you can change a feature's internals without touching pages, and swap shared utilities without breaking features.

| Layer       | Purpose                                       | Imports from       |
| ----------- | --------------------------------------------- | ------------------ |
| `shared/`   | Reusable components, hooks, utils, API client | —                  |
| `features/` | Self-contained business modules               | shared/            |
| `pages/`    | Route-level components that compose features  | shared/, features/ |
| `app/`      | Shell, providers, router config               | everything         |

## Directory Overview

```
src/
├── app/                    # App shell, providers, router config
├── pages/                  # Route-level components (1 page = 1 route)
├── features/               # Business modules (self-contained)
├── shared/                 # Reusable code used by multiple features
├── layouts/                # Page layouts (header, sidebar, etc.)
└── styles/                 # Global CSS, design tokens
```

## Where Does This Code Go?

When adding new code, figure out where it belongs:

1. **Used by 2+ features?** → `shared/`
2. **A route-level component?** → `pages/`
3. **Tied to a specific business domain?** → `features/<feature-name>/`

Inside a feature, pick the right sub-folder:

| What you're adding  | Where it goes                 |
| ------------------- | ----------------------------- |
| API call            | `features/<name>/api/`        |
| UI component        | `features/<name>/components/` |
| Constants or config | `features/<name>/constants/`  |
| React hook          | `features/<name>/hooks/`      |
| TypeScript type     | `features/<name>/types/`      |
| Helper function     | `features/<name>/utils/`      |

## Anatomy of a Feature

```
features/<feature-name>/
├── index.ts(x)           # Public API — compound component
├── api/                  # API request functions
├── components/           # UI components
├── constants/            # Feature-scoped constants
├── hooks/                # Feature-scoped React hooks
├── types/                # TypeScript interfaces/types
└── utils/                # Feature-scoped utility functions
```

Only create sub-folders you actually need. A small feature might just have `index.tsx` and `components/`.

### The Index File

The `index.ts(x)` is the feature's public face. It exports a **compound component** that composes all the internal pieces — hooks, sub-components, utils — into one thing the page can render.

Internal stays internal. The page doesn't need to know about `useStats` or `StatsCard`.

```tsx
// features/dashboard-stats/index.tsx

import { StatsCard } from "./components/StatsCard";
import { useStats } from "./hooks/useStats";

export function StatsSection() {
  const { stats, isLoading, error } = useStats();

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div role="alert">{error}</div>;

  return (
    <section>
      <StatsCard label="Users" value={stats?.totalUsers ?? 0} />
    </section>
  );
}
```

The page just imports the compound component:

```tsx
// pages/DashboardPage.tsx
import { StatsSection } from "@/features/dashboard-stats";
import { ActivitySection } from "@/features/dashboard-activity";

export function DashboardPage() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <StatsSection />
      <ActivitySection />
    </div>
  );
}
```

This keeps pages thin — they're just layout and composition. The feature owns all the complexity.

## Import Patterns

**Cross-folder imports** use the `@/` alias. **Same-feature imports** use relative `./` paths.

```tsx
// ✅ Page imports from feature index
import { StatsSection } from "@/features/dashboard-stats";

// ✅ Feature imports from shared
import { Button } from "@/shared/components/ui/Button";
import { apiClient } from "@/shared/lib/apiClient";

// ✅ Feature internal imports use relative paths
import { useStats } from "./hooks/useStats";
import { StatsCard } from "./components/StatsCard";
```

Keep imports clean — pages import from feature indexes, not from internal paths. Features don't import from each other; if two features share code, it belongs in `shared/`.

## Shared vs Feature-Local

`shared/` holds things that multiple features need. If only one feature uses something, keep it there — don't move it to shared preemptively.

| In `shared/`           | Why                                   |
| ---------------------- | ------------------------------------- |
| `components/ui/Button` | Used across auth, dashboard, settings |
| `lib/apiClient`        | Used by every feature's `api/`        |
| `hooks/useDebounce`    | Generic, not domain-specific          |
| `utils/cn`             | Classname utility                     |
| `types/api`            | API response shapes                   |
| `constants/`           | Routes, storage keys, app name        |

## Splitting Large Features

When a feature grows too big, split it by sub-domain into separate features:

```
features/dashboard/           ← was getting large

features/dashboard-stats/     ← focused on stats
features/dashboard-activity/  ← focused on activity
```

Each split feature is independent — its own api, hooks, types, utils, components, and index. They don't import from each other.

## Adding a New Feature

Here's the typical workflow when adding a new feature (e.g., `products`):

**1. Create the feature structure**

```
src/features/products/
├── index.tsx                 # compound component
├── api/productsApi.ts        # API calls
├── components/ProductList.tsx
├── constants/index.ts
├── hooks/useProducts.ts
├── types/product.types.ts
└── utils/formatProduct.ts
```

**2. Build the compound component in `index.tsx`**

```tsx
import { ProductList } from "./components/ProductList";
import { useProducts } from "./hooks/useProducts";

export function ProductsSection() {
  const { products, isLoading, error } = useProducts();
  if (isLoading) return <div>Loading…</div>;
  if (error) return <div role="alert">{error}</div>;
  return <ProductList products={products} />;
}
```

**3. Create the page**

```tsx
// pages/ProductsPage.tsx
import { ProductsSection } from "@/features/products";

export function ProductsPage() {
  return (
    <div className="page">
      <h1>Products</h1>
      <ProductsSection />
    </div>
  );
}
```

**4. Register the route in `app/router.tsx`**

```tsx
import { ProductsPage } from "@/pages/ProductsPage";

// Add to the children array:
{ path: "/products", element: <ProductsPage /> }
```

**5. Verify**

```bash
npm run typecheck
npm run dev
```

## Naming Conventions

| Type           | Pattern                    | Example              |
| -------------- | -------------------------- | -------------------- |
| Feature folder | kebab-case                 | `dashboard-stats/`   |
| Component file | PascalCase                 | `StatsCard.tsx`      |
| Hook file      | `use` + PascalCase         | `useStats.ts`        |
| API file       | camelCase + `Api`          | `statsApi.ts`        |
| Type file      | kebab + `.types`           | `stats.types.ts`     |
| Constants      | `index.ts` in `constants/` | `constants/index.ts` |
| Utils          | camelCase                  | `formatStats.ts`     |
| Interface      | PascalCase                 | `DashboardStats`     |
| Component      | PascalCase                 | `StatsSection`       |
| Hook           | `use` + camelCase          | `useStats`           |
| CSS class      | kebab-case                 | `stats-card`         |

## Scripts

```bash
npm run dev          # Dev server at localhost:5173
npm run build        # Type-check + production build
npm run typecheck    # TypeScript check only
npm run lint         # ESLint check
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format all
npm run format:check # Prettier check without writing
npm run preview      # Preview production build
```

## Path Aliases

`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

```tsx
import { Button } from "@/shared/components/ui/Button";
import { AuthSection } from "@/features/auth";
import { LoginPage } from "@/pages/LoginPage";
```
