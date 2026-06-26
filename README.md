# Feature-Based React Architecture

[![CI](https://github.com/hahuyhungdev/architechture/actions/workflows/ci.yml/badge.svg)](https://github.com/hahuyhungdev/architechture/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)

A simple, scalable, and powerful architecture for building production-ready React applications using feature-based organization.

**Stack:** React 19 · TypeScript · Vite · React Router v7

## Introduction

React gives you freedom — and that freedom is both its greatest strength and its biggest trap. Without a clear architecture, codebases tend to drift into inconsistency: components scattered across folders, hooks duplicated between features, imports tangled in every direction.

This repo presents an approach that has worked well across many production codebases. Code is organized by **business feature**, not by technical type. Each feature contains everything it needs — components, hooks, API calls, types, utils. Pages compose features. Shared utilities live separately.

The result is a codebase where you can add, remove, or refactor a feature without touching anything outside it. New team members find things where they expect them. AI coding assistants understand the boundaries and follow them.

> **Note:** This is not a framework or boilerplate. It is an opinionated guide. Take what works for your team, adapt what doesn't, and stay consistent.

## Table of Contents

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

## Core Principles

This architecture is built on a few ideas that have proven themselves in production:

- **Feature isolation** — each feature is self-contained. Delete one without breaking others.
- **Unidirectional flow** — code depends downward: `shared → features → pages → app`. Never upward.
- **Compound components** — each feature exports one composed component. Pages stay thin.
- **Shared as a last resort** — only move code to `shared/` when 2+ features need it.
- **Convention over configuration** — naming, imports, and folder structure follow predictable patterns.

## Dependency Flow

```
shared  →  features  →  pages  →  app/router
```

| Layer       | Purpose                                       | Imports from       |
| ----------- | --------------------------------------------- | ------------------ |
| `shared/`   | Reusable components, hooks, utils, API client | —                  |
| `features/` | Self-contained business modules               | shared/            |
| `pages/`    | Route-level components that compose features  | shared/, features/ |
| `app/`      | Shell, providers, router config               | everything         |

## Directory Structure

```
src/
├── app/                    # App shell, providers, router config
├── pages/                  # Route-level components (1 page = 1 route)
├── features/               # Business modules (self-contained)
├── shared/                 # Reusable code used by multiple features
├── layouts/                # Page layouts (header, sidebar, etc.)
└── styles/                 # Global CSS, design tokens
```

## Feature Anatomy

Each feature follows the same internal structure. Only create sub-folders you actually need.

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

The `index.ts(x)` is the feature's public boundary. It exports a **compound component** that composes all internal pieces into one thing the page can render. Internal stays internal.

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

Features don't import from each other. If two features share code, it belongs in `shared/`.

## Adding a New Feature

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

**3. Create the page and register the route**

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

```tsx
// app/router.tsx
{ path: "/products", element: <ProductsPage /> }
```

**4. Verify**

```bash
npm run typecheck && npm run lint
```

## Naming Conventions

| Type           | Pattern                    | Example              |
| -------------- | -------------------------- | -------------------- |
| Feature folder | kebab-case                 | `dashboard-stats/`   |
| Component file | PascalCase                 | `StatsCard.tsx`      |
| Hook file      | `use` + camelCase          | `useStats.ts`        |
| API file       | camelCase + `Api`          | `statsApi.ts`        |
| Type file      | kebab + `.types`           | `stats.types.ts`     |
| Constants      | `index.ts` in `constants/` | `constants/index.ts` |
| Utils          | camelCase                  | `formatStats.ts`     |

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

## Contributing

1. Clone this repo
2. Create a branch: `git checkout -b your-feature`
3. Make changes
4. Run `npm run typecheck` and `npm run lint`
5. Push and open a Pull Request

## License

[MIT](./LICENSE)
