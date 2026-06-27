# Repository Structure & Architecture Guide

Welcome to the **React of Titan** codebase. This project uses a scale-optimized, domain-driven (feature-based) React architecture. Code is organized around business features rather than generic file types (e.g., all components, hooks, and API logic for a dashboard stats section live together).

This repository serves as a **Reference Architecture Template** to guide other frontend applications. All developers must follow these patterns strictly.

---

## 1. Project Directory Layout

The `src/` directory is structured into clean layers, each with strict rules of responsibility:

```
src/
├── main.tsx              # DOM mount and global styling imports
├── App.tsx               # App entry, wraps Router with AppProviders
├── providers.tsx          # AppProviders (composes feature-level providers)
├── router.tsx             # Explicit React Router tree & route guards
│
├── styles/                # Global styles (Resets and design tokens only, no component-specific CSS)
│   ├── tokens.css         # Design tokens (colors, sizes, variables)
│   ├── typography.css     # Font-face and type scale
│   └── global.css         # CSS reset, base typography, and generic utility classes
│
├── layouts/               # Route-level layout wrappers
│   ├── MainLayout.tsx     # Shell for auth pages (navigation, header, sidebar)
│   └── AuthLayout.tsx     # Minimal layout for guest pages (login, register)
│
├── shared/                # Global code reused by 2+ features
│   ├── components/        # Reusable components
│   │   ├── ui/            # Atomic, stateless design-system primitives (Button, Input, Spinner)
│   │   │   ├── Button/
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.module.scss
│   │   │   └── Input/
│   │   │       ├── index.tsx
│   │   │       └── styles.module.scss
│   │   ├── react-hook-form/ # Custom form wrappers for react-hook-form / zod integration
│   │   │   ├── Form/
│   │   │   │   └── index.tsx
│   │   │   ├── FormField/
│   │   │   │   └── index.tsx
│   │   │   └── index.ts
│   │   ├── routing/       # Custom route-guard wrappers
│   │   │   ├── ProtectedRoute/
│   │   │   │   └── index.tsx
│   │   │   ├── PublicRoute/
│   │   │   │   └── index.tsx
│   │   │   └── index.ts
│   │   ├── errors/        # Error boundary and logging components
│   │   │   ├── ErrorBoundary/
│   │   │   │   └── index.tsx
│   │   │   └── index.ts
│   │   └── common/        # Composite/utility components (e.g. FileUploader)
│   │       ├── FileUploader/
│   │       │   └── index.tsx
│   │       └── index.ts
│   ├── constants/         # App-wide configuration/constants (ROUTES, STORAGE_KEYS)
│
│   ├── context/           # React Context definitions (AuthContext)
│   ├── hooks/             # Generic custom hooks (useLocalStorage, useDebounce)
│   ├── lib/               # Shared clients (lightweight apiClient fetch wrapper)
│   ├── types/             # Global types (ApiResponse, auth types)
│   └── utils/             # Reusable helper functions (cn, formatter)
│
├── features/              # Self-contained business features (domain modules)
│   ├── auth/
│   │   ├── index.tsx      # Public entry point (renders AuthSection & exports AuthProvider)
│   │   ├── styles.module.scss # Feature-wide styles
│   │   ├── api/           # Internal APIs (authApi)
│   │   ├── components/    # Private UI sub-components
│   │   │   ├── LoginForm/
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.module.scss
│   │   │   └── AuthProvider/
│   │   │       └── index.tsx
│   │   └── ...
│   ├── dashboard-stats/
│   │   ├── index.tsx      # Public entry point (renders StatsSection)
│   │   ├── styles.module.scss
│   │   └── components/
│   │       └── StatsCard/
│   │           ├── index.tsx
│   │           └── styles.module.scss
│   └── dashboard-activity/
│       ├── index.tsx      # Public entry point (renders ActivitySection)
│       ├── styles.module.scss
│       └── components/
│           └── ActivityFeed/
│               ├── index.tsx
│               └── styles.module.scss
│
└── pages/                 # Route views that assemble compound feature components
    ├── dashboard/         # DashboardPage
    │   └── index.tsx
    ├── login/             # LoginPage
    │   └── index.tsx
    ├── profile/           # ProfilePage
    │   └── index.tsx
    └── settings/          # SettingsPage
        ├── index.tsx
        └── styles.module.scss


```

