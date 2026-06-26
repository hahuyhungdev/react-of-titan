# AGENTS.md — AI Agent Instructions

> This file tells AI coding assistants (Claude, Cursor, Copilot, Gemini) how to work with this codebase.
> Read this before making any changes.

## Project Overview

Feature-based React architecture — a scalable pattern where code is organized by business domain (features), not by file type. Each feature is self-contained with its own components, hooks, API calls, types, and utils.

**Stack:** React 19 · TypeScript · Vite · React Router v7

## AI Coding Config

This project uses [ai-coding-config](https://github.com/hahuyhungdev/ai-coding-config) for standardized AI assistant behavior. It provides:

- **Specialized agents** — `architect`, `code-reviewer`, `security-reviewer`, `tdd-guide`, `planner`, etc.
- **Skills** — `frontend-design`, `tdd-workflow`, `verification-loop`, `graphify`, etc.
- **Coding rules** — design quality, security, testing, performance standards

To install or update: `python3 ~/.claude/skills/*/install.py --project . --claude`

Use the agents and skills when relevant — they enforce consistent quality across the codebase.

## Architecture Rules

### Dependency Flow

```
shared  →  features  →  pages  →  app/router
```

Each layer only imports from layers below it. Never import upward.

| Layer       | Can import from            |
| ----------- | -------------------------- |
| `shared/`   | nothing internal           |
| `features/` | shared/                    |
| `pages/`    | shared/, features/         |
| `app/`      | shared/, features/, pages/ |

### Feature Structure

```
features/<name>/
├── index.ts(x)       # Public API — compound component
├── api/              # API request functions
├── components/       # UI components (internal)
├── constants/        # Feature-scoped constants
├── hooks/            # Feature-scoped hooks
├── types/            # TypeScript types
└── utils/            # Feature-scoped utilities
```

### Import Rules

```tsx
// ✅ Page imports from feature index
import { StatsSection } from "@/features/dashboard-stats";

// ✅ Feature imports from shared
import { Button } from "@/shared/components/ui/Button";

// ✅ Feature internal imports use relative paths
import { useStats } from "./hooks/useStats";

// ❌ Page reaching into feature internals
import { useStats } from "@/features/dashboard-stats/hooks/useStats";

// ❌ Feature importing from another feature
import { useAuth } from "@/features/auth/hooks/useAuth";
```

### The Index File

Each feature's `index.ts(x)` exports a **compound component** — one composed piece that pages can render. Internal hooks, sub-components, utils stay private.

```tsx
// features/dashboard-stats/index.tsx
import { StatsCard } from "./components/StatsCard"; // internal
import { useStats } from "./hooks/useStats"; // internal

export function StatsSection() {
  // ← exported
  const { stats, isLoading, error } = useStats();
  // ...compose internal components
}
```

### Shared vs Feature-Local

Only put code in `shared/` when **2 or more features** need it. Otherwise, keep it in the feature.

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
npm run dev          # Dev server
npm run build        # Type-check + production build
npm run typecheck    # TypeScript check only
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format all
```

## Before Making Changes

1. Run `npm run typecheck` to verify current state
2. Check which feature the change belongs to
3. If adding shared code, verify 2+ features need it
4. After changes, run `npm run lint` and `npm run typecheck`
5. Use `code-reviewer` agent after writing code
6. Use `security-reviewer` agent for auth, API, or user input changes
