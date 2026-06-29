# ⚙️ Project Standards

## TypeScript

Strict mode is enabled. All TypeScript strict checks are enforced. Define types before implementation — type-first approach.

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## ESLint

Flat config with TypeScript + React rules. Enforces architecture boundaries via `no-restricted-imports` — prevents cross-feature internal imports.

```bash
npm run lint        # Check
npm run lint:fix    # Auto-fix
```

The import restriction rule catches this pattern:

```tsx
// ❌ Blocked by ESLint
import { useStats } from "@/features/dashboard-stats/hooks/useStats";

// ✅ Allowed
import { StatsSection } from "@/features/dashboard-stats";
```

## Architecture Boundary Check

`npm run arch:check` runs `scripts/check-architecture.mjs`, which parses TypeScript imports and enforces layer rules even for relative imports:

- `shared/` may only import other `shared/` code.
- `features/<name>/` may import `shared/` and files in the same feature only.
- `pages/` may import `shared/`, `layouts/`, and feature public indexes only.
- `layouts/` may import `shared/` only.
- root app files (`main.tsx`, `App.tsx`, `providers.tsx`, `router.tsx`) may compose all layers.

## Prettier

Consistent formatting across the codebase. Configured in `.prettierrc`:

- Semicolons: yes
- Single quotes: no (double quotes)
- Trailing commas: all
- Print width: 100
- Tab width: 2

```bash
npm run format         # Format all
npm run format:check   # Check without writing
```

## Git Hooks (Husky + lint-staged)

Pre-commit hook runs `lint-staged` automatically:

- **Staged `.ts`/`.tsx` files** → ESLint fix + Prettier format
- **Staged `.css`/`.json`/`.md` files** → Prettier format

If any check fails, the commit is blocked. Fix the issues and try again.

## Package Manager

This template standardizes on npm. CI uses `npm ci`, and `package-lock.json` is the lockfile source of truth.

## Absolute Imports

`@/` maps to `src/` — configured in `vite.config.ts` and `tsconfig.app.json`.

```tsx
import { Button } from "@/shared/components/ui/Button";
import { AuthSection } from "@/features/auth";
```

Use `@/` for cross-folder imports. Use relative `./` for same-feature imports.

## File Naming

| Type           | Convention                 | Example              |
| -------------- | -------------------------- | -------------------- |
| Feature folder | kebab-case                 | `dashboard-stats/`   |
| Component      | PascalCase                 | `StatsCard.tsx`      |
| Hook           | `use` + camelCase          | `useStats.ts`        |
| API file       | camelCase + `Api`          | `statsApi.ts`        |
| Types          | kebab + `.types`           | `stats.types.ts`     |
| Constants      | `index.ts` in `constants/` | `constants/index.ts` |
| Utils          | camelCase                  | `formatStats.ts`     |

## AI Assistance

This project includes repo-local AI guidance:

- `AGENTS.md` — instructions for agents working inside this repo.
- `skill/react-of-titan/SKILL.md` — portable skill guidance for applying this architecture elsewhere.

Use the skill when scaffolding, refactoring, or reviewing React projects against React of Titan architecture.
