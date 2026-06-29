# 🧱 Components and Styling

## Component Patterns

### Compound Components

Each feature exports a **compound component** that composes internal pieces. The page renders one component; the feature handles the rest.

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

### Shared UI Components

Primitive, reusable components live in `shared/components/ui/`:

- `Button` — variants (primary, secondary, ghost), sizes (sm, md, lg)
- `Input` — with label and error display
- `Spinner` — loading indicator

These are used across multiple features — that's why they're in shared.

### Internal Components

Feature-specific components stay inside the feature's `components/` folder. They're private — only the feature's compound component uses them.

## Styling

### CSS Custom Properties

Design tokens are defined in `styles/tokens.css`:

```css
:root {
  --color-surface: oklch(98% 0.005 260);
  --color-primary: oklch(55% 0.22 260);
  --space-md: 1rem;
  --text-base: 1rem;
  --radius-md: 0.5rem;
  --duration-fast: 150ms;
}
```

All components reference these variables instead of hardcoding values.

### Global Styles

- `styles/tokens.css` — design tokens (colors, spacing, typography, motion)
- `styles/typography.css` — font imports, type scale
- `styles/global.css` — reset, base element styles, layout classes, component styles

### Styling Approach

Design tokens and app-level layout classes live in global CSS. Reusable and feature-level components use SCSS Modules (`styles.module.scss`) to keep component styles scoped.

When using AI coding tools, follow `AGENTS.md` and the React of Titan skill so components stay accessible, token-driven, and consistent with the local styling approach.