---

## 2. Dependency Flow Rules

To prevent spaghetti code, dependencies flow strictly downward. Files in a layer can only import from layers to their left or below them:

```
shared  →  features  →  pages  →  layouts  →  Root (App / Router / Providers)
```

| Layer           | Permitted Imports                                                     | Strictly Prohibited Imports                                                                                 |
| :-------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **`shared/`**   | Only external npm packages.                                           | Cannot import from features, pages, layouts, or app (must only import from other folders inside `shared/`). |
| **`features/`** | `shared/` & feature-local relative files.                             | Cannot import from sibling features, layouts, or pages.                                                     |
| **`layouts/`**  | `shared/`                                                             | Cannot import from features or pages.                                                                       |
| **`pages/`**    | `shared/`, layout components, and feature **`index.tsx` files only**. | Cannot import from feature internals (e.g. `features/stats/hooks/*`).                                       |

| **Root (`src/`)** | Can import from any layer. | — |

### Import Guidelines

- **Page importing from feature:**

  ```tsx
  // ✅ YES: Import from the feature entry index
  import { StatsSection } from "@/features/dashboard-stats";

  // ❌ NO: Do not bypass the public index file
  import { useStats } from "@/features/dashboard-stats/hooks/useStats";
  ```

- **Feature importing from shared:**
  ```tsx
  // ✅ YES: Always import via absolute path alias to the component folder
  import { Button } from "@/shared/components/ui/Button";
  ```
- **Feature internal files:**
  ```tsx
  // ✅ YES: Always use relative paths for files within the same feature
  import { StatsCard } from "./components/StatsCard";
  import { useStats } from "./hooks/useStats";
  ```

---

## 3. Advanced Architectural Patterns

### A. The Feature-Scoped Provider Pattern

For global or feature-wide states (such as authentication or settings), the state logic and React context provider must live **inside the business feature** rather than at the root level.

1.  **State logic & API calls:** Encapsulate all logic in a feature hook, e.g., `useAuthProvider.ts` inside `features/auth/hooks/`.
2.  **Provider Wrapper:** Create a thin provider component inside the feature, e.g., `AuthProvider.tsx` in `features/auth/components/`.
3.  **Public API:** Export this provider from the feature's `index.tsx`.
4.  **Composition:** Nest the provider inside the root `AppProviders` (`src/providers.tsx`).

This pattern avoids routing feature-internal API dependencies (like `authApi`) into root-level files, maintaining a clean dependency graph.

### B. React 19 Best Practices

This template is built on **React 19** and mandates modern APIs over legacy patterns:

- **Context Consumption:** Use the React 19 `use()` API instead of the legacy `useContext()` hook.

  ```tsx
  // ✅ YES
  const context = use(AuthContext);

  // ❌ NO
  const context = useContext(AuthContext);
  ```

- **Form States & Transitions:** Manage asynchronous submissions and pending indicators using `useActionState` and form actions.
  ```tsx
  // ✅ YES: Handles loading indicators and errors natively via action transitions
  const [error, formAction, isPending] = useActionState(async (prev, formData) => { ... });
  return <form action={formAction}>...</form>
  ```
- **Ref Forwarding:** Ref is passed as a regular prop in React 19. Do not wrap components in the legacy `forwardRef` high-order component.
  ```tsx
  // ✅ YES
  export function Input({ ref, ...props }: InputProps & { ref?: Ref<HTMLInputElement> }) {
    return <input ref={ref} {...props} />;
  }
  ```

### C. Accessibility (A11y) Baselines

Shared form elements and widgets must be screen-reader friendly and fully accessible:

