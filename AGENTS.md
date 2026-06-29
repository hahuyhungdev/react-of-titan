# React of Titan Agent Instructions

This repo is a reference architecture for Vite + React + TypeScript applications. Keep changes aligned with the feature-based architecture rather than introducing one-off project structure.

## Architecture Rules

- Preserve dependency flow: `shared -> features -> pages -> app shell`.
- `shared/` may only depend on external packages and other `shared/` code.
- `features/<feature>/` may import `shared/` and same-feature files only.
- Pages may import feature public indexes, not feature internals.
- Move code to `shared/` only after at least two features need it.
- Each feature exposes its public surface from `features/<name>/index.ts(x)`.

## Implementation Defaults

- Use TypeScript strict types and avoid `any` unless a third-party type requires a narrow adapter.
- Use `@/` for cross-layer imports and relative imports inside a feature.
- Keep feature components, hooks, API functions, types, constants, and utilities colocated.
- Prefer React 19 patterns: `use()` for context reads, context objects as providers, and `ref` as a prop.
- Keep accessible form controls wired with `useId`, labels, `aria-invalid`, and `aria-describedby`.

## Verification

Run these before considering a change complete:

```bash
npm run format:check
npm run lint
npm run arch:check
npm run typecheck
npm test
npm run build
```

Use `npm run test:coverage` when adding or changing meaningful behavior.
