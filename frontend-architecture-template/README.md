# Frontend Architecture Template

A template showcasing **vertical/feature architecture** according to best practices synthesized from TkDodo (The Vertical Codebase), Feature-Sliced Design (FSD), and Bulletproof React.

## Stack

| Concern              | Selection                                                     |
| -------------------- | ------------------------------------------------------------- |
| Build                | Vite + TypeScript                                             |
| UI framework         | React 19                                                      |
| Server state         | TanStack Query                                                |
| Forms                | React Hook Form + Zod                                         |
| Routing              | React Router                                                  |
| Boundary enforcement | ESLint (`eslint-plugin-boundaries` + `no-restricted-imports`) |

## Structure

```txt
src/
├── app/                  # Highest compose layer: entry, providers, router, smart layouts
├── pages/                # Route-level: CONNECTS features (orchestrator)
├── features/             # Verticals — each feature is self-contained
│   ├── auth/             #   business feature
│   ├── billing/          #   business feature
│   ├── profile/          #   business feature
│   ├── notifications/    #   CAPABILITY — can be imported by other features
│   └── search/           #   CAPABILITY — can be imported by other features
├── entities/             # Shared business entities (User, ...)
├── shared/               # Shared layer
│   ├── components/       #   Shared UI Components
│   │   ├── ui/           #     PURE UI — zero vendor lib knowledge (Button, TextField, DataTable)
│   │   ├── rhf/          #     react-hook-form adapters (RHFTextField…) — only place that knows RHF
│   │   ├── icons/        #     SVG → components
│   │   └── layouts/      #     Dumb structural layouts (AuthLayout…)
│   ├── styles/           #   Shared styles
│   │   └── tokens.css    #     design tokens — single source of truth
│   ├── lib/              #   Generic helpers (date, currency, event-bus)
│   └── config/           #   Configurations (env.ts)
└── infrastructure/       # Adapters for the outside world: http, aws, ws
```

## Dependency Rules (Unidirectional Flow Downwards)

```txt
app ──► pages ──► features ──► entities ──► shared (components, styles, lib)
                     │
                     └──► infrastructure ──► shared
```

| From             | Allowed to Import                                                          | NOT Allowed to Import                           |
| ---------------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| `app`            | Everything                                                                 | —                                               |
| `pages`          | features, entities, shared                                                 | app, other pages                                |
| `features`       | **capabilities** (notifications, search), entities, shared, infrastructure | **other features** (except capabilities), app, pages |
| `entities`       | shared                                                                     | features, infrastructure                        |
| `infrastructure` | shared                                                                     | features, entities                              |
| `shared`         | shared only (or internal sub-folders)                                      | everything else                                 |

**All rules are enforced by ESLint** — see [eslint.config.js](eslint.config.js). Violations = CI fails, no manual review required.

## Conventions

### 1. Naming

- Feature folder: `kebab-case` (`billing/`, `page-filters/`)
- Component: `PascalCase.tsx` — hooks: `useXxx.ts` — schema/types: `xxx.schema.ts`, `xxx.types.ts`
- Tests colocated with source: `Button.test.tsx`

### 2. Public/private — NO barrel files

According to Bulletproof React: **do not use `index.ts` barrel files** in a Vite application — barrels break tree-shaking and slow down the dev server. Import files directly:

```ts
import { LoginForm } from "@/features/auth/components/LoginForm"; // ✅
import { LoginForm } from "@/features/auth"; // ❌ no barrel files
```

The public/private boundary is enforced by ESLint at the **segment** level (`boundaries/entry-point`):

| Segment                           | Visibility                                      |
| --------------------------------- | ----------------------------------------------- |
| `components/`, `hooks/`, `model/` | Public — can be imported externally             |
| `api/`, `internal/`               | **Private** — external imports = lint error     |

Boundaries are a logical concept enforced by tooling; barrel files are not required. (Barrels/public-API files are only useful when split into monorepo packages — in which case use `package.json` `exports` like TkDodo/Sentry.)

### 3. Vendor isolation (Critical)

Third-party SDKs leaking across the codebase results in severe vendor lock-in. Rules:

| Vendor                          | Allowed only inside                                                      |
| ------------------------------- | ------------------------------------------------------------------------ |
| `@radix-ui/*`, headless UI libs | `shared/components/`                                                     |
| `@aws-sdk/*`, `aws-amplify`     | `infrastructure/aws/`                                                    |
| `axios` / fetch wrapper         | `infrastructure/http/`                                                   |
| `react-hook-form`, `zod`        | features (forms are business logic) + `shared/components/rhf` (UI wrapper) |

