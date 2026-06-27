---
name: react-titan-architecture
description: Enforce React of Titan architecture (shared -> features -> pages -> app) and naming conventions. Activate this skill whenever the user asks to create or refactor React components, hooks, api, or structures.
---

# React of Titan Architecture Skill

This skill enforces the architecture and design guidelines of the Titan React codebase.

## 1. Dependency Flow Rules

Ensure all file imports respect the one-way dependency flow:
shared -> features -> pages -> app/router

- **shared/**: React primitive UI elements, base utils, base clients. CANNOT import from features/pages/app.
- **features/<feature-name>/**: Domain-specific files. CANNOT import from pages/app or other sibling features. Must only import from shared/ and feature-local files (using relative imports).
  - Internal structure:
    - `index.ts(x)`: Public API (Compound Component export).
    - `components/`: UI components (private).
    - `hooks/`: State & logic (private).
    - `api/`: API requests (private).
    - `types/`: Types (private).
    - `utils/`: Utilities (private).
- **pages/**: Route views. Composes features. Can import from shared/ and features/. Can NOT import from app/. Must only import feature components through the feature's `index` file. Pages are created inside `src/pages/` (for explicit and vite-plugin-pages routing strategies, or under framework-specified directories for the framework routing strategy). All page components must export both named and default exports to maintain cross-strategy compatibility. See Section 4 (Routing Strategy Guidelines) for more details.
- **app/**: Global setup (router, global providers). Can import from any layer. In explicit routing strategy, pages must be manually registered in `src/app/router.tsx`. In vite-plugin-pages strategy, layouts are mapped programmatically inside `src/app/router.tsx`. In framework strategy, pages are registered in `src/routes.ts` instead.

## 2. Naming Conventions

- Feature folders: kebab-case (e.g. `dashboard-stats`)
- Component files: PascalCase (e.g. `StatsCard.tsx`)
- Hook files: `use` + camelCase (e.g. `useStats.ts`)
- API files: camelCase + `Api` (e.g. `statsApi.ts`)
- Type files: kebab-case + `.types.ts` (e.g. `stats.types.ts`)
- Constants: `index.ts` inside `constants/` folder
- Utils: camelCase (e.g. `formatStats.ts`)

## 3. Shared Component Separation

- `shared/components/ui/`: Contains atomic, presentation-only primitives of the Design System (e.g. `Button.tsx`, `Input.tsx`, `Spinner.tsx`). They must not have business logic or complex state.
- `shared/components/` (outside `ui/`): Contains technical, business-agnostic helper components (e.g. `ErrorBoundary.tsx`, `FileUploader.tsx`, `Form.tsx`, `FormField.tsx`).

## 4. Routing Strategy Guidelines

AI agents must first read `ai-settings.json` at the project root to detect the active `"routing"` strategy (`"explicit"`, `"vite-plugin-pages"`, or `"framework"`). AI agents should adapt their code generation and routing configurations for each strategy as follows:

- **For `"explicit"`**: Manually register new pages in `src/app/router.tsx` using named component imports.
- **For `"vite-plugin-pages"`**: Create pages in `src/pages/` (they will be auto-scanned). Layout routing is programmatically mapped inside `src/app/router.tsx` (new pages might need to be added to the auth/main path lists if they don't match the existing regex patterns).
- **For `"framework"`**: Register pages in `src/routes.ts` and ensure all pages and layouts export their main components as default exports.

To maintain cross-strategy compatibility, all components (pages and layouts) should export both **named** and **default** exports.
