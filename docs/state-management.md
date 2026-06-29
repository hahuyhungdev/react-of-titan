# 🗃️ State Management

## Strategy

State is categorized by scope. Don't store everything globally — keep state as close to where it's used as possible.

| Category        | Where                | Tool                     |
| --------------- | -------------------- | ------------------------ |
| Component state | Inside the component | `useState`, `useReducer` |
| Feature state   | Inside the feature   | Custom hooks             |
| Server state    | API cache            | Fetch wrapper + hooks    |
| Global state    | App-wide (rare)      | Context + hooks          |

## Component State

Use `useState` for simple, independent state. Use `useReducer` when multiple pieces of state change together on a single action.

```tsx
const [isOpen, setIsOpen] = useState(false);
```

## Feature State

Each feature manages its own state via hooks in `hooks/`. These hooks are private to the feature — only the compound component uses them.

```tsx
// features/dashboard-stats/hooks/useStats.ts
export function useStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetch and set state
  }, []);

  return { stats, isLoading, error };
}
```

## Server State

Currently using local state + fetch calls. For larger apps, consider:

- **TanStack Query** — caching, refetching, background updates
- **SWR** — stale-while-revalidate pattern

These libraries handle caching, deduplication, and background refetching automatically. The current `apiClient` can be used as the fetcher.

## Global State

For app-wide concerns (auth, theme, notifications), use React Context + hooks. Keep it minimal — most state should live in features.

```tsx
// providers.tsx — compose global providers here
```

## When to Globalize

Start with component state. Lift to parent if siblings need it. Move to feature hooks if the feature needs it. Only globalize when multiple features need the same state.

## AI Assistance

When using AI assistants, ask them to justify the state scope before introducing global state.