→ If you switch from Radix to React Aria tomorrow: only modify `shared/components/`. If you switch from AWS S3 to GCS: only modify `infrastructure/aws/`.

**Internal structure of shared/components/** (application design system) — isolate vendors by sub-folder:

| Folder                            | Contains                                        | Vendor Knowledge Allowed?                  |
| --------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `ui/`                             | Pure UI: Button, TextField, DataTable, Modal…   | ❌ NO — only accepts props                 |
| `rhf/`                            | Adapters linking form libs with `ui/` (RHFTextField…) | ✅ react-hook-form                         |
| `icons/`                          | SVGs converted into React components            | ❌ (or SVGR generated)                     |
| _(extension)_ `charts/`, `editor/`… | Wrappers for Recharts, TipTap…                  | ✅ respective vendor, one vendor per folder |

Rule: **`ui/` never imports vendor libs or imports from `rhf/`/`charts/`** — the dependency flow is `rhf/ → ui/`, never the reverse.

### 4. Forms

- Zod schemas live in `features/<x>/model/` — schemas ARE business logic
- `useForm` + submit logic live inside the feature
- Input fields use `shared/components/rhf/` (RHF ↔ pure UI adapter) — `ui/` has no knowledge of RHF
- Check demo: [src/features/auth/components/LoginForm.tsx](src/features/auth/components/LoginForm.tsx)

### 5. Server state

- TanStack Query, `queryOptions` are colocated in `features/<x>/api/`
- Query keys are prefixed by feature: `['billing', 'invoices']`
- Never copy server state into client state stores

### 6. Cross-feature communication

1. **Preferred:** compose at the `pages/` level — passing props/callbacks ([DashboardPage](src/pages/dashboard/DashboardPage.tsx))
2. **Capabilities** (notifications, search): other features import their public files directly (components/hooks/model) — whitelisted in ESLint
3. **Fan-out** (1 event → n features): event bus ([shared/lib/event-bus.ts](src/shared/lib/event-bus.ts) + [useBillingEvents](src/features/billing/hooks/useBillingEvents.ts))

### 7. When a feature grows too large

Split into recursive sub-verticals: `billing/invoices/`, `billing/payments/` — each sub-vertical maintains the same segment conventions and public/private rules.

### 8. Layouts (Placement Decision Rules)

The placement of layout components (`AuthLayout`, `MainLayout`, ...) is determined by the layout's dependencies and complexity:

| Layout Type | Location | Rationale |
|---|---|---|
| **Dumb Layout** (only HTML/CSS layout structure, `NavLink`, `<Outlet />`, no business logic) | `src/shared/components/layouts/` | Pure structural UI, highly reusable, and does not violate the unidirectional dependency flow. |
| **Smart Layout** (contains business logic like user profile `useCurrentUser`, notifications counter, permission checks) | `src/app/layouts/` | Prevents FSD violations since `shared` is strictly forbidden from importing from `features`. The `app` layer sits at the top and can compose features safely. |

**Refactoring Rules**: If a dumb layout in `shared` later requires business logic, you have 2 options:
1. **Move the layout to `src/app/layouts/`** (simplest approach).
2. **Use Slots / Render Props**: Keep the layout dumb in `shared`, but declare slot props (e.g. `headerRight?: ReactNode`) and inject the smart widgets from `app/router.tsx` when configuring the route tree.

## Cheat sheet: "Where should this code go?"

```txt
Does it contain business/domain logic (invoice, user, refund)?
├─ YES  → features/<domain>/
│        Is it needed by multiple features?
│        ├─ Is it a shared type/entity  → entities/
│        ├─ Is it a shared capability   → features/<capability>/ (whitelisted)
│        └─ Is it a flow orchestration  → compose at pages/
└─ NO
   ├─ Pure UI template            → shared/components/ui/
   ├─ Pure utility helper         → shared/lib/
   └─ External API wrapper (http, aws, ws) → infrastructure/
```

## Running the application

```bash
pnpm install
pnpm dev          # start dev server
pnpm lint         # run ESLint boundaries + code quality checks
pnpm typecheck    # run TypeScript checks
pnpm build        # build production bundles
```
