---
name: react-of-titan
description: Use when creating, refactoring, or reviewing Vite + React + TypeScript applications that should follow the React of Titan feature-based architecture: shared/features/pages/app layering, feature public indexes, scoped hooks/API/types/utils, test coverage, and architecture boundary checks.
---

# React of Titan

Use this skill to apply the React of Titan architecture to React projects.

## Core Structure

```text
src/
├── main.tsx
├── App.tsx
├── providers.tsx
├── router.tsx
├── pages/
├── features/
├── shared/
├── layouts/
└── styles/
```

## Dependency Flow

```text
shared -> features -> pages -> app shell
```

- `shared/`: reusable code used by multiple features. It must not import features, pages, or layouts.
- `features/<name>/`: business modules. A feature may import `shared/` and its own files only.
- `pages/`: route-level composition. Pages import feature public indexes, not feature internals.
- app shell: `main.tsx`, `App.tsx`, `providers.tsx`, and `router.tsx` compose all layers.

## Feature Anatomy

Create only folders the feature actually needs:

```text
features/<feature-name>/
├── index.tsx
├── api/
├── components/
├── constants/
├── hooks/
├── types/
└── utils/
```

`index.tsx` is the feature boundary. Pages should import from `@/features/<feature-name>` only.

For a normal page-backed feature, the minimum practical slice is:

```text
features/<feature-name>/
├── index.tsx
├── components/<InternalComponent>/index.tsx
├── hooks/use<FeatureName>.ts
├── types/<feature-name>.types.ts
├── styles.module.scss
└── __tests__/<FeatureName>.test.tsx
```

## Placement Rules

- Used by two or more features: move to `shared/`.
- Tied to one business capability: keep inside that feature.
- Route-level screen: put in `pages/`.
- Layout shell: put in `layouts/`.
- Provider owned by a feature: implement inside the feature and export from its index; compose it in `providers.tsx`.

## Adding A Page-Backed Feature

1. Create the feature slice under `src/features/<feature-name>/`.
2. Export one public compound component from `src/features/<feature-name>/index.tsx`.
3. Create the route page under `src/pages/<route-name>/index.tsx`.
4. In the page, import only from the feature public index.
5. Export both a named page component and a default export.
6. Register the route in `src/router.tsx` for explicit routing.
7. If the route belongs in the main app navigation, add a `NavLink` in `src/layouts/MainLayout.tsx`.
8. Add at least one feature test under the feature's `__tests__/` folder.

## Implementation Rules

- Use TypeScript strict types.
- Use `@/` for cross-layer imports and relative imports inside a feature.
- Do not use JSX inline styles (`style={{ ... }}`) for layout, spacing, colors, typography, or status variants.
- Put component styles in `styles.module.scss`, or use Tailwind utility classes only in projects that already have Tailwind configured.
- Express dynamic visual states with class variants, e.g. `status-done`, `priority-high`, or `is-selected`.
- Prefer React 19 APIs: `use()` for context reads, context objects as providers, and ref as a prop.
- Make shared inputs accessible with stable unique IDs, labels, `aria-invalid`, and `aria-describedby`.
- Keep server state in feature hooks or a server-state library; avoid globalizing state by default.
- For demo/reference features without a backend, keep mock data inside the feature hook.
- When testing code that crosses the network boundary or uses `apiClient`, mock the network with MSW instead of stubbing request clients.

## Naming Conventions

- Feature folders: kebab-case, e.g. `billing-summary`.
- Public feature components: PascalCase with a domain name, e.g. `BillingSummarySection`.
- Hooks: `use` + PascalCase domain, e.g. `useBillingSummary`.
- Types: `<feature-name>.types.ts`.
- Tests: colocate feature integration tests in `features/<feature>/__tests__/`.
- Internal component imports inside a feature should be relative paths.

## Verification

Run the project checks before finishing:

```bash
npm run format:check
npm run lint
npm run arch:check
npm run typecheck
npm test
npm run build
```

For behavior changes, add or update Vitest/React Testing Library tests first.
