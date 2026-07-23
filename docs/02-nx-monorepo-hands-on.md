# 📁 Lesson 2: Build Your First NX Workspace (Hands-on Implementation)

This lesson provides step-by-step instructions to create, configure, and orchestrate a full-stack Nx workspace with React, Node.js, and shared library boundaries.

---

## 🗺️ Table of Contents
*   [Section 1: Creating Your Workspace](#section-1-creating-your-workspace)
*   [Section 2: Adding Plugins and Your First Application](#section-2-adding-plugins-and-your-first-application)
*   [Section 3: Creating and Organizing Libraries](#section-3-creating-and-organizing-libraries)
*   [Section 4: Understanding and Running Tasks](#section-4-understanding-and-running-tasks)
*   [Section 5: The Project Graph](#section-5-the-project-graph)
*   [Section 6: Configuration Deep Dive](#section-6-configuration-deep-dive)
*   [Section 7: Caching and Performance](#section-7-caching-and-performance)
*   [Section 8: CI/CD and Next Steps](#section-8-cicd-and-next-steps)

---

## Section 1: Creating Your Workspace

To initialize an empty workspace, open your terminal and execute:
```bash
npx create-nx-workspace@latest my-org --preset=apps --packageManager=pnpm
```

### Initial Workspace Structure:
```
my-org/
├── apps/                    # Deployable application entries
├── libs/                    # Core source code modules
├── nx.json                  # Nx workspace settings
├── tsconfig.base.json       # Shared TS configuration & path aliases
├── package.json             # Root workspace dependencies
└── pnpm-workspace.yaml      # Monorepo packages config (if using pnpm)
```

---

## Section 2: Adding Plugins and Your First Application

Nx leverages plugins to support code generators and executors for React, Next.js, Hono, Node.js, Jest, etc.

### 1. Install react and node plugins:
```bash
pnpm add -D @nx/react @nx/node
```

### 2. Generate a React Application using Vite:
```bash
npx nx g @nx/react:app web-app --directory=apps/web-app --bundler=vite --style=css --routing=true
```

### 3. Generate a Node.js API server:
```bash
npx nx g @nx/node:app api-server --directory=apps/api-server --framework=express
```

### 4. Verify dev runtime:
*   Serve React: `npx nx serve web-app`
*   Serve API: `npx nx serve api-server`

---

## Section 3: Creating and Organizing Libraries

Now, we will generate structural libraries to move code out of `apps/`.

### 1. Generate a shared UI library:
```bash
npx nx g @nx/react:lib ui --directory=libs/shared/ui --bundler=vite
```
This automatically updates `tsconfig.base.json` with a path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@my-org/shared-ui": ["libs/shared/ui/src/index.ts"]
    }
  }
}
```

### 2. Generate a utility library:
```bash
npx nx g @nx/js:lib utils --directory=libs/shared/utils
```

### 3. Write and export a helper function:
```typescript
// libs/shared/utils/src/lib/format.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

// libs/shared/utils/src/index.ts
export { formatCurrency } from './lib/format';
```

---

## Section 4: Understanding and Running Tasks

Task pipelines ensure build orders are correct and cache invalidations are safe.

### 1. Configure dependOn task pipeline in `nx.json`:
```json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{options.outputPath}"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```
*   `"^build"`: Build target of all dependent libraries must run and succeed before building the parent application.
*   `"outputs"`: Tells Nx where build files land to cache them.

### 2. Running commands:
*   Run tests for all libraries: `npx nx run-many -t test`
*   Build affected apps only: `npx nx affected -t build`

---

## Section 5: The Project Graph

The graph is Nx's map of your workspace.

### 1. Open the interactive graph:
```bash
npx nx graph
```

### 2. Enforce Module Boundaries via ESLint Flat Config (`eslint.config.mjs`):
```javascript
import nxPlugin from '@nx/eslint-plugin';

export default [
  ...nxPlugin.configs['flat/base'],
  {
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          depConstraints: [
            {
              sourceTag: 'scope:client',
              onlyDependOnLibsWithTags: ['scope:client', 'scope:shared']
            },
            {
              sourceTag: 'scope:server',
              onlyDependOnLibsWithTags: ['scope:server', 'scope:shared']
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:ui', 'type:data-access', 'type:util']
            }
          ]
        }
      ]
    }
  }
];
```

---

## Section 6: Configuration Deep Dive

### 1. Global `nx.json` Configuration File:
```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/*.spec.ts",
      "!{projectRoot}/**/*.test.ts",
      "!{projectRoot}/jest.config.ts"
    ],
    "sharedGlobals": ["{workspaceRoot}/tsconfig.base.json"]
  },
  "targetDefaults": {
    "build": {
      "inputs": ["production", "^production"],
      "cache": true
    }
  }
}
```

### 2. Local project configuration (`apps/web-app/project.json`):
```json
{
  "name": "web-app",
  "projectType": "application",
  "sourceRoot": "apps/web-app/src",
  "tags": ["scope:client", "type:app"],
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "options": {
        "outputPath": "dist/apps/web-app"
      }
    }
  }
}
```

---

## Section 7: Caching and Performance

### 1. Connect to Nx Cloud for remote caching (sharing cache with teammates and CI):
```bash
npx nx connect
```

### 2. Clear local cache:
```bash
npx nx reset
```

### 3. Diagnose cache misses:
```bash
NX_VERBOSE_LOGGING=true npx nx build web-app
```

---

## Section 8: CI/CD and Next Steps

### 1. Production GitHub Actions Pipeline (`.github/workflows/ci.yml`):
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Fetch all history for affected commands

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - uses: nrwl/nx-set-shas@v4

      # Only test, lint, and build what changed
      - run: pnpm nx affected -t lint --parallel=3
      - run: pnpm nx affected -t test --parallel=3
      - run: pnpm nx affected -t build --parallel=3
```

### 2. Cheat Sheet Table:
| Lệnh / Task | Lệnh CLI |
| :--- | :--- |
| **Serve App** | `npx nx serve <app-name>` |
| **Test Lib** | `npx nx test <lib-name>` |
| **Task Graph** | `npx nx graph` |
| **Skip Cache** | `npx nx build <app> --skip-nx-cache` |
| **List plugins** | `npx nx list` |
