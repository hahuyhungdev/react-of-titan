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
shared  →  features  →  pages  →  router
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
├── components/       # UI components (internal, structured as folders)
│   └── MyComponent/
│       ├── MyComponent.tsx
│       └── MyComponent.scss (optional, only if style is complex)
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
import { Button } from "@/shared/components/ui/Button/Button";

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
import { StatsSection } from "./components/StatsSection/StatsSection"; // internal

export { StatsSection };
```

### Shared vs Feature-Local

Only put code in `shared/` when **2 or more features** need it. Otherwise, keep it in the feature.

## Routing Strategies

AI agents must first read `ai-settings.json` at the project root to detect the active `"routing"` strategy (`"explicit"`, `"vite-plugin-pages"`, or `"framework"`). AI agents should adapt their code generation and routing configurations for each strategy as follows:

- **For `"explicit"`**: Manually register new pages in `src/router.tsx` using named component imports.
- **For `"vite-plugin-pages"`**: Create pages in `src/pages/` (they will be auto-scanned). Layout routing is programmatically mapped inside `src/router.tsx` (new pages might need to be added to the auth/main path lists if they don't match the existing regex patterns).
- **For `"framework"`**: Register pages in `src/routes.ts` and ensure all pages and layouts export their main components as default exports.

To maintain cross-strategy compatibility, all components (pages and layouts) should export both **named** and **default** exports.

## Naming Conventions

| Type           | Pattern                    | Example                       |
| -------------- | -------------------------- | ----------------------------- |
| Feature folder | kebab-case                 | `dashboard-stats/`            |
| Component      | Folder + PascalCase file   | `StatsCard/StatsCard.tsx`     |
| Page           | Folder + PascalCase file   | `Dashboard/DashboardPage.tsx` |
| Hook file      | `use` + camelCase          | `useStats.ts`                 |
| API file       | camelCase + `Api`          | `statsApi.ts`                 |
| Type file      | kebab + `.types`           | `stats.types.ts`              |
| Constants      | `index.ts` in `constants/` | `constants/index.ts`          |
| Utils          | camelCase                  | `formatStats.ts`              |

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

<!-- ai-coding-config:graphify-start -->

## graphify

⚠️ GRAPHIFY WORKFLOW RULES (MANDATORY — READ BEFORE ANY CODEBASE EXPLORATION):

**CRITICAL: For ANY question about codebase structure, architecture, or file relationships, your VERY FIRST tool call MUST be `rtk graphify query "<question>"`. Do NOT use `list_dir`, `grep_search`, `find`, `cat`, or `view_file` as your first exploration step. Graphify-first is non-negotiable.**

Commands:

- Architecture questions → `rtk graphify query "question"`
- Code relationships → `rtk graphify path "A" "B"`
- Deep-dive concepts → `rtk graphify explain "concept"`
- Impact analysis / reverse dependencies → `rtk graphify affected "SymbolName"`

Rules:

- For broad codebase exploration, use **Graphify-first**. Do NOT use view_file, list_dir, cat, grep, sed, awk, or inline scripts to discover unknown files or architecture.
- For architecture or relationship questions, do not inspect Graphify skill files, list workspace directories, or check permissions before the first Graphify query. Use the commands listed above directly.
- Exact user-provided file paths may be read normally first. Use Graphify after that when mapping those files to routes, components, dependencies, or architecture.
- Use at most **20 Graphify calls** total per question. After 20 calls, hard stop and synthesize from available context.
- **Focus queries on specific symbols** — prefer `graphify query "what does X do"` over `graphify query "explain the codebase"`.
- **Synthesize architecture/discovery answers from Graphify context first.** Supplement with targeted direct file reads only when the file path is explicit or Graphify has identified it.
- **If a tool call is blocked, do not retry.** Proceed and answer using the available context.
- Dirty `graphify-out/` files are expected after hooks or incremental updates and are not a reason to skip Graphify.
- Do not manually read or parse graphify-out/graph.json; it is an internal artifact. Use the graphify CLI (`rtk graphify query/path/explain/affected`) instead. Existence probes such as `test -f graphify-out/graph.json` are acceptable.
- When the user provides an exact `@path` or file path, read that path directly if useful; do not list parent directories to locate it.
- Explicit docs or source files may be read as user-provided context before Graphify. Mapping those files to source code, routes, components, or architecture still requires Graphify.
- Do not create or run scratch reader scripts such as `scratch_read.py` to inspect files; use Graphify or targeted direct reads after Graphify instead.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only when scoped queries are insufficient or the user requests a broad report.

Post-Discovery Reads (exceptions):

- After Graphify discovery, targeted raw reads ARE allowed for: **editing**, **debugging**, and **config review** of specific files already identified by Graphify.
- You MUST have run at least one Graphify query before reading source files directly.
- When reading after discovery, state your justification (e.g., "Reading for editing" or "Verifying config structure").
- After modifying code, run `graphify update .`.

Blocked Tool Recovery:

- If a hook blocks a direct read/search or inline script, do not retry the same blocked call or attempt an equivalent bypass.
- Do not spawn subagents or fresh sessions to bypass blocked tools, Graphify quota, or current session scope restrictions.
- Do not create or run scratch reader scripts to bypass direct read/search restrictions. Scratch scripts are allowed only for durable diagnostics when no project utility exists.
- For conversation log debugging in this repo, use `rtk python3 scripts/inspect_conversation.py <conversation_id> --step-index <n> --keyword "<text>"`; add `--compare-logs` when comparing compact vs full transcripts.
- When debugging truncation, measure full content length and keyword presence; do not use substring-only previews as evidence.
<!-- ai-coding-config:graphify-end -->
