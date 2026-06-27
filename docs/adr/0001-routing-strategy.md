# ADR-0001: Routing Strategy

**Date**: 2026-06-27
**Status**: accepted
**Deciders**: Development Team

## Context

The project requires supporting three distinct routing strategies in the React of Titan codebase:

1. **Explicit**: Explicit React Router configuration where all routes and layouts are defined manually in code.
2. **Vite-Plugin-Pages**: Automatic filesystem routing that discovers files under `src/pages/` and maps them to routes.
3. **Framework**: Full React Router v7 framework/meta-framework mode with structured, file-based routing and configuration builders (`src/routes.ts`).

Supporting these three paradigms provides developers with maximum flexibility to choose the style that fits their development preference, onboarding requirements, or production optimization targets (such as SSR in framework mode).

## Decision

To support these three strategies seamlessly and without friction, we decide to:

1. **Template-Based Swaps via Python CLI**: Implement a Python script (`scripts/select-routing.py`) that swaps the configuration templates (including `vite.config.ts`, `tsconfig.json`, `package.json` scripts/dependencies, and entry files) and removes obsolete files dynamically.
2. **Dual-Export Pattern (Named and Default Exports)**: Require all page and layout components to export their React components using both named exports (e.g., `export function DashboardPage()`) and default exports (e.g., `export default DashboardPage;`). This guarantees compatibility across both explicit imports and automatic file/filesystem scanners.
3. **Package Coexistence in devDependencies**: Maintain all dependencies for the different routing strategies (e.g., `vite-plugin-pages`, `@react-router/dev`) in the workspace configuration/package.json devDependencies block, permitting instant switching without needing to perform slow downloads or complex dynamic package installations during runtime switches.

## Alternatives Considered

### Alternative 1: Swapping package.json Completely

- **Pros**: Perfectly clean package lists for each strategy.
- **Cons**: Overwrites any other concurrent development edits, script updates, or third-party dependencies added to `package.json` by developers.
- **Why not**: Rejected because it discards non-routing-related custom edits in `package.json`.

### Alternative 2: Dynamic npm installs during strategy switches

- **Pros**: Resolves dependency isolation at runtime.
- **Cons**: Extremely slow and highly error-prone depending on the network status or npm registry availability.
- **Why not**: Rejected to ensure switches are near-instantaneous and can work offline.

### Alternative 3: Changing directory hierarchies for vite-plugin-pages

- **Pros**: Avoids route scanning overlap by placing pages under specific folders for each strategy.
- **Cons**: Breaks the unified structure rules in `AGENTS.md` and requires reorganizing folders depending on the active strategy.
- **Why not**: Rejected in favor of programmatic layout wrapping in `router.tsx` to maintain a single, consistent `src/pages/` folder hierarchy.

## Routing Strategies Comparison

| Strategy              | Pros                                                                                                                                              | Cons                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Explicit**          | - High control over route definition.<br>- Easy to trace imports and compile-time types.<br>- Simple to understand and debug.                     | - Manual configuration required for every new page.<br>- Boilerplate imports and route array entries.                            |
| **Vite-Plugin-Pages** | - Zero-config route addition; files in `src/pages/` automatically become routes.<br>- Faster prototyping.                                         | - Layout wrapping requires programmatic heuristics in `router.tsx`.<br>- Harder to custom-configure individual route parameters. |
| **Framework**         | - Full React Router v7 capabilities (loaders, actions, SSR).<br>- Clean division using structured layout routes configuration in `src/routes.ts`. | - Rigid file structures and config conventions.<br>- Overkill for simple client-only SPA builds.                                 |

## Step-by-Step Developer Transition Guide

### Strategy 1: Explicit Mode

To add a new route:

1. Create your page component file (e.g., `src/pages/HelpPage.tsx`) using both exports:
   ```tsx
   export function HelpPage() {
     return <div>Help Page</div>;
   }
   export default HelpPage;
   ```
2. Open `src/router.tsx`.
3. Import the component:
   ```tsx
   import { HelpPage } from "@/pages/HelpPage";
   ```
4. Add the route object under the correct layout children array (e.g., under `MainLayout`):
   ```tsx
   { path: "/help", element: <HelpPage /> }
   ```

### Strategy 2: Vite-Plugin-Pages Mode

To add a new route:

1. Create your page component file in the `src/pages/` directory (e.g., `src/pages/HelpPage.tsx`) using both exports:
   ```tsx
   export function HelpPage() {
     return <div>Help Page</div>;
   }
   export default HelpPage;
   ```
2. The route `/help` will be automatically generated by the file scanner.
3. Open `src/router.tsx` and ensure `/help` is listed in the layout wrapper arrays (`authPaths` or `mainPaths`) to wrap it in the correct layout. For example, add `"/help"` to `mainPaths`.

### Strategy 3: Framework Mode

To add a new route:

1. Create your page component file in the `src/pages/` directory (e.g., `src/pages/HelpPage.tsx`) using both exports:
   ```tsx
   export function HelpPage() {
     return <div>Help Page</div>;
   }
   export default HelpPage;
   ```
2. Open `src/routes.ts`.
3. Declare the route inside the appropriate layout wrapper using the route builder:
   ```typescript
   layout("layouts/MainLayout.tsx", [
     // ... other routes
     route("help", "pages/HelpPage.tsx"),
   ]);
   ```

## Consequences

### Positive

- Codebase is highly flexible; supports multiple developer preferences and deployment configurations.
- Transitioning between strategies is simplified via `scripts/select-routing.py`.
- Page files are consistent because they always export both named and default.

### Negative

- Switching configurations requires running `npm install` afterwards to align the node_modules packages.
- Additional devDependencies are kept in the package.json index.

### Risks

- Risk of mismatch in active vs expected config packages. Mitigation: the selector script explicitly alerts the developer to run `npm install` after switching.
