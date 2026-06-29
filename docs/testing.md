# 🧪 Testing

Testing infrastructure is implemented with Vitest, React Testing Library, jest-dom, and MSW.

## Testing Pyramid

1. **Integration tests** (primary) — test feature workflows
2. **Unit tests** — test shared utilities and complex logic
3. **E2E tests** — test critical user journeys

## Tools

| Tool                  | Purpose                         |
| --------------------- | ------------------------------- |
| Vitest                | Test runner (fast, Vite-native) |
| React Testing Library | Component testing               |
| jest-dom              | DOM-focused assertions          |
| MSW                   | Network-level API mocking       |
| Playwright            | Optional E2E testing layer      |

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

## Commands

```bash
npm test              # Run unit/integration tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Current Examples

- `src/shared/utils/cn.test.ts` — utility unit test
- `src/shared/lib/apiClient.test.ts` — MSW-backed API client test
- `src/shared/components/ui/Input/index.test.tsx` — accessibility-focused component test
- `src/features/dashboard-stats/__tests__/StatsSection.test.tsx` — feature integration test
- `src/shared/components/routing/__tests__/ProtectedRoute.test.tsx` — route guard behavior test

## AI Assistance

When using AI assistants, ask for tests before production changes and require the full verification command set from `AGENTS.md` before finishing.