- **Unique IDs:** Always generate unique element IDs using React 19's `useId()` hook to associate labels with inputs and avoid name collisions.
- **ARIA Validation States:** Input controls must dynamically bind error states:
  - Set `aria-invalid={true}` when validation fails.
  - Set `aria-describedby={errorId}` linking to the validation message container.
- **Alert Roles:** Error elements should contain `role="alert"` or `role="status"` to read failures immediately to assistive technology.

### D. Routing Configuration Strategies

This repository template supports three distinct routing architectures to match different project scales. The active routing configuration is defined under the `"routing"` property in `ai-settings.json`.

Developers and AI agents can seamlessly switch strategies using the routing config CLI:

```bash
# Interactively switch routing strategy or select a specific one
npm run config:routing
# OR
python3 scripts/select-routing.py [explicit | vite-plugin-pages | framework]
```

The script will safely back up config files, swap dependencies, and configure files for the active strategy.

#### 1. `"explicit"` (Default React Router Setup)

- **Concept:** Explicit, manual route declaration. Offers maximum control and clarity.
- **New Page Registration:**
  1.  Create your page folder under `src/pages/<PageName>/index.tsx` exporting the page component (both named and default).
  2.  Import the page component in `src/router.tsx` using a named import.
  3.  Register the path under the appropriate layout or route guard structure.

#### 2. `"vite-plugin-pages"` (File-System Scanning Router)

- **Concept:** Automatic page route generation based on directory layout inside `src/pages/` using a Vite scan plugin.
- **New Page Registration:**
  1.  Create a folder under `src/pages/<PageName>/index.tsx`. The page route is generated automatically.
  2.  If the page needs authentication or custom wrapper guards, configure the matching route path conditions inside `src/router.tsx`.

#### 3. `"framework"` (Native React Router v7 Framework)

- **Concept:** Full-stack SPA routing config. Utilizes native React Router v7 compilation for optimal code-splitting.
- **New Page Registration:**
  1.  Create your page folder and component under `src/pages/<PageName>/index.tsx`. The component **must** use `export default`.
  2.  Register the route mapping and compile paths inside `src/routes.ts`.

---

## 4. The Feature Index Pattern (Compound Component)

A feature folder must strictly export its main view component directly from its `index.tsx` as a **Compound Component**.

The `index.tsx` is responsible for:

- Calling feature-local hooks (fetching data, managing loading/error states).
- Assembling private sub-components.
- Presenting a clean component interface to pages.

```tsx
// Example: src/features/dashboard-stats/index.tsx
import { StatsCard } from "./components/StatsCard";
import { useStats } from "./hooks/useStats";

export function StatsSection() {
  const { stats, isLoading, error } = useStats();

  if (isLoading) return <div className="page-loading">Loading stats…</div>;
  if (error)
    return (
      <div className="page-error" role="alert">
        {error}
      </div>
    );

  return (
    <section className="stats-grid">
      <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} change={12} />
      {/* ... */}
    </section>
  );
}

export default StatsSection;
```

---

## 5. Naming Conventions

| Type               | Pattern            | Example               |
| :----------------- | :----------------- | :-------------------- |
| **Feature Folder** | kebab-case         | `dashboard-stats/`    |
| **Component**      | Folder + index.tsx | `StatsCard/index.tsx` |
| **Page**           | Folder + index.tsx | `dashboard/index.tsx` |

| **Hook File** | `use` + camelCase | `useStats.ts` |
| **API File** | camelCase + `Api` | `statsApi.ts` |
| **Type File** | kebab-case + `.types.ts` | `auth.types.ts` |
| **Constants** | `index.ts` in `constants/` | `constants/index.ts` |
| **Utils** | camelCase | `cn.ts` |

---

## 6. Generator CLI Scripts

To enforce structure and naming standards, automate file creation using these scripts:

```bash
# 1. Generate a new feature (creates api, hooks, types, utils folders, and index.tsx)
python3 .agents/skills/react-titan-architecture/scripts/generate-feature.py <feature-name>

# 2. Generate a component in any directory
python3 .agents/skills/react-titan-architecture/scripts/generate-component.py <ComponentName> <TargetDirectory> [--scss]
```
