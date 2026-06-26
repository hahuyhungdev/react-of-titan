# 🧪 Testing

> Testing infrastructure is planned but not yet implemented. This document outlines the strategy.

## Testing Pyramid

1. **Integration tests** (primary) — test feature workflows
2. **Unit tests** — test shared utilities and complex logic
3. **E2E tests** — test critical user journeys

## Planned Tools

| Tool                  | Purpose                         |
| --------------------- | ------------------------------- |
| Vitest                | Test runner (fast, Vite-native) |
| React Testing Library | Component testing               |
| Playwright            | E2E testing                     |

## What to Test

### Unit Tests (shared/utils, shared/hooks)

```tsx
import { cn } from "@/shared/utils/cn";

test("merges class names", () => {
  expect(cn("btn", "btn-primary")).toBe("btn btn-primary");
  expect(cn("btn", false && "hidden", null)).toBe("btn");
});
```

### Integration Tests (features)

Test the compound component with its hook:

```tsx
import { render, screen } from "@testing-library/react";
import { StatsSection } from "@/features/dashboard-stats";

test("renders stats after loading", async () => {
  render(<StatsSection />);
  expect(screen.getByText("Loading…")).toBeInTheDocument();
  expect(await screen.findByText("Total Users")).toBeInTheDocument();
});
```

### E2E Tests (critical flows)

Test user journeys: login → dashboard → settings.

## Test File Placement

- Unit tests: next to the file they test (`cn.test.ts` next to `cn.ts`)
- Integration tests: inside the feature's `__tests__/` folder
- E2E tests: top-level `e2e/` folder

## AI Assistance

The [tdd-guide](https://github.com/hahuyhungdev/ai-coding-config) agent helps write tests first (RED → GREEN → REFACTOR). The [e2e-runner](https://github.com/hahuyhungdev/ai-coding-config) agent assists with Playwright test setup and execution.
