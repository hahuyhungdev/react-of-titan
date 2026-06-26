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

This project uses [ai-coding-config](https://github.com/hahuyhungdev/ai-coding-config) for consistent AI behavior. Key agents to use:

- **`code-reviewer`** — after writing code
- **`security-reviewer`** — for auth, API, user input changes
- **`tdd-guide`** — for new features and bug fixes
- **`architect`** — for system design decisions

See `AGENTS.md` for full AI agent instructions.
