# Project: React of Titan Routing Strategy Validation

## Architecture

- Target project: react-of-titan
- Goals: Test all three routing strategies (`explicit`, `vite-plugin-pages`, and `framework`) and verify TypeScript compilation, ESLint, and production build.
- Key script: `scripts/select-routing.py`
- Swapped files:
  - Routing configuration files
  - `vite.config.ts`
  - `package.json`
  - `tsconfig.json`

## Milestones

| #   | Name                           | Scope                                                                     | Dependencies | Status |
| --- | ------------------------------ | ------------------------------------------------------------------------- | ------------ | ------ |
| 1   | Exploration & Analysis         | Map routing configuration files, scripts/select-routing.py, and templates | None         | DONE   |
| 2   | Explicit Routing Verification  | Swap to explicit, install, typecheck, lint, build                         | 1            | DONE   |
| 3   | Vite-Plugin-Pages Verification | Swap to vite-plugin-pages, install, typecheck, lint, build                | 2            | DONE   |
| 4   | Framework Routing Verification | Swap to framework, install, typecheck, lint, build                        | 3            | DONE   |
| 5   | Issue Resolution               | Fix any compilation/build/lint errors found across strategies             | 2, 3, 4      | DONE   |
| 6   | Test Matrix Report             | Record results in docs/routing_strategies_test_plan.md and report success | 5            | DONE   |

## Code Layout

- `scripts/select-routing.py`: Script to select/swap routing strategy
- `scripts/templates/`: Template files for different strategies
- `src/`: Application source directory
- `docs/routing_strategies_test_plan.md`: The test matrix and documentation of the validation process
