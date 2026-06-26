# 🗄️ Project Structure

## Directory Map

```
src/
├── app/                          # App shell
│   ├── App.tsx                   # Root component
│   ├── providers.tsx             # Context providers
│   └── router.tsx                # Central route aggregator
│
├── pages/                        # Route-level components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── SettingsPage.tsx
│
├── features/                     # Business modules
│   ├── auth/
│   ├── dashboard-stats/
│   └── dashboard-activity/
│
├── shared/                       # Cross-feature reusable code
│   ├── components/ui/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   ├── types/
│   └── constants/
│
├── layouts/                      # Page layouts
└── styles/                       # Global CSS, design tokens
```

## Dependency Flow

```
shared  →  features  →  pages  →  app/router
```

Nothing imports upward. Each layer only knows about the layers below it.

## Where to Put Code

1. **Used by 2+ features?** → `shared/`
2. **A route-level component?** → `pages/`
3. **Tied to a specific domain?** → `features/<name>/`

Inside a feature:

| What            | Where         |
| --------------- | ------------- |
| API call        | `api/`        |
| UI component    | `components/` |
| Constants       | `constants/`  |
| React hook      | `hooks/`      |
| TypeScript type | `types/`      |
| Helper function | `utils/`      |

## Feature Anatomy

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

The `index.ts(x)` is the public boundary. It exports a compound component that composes all internal pieces. Pages import from the index, never from internal paths.

## Adding a New Feature

1. Create `src/features/<name>/` with sub-folders
2. Build the compound component in `index.tsx`
3. Create a page in `src/pages/`
4. Register the route in `app/router.tsx`
5. Run `npm run typecheck` and `npm run lint`

## Splitting Large Features

When a feature grows too large, split by sub-domain:

```
features/dashboard/           ← was too large

features/dashboard-stats/     ← focused
features/dashboard-activity/  ← focused
```

Each split feature is fully independent.
