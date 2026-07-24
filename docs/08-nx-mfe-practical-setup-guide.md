# ⚛️ Lesson 8: Step-by-Step Guide to Build Nx Monorepo + Module Federation (acme-platform Model)

This document provides a detailed, step-by-step guide to build a Micro Frontend (MFE) system dynamically loaded at runtime, from project initialization to full completion, using configurations standardized to match the production-ready [acme-platform](../acme-platform) model.

---

## 🗺️ Architectural Map of acme-platform

The system is designed following the **Thin Apps & Shared Packages** pattern using **Package Manager Workspaces** (it resolves imports directly via NPM/PNPM workspaces and conditional exports instead of traditional TypeScript path aliases):

```
acme-platform/
├── apps/
│   ├── shell/               # App Host (Consumer) - Integrates & orchestrates remotes
│   └── accounts/            # App Remote (Provider) - Provides account features
│
├── packages/                # Shared Libraries (Packages)
│   └── platform/
│       ├── ui/              # Shared UI components (@acme-platform/ui)
│       └── event-contracts/ # Shared event contract definitions
│
├── nx.json                  # Nx pipeline & cache configuration
├── package.json             # Root package managing the workspace
└── tsconfig.base.json       # Base TypeScript configuration
```

---

## 🚀 Step 1: Initialize Project and Install Plugins

Initialize an empty Nx workspace using the minimal `empty` template (recommended for Nx 23+) to maintain complete control over directory structure:

```bash
# Initialize workspace directory
npx create-nx-workspace@latest acme-platform --template=empty --packageManager=pnpm
cd acme-platform

# Add plugins for React, ESLint, and Playwright
npx nx add @nx/react
npx nx add @nx/eslint-plugin
npx nx add @nx/playwright
```

---

## ⚙️ Step 2: Configure Workspace Root

### 1. Root [package.json](../acme-platform/package.json) Configuration
Declare the `workspaces` field so that the package manager (NPM/PNPM/Yarn) understands the shared packages under the `packages/` directory:

```json
{
  "name": "@acme-platform/source",
  "version": "0.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "packages/platform/*",
    "packages/accounts/*",
    "packages/transfers/*"
  ],
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@module-federation/runtime": "^2.4.0"
  },
  "devDependencies": {
    "nx": "23.1.0",
    "vite": "^8.0.13",
    "@nx/react": "^23.1.0",
    "@module-federation/vite": "^1.15.5",
    "typescript": "~6.0.3"
  }
}
```

### 2. Root [tsconfig.base.json](../acme-platform/tsconfig.base.json) Configuration
Instead of using the `paths` property for TypeScript aliases, we use the **`customConditions`** property combined with package conditional exports. This setup lets the IDE jump directly to the library's source code during development (dev-time) without compiling it first:

```json
{
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "isolatedModules": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "target": "es2022",
    "customConditions": ["@acme-platform/source"],
    "types": ["node", "@nx/react/typings/cssmodule.d.ts", "@nx/react/typings/image.d.ts"]
  }
}
```

### 3. Root [nx.json](../acme-platform/nx.json) Configuration
Extend the default `npm` preset and declare plugins to let Nx automatically detect build/dev targets from Vite and Playwright configs without duplication:

```json
{
  "extends": "nx/presets/npm.json",
  "plugins": [
    {
      "plugin": "@nx/js/typescript",
      "options": {
        "typecheck": { "targetName": "typecheck" },
        "build": {
          "targetName": "build",
          "configName": "tsconfig.lib.json"
        }
      }
    },
    {
      "plugin": "@nx/vite/plugin",
      "options": {
        "buildTargetName": "vite:build",
        "serveTargetName": "vite:serve"
      }
    }
  ]
}
```

---

## 📦 Step 3: Create and Configure Shared Packages

We will create a shared UI library inside `packages/platform/ui` to serve both the Host and Remotes.

### 1. Library [package.json](../acme-platform/packages/platform/ui/package.json) Configuration:
This is the **production-grade secret** that distinguishes between dev and prod environments:
*   **In Dev**: TypeScript and Vite look for the `@acme-platform/source` condition and load directly from `./src/index.ts`.
*   **In Prod**: Build commands look for the compiled files inside `./dist/index.js`.

```json
{
  "name": "@acme-platform/ui",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@acme-platform/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "nx": {
    "tags": ["scope:platform", "type:ui"]
  }
}
```

---

## 🖥️ Step 4: Configure the Host Application (Vite + Module Federation)

The Host application (`apps/shell`) acts as the application's shell orchestrator. It loads remotes asynchronously at runtime.

### 1. Host [vite.config.ts](../acme-platform/apps/shell/vite.config.ts) Configuration:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const PORT = 5100;

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true, // ⚠️ REQUIRED: Do not switch ports if 5100 is busy
    host: '127.0.0.1',
  },
  preview: { port: PORT, strictPort: true },
  resolve: {
    // Prioritize source code loading at dev-time
    conditions: ['@acme-platform/source', 'import', 'module', 'browser', 'default']
  },
  plugins: [
    federation({
      name: 'shell',
      // Share singleton react runtimes, no static remotes configurations here
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
    react(),
  ],
});
```

### 2. Runtime Remote Discovery Setup ([mf.ts](../acme-platform/apps/shell/src/mf.ts)):
Use `@module-federation/runtime` to register and resolve remotes dynamically:

```typescript
import { lazy, type ComponentType } from 'react';
import { registerRemotes, loadRemote } from '@module-federation/runtime';

const PROVIDERS = [
  {
    alias: 'accounts',
    name: 'accounts',
    entry: 'http://localhost:5101/remoteEntry.js',
  },
  {
    alias: 'transfers',
    name: 'transfers',
    entry: 'http://localhost:5102/remoteEntry.js',
  }
];

// Initialize registry with Module Federation Runtime
registerRemotes(PROVIDERS.map((remote) => ({ ...remote, type: 'module' })));

// Helper function to lazy-load remote components dynamically
export function lazyProvider<Props = unknown>(alias: string, exposeName: string) {
  return lazy(async () => {
    const mod = await loadRemote<{ default: ComponentType<Props> }>(
      `${alias}/${exposeName}`
    );
    return { default: mod!.default };
  });
}
```

### 3. Shell App Composition and Error Handling ([App.tsx](../acme-platform/apps/shell/src/App.tsx)):
Each Remote component must be wrapped inside a `ErrorBoundary` to prevent a single remote failure (network error, exception) from crashing the entire Host UI.

```tsx
import { Component, Suspense, type ReactNode } from 'react';
import { lazyProvider } from './mf';

class ProviderBoundary extends Component<
  { children: ReactNode; name: string },
  { error: Error | null }
> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }

  override render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ padding: '10px', border: '1px solid red', margin: '10px' }}>
          <p>MFE &quot;{this.props.name}&quot; is currently unavailable: {this.state.error.message}</p>
        </div>
      );
    }
    return (
      <Suspense fallback={<p>Loading {this.props.name}...</p>}>
        {this.props.children}
      </Suspense>
    );
  }
}

// Lazy load Remote component
const ProviderAccounts = lazyProvider('accounts', 'App');

export function App() {
  return (
    <div>
      <h1>Bank Platform (Shell)</h1>
      <ProviderBoundary name="Accounts">
        <ProviderAccounts />
      </ProviderBoundary>
    </div>
  );
}
```

---

## ⚡ Step 5: Configure the Remote/Provider Application (e.g., `accounts`)

Remote applications (`apps/accounts`) run independently on their own server ports and expose modules for the Host to consume.

### 1. Remote [vite.config.ts](../acme-platform/apps/accounts/vite.config.ts) Configuration:
Remotes require **CORS** and **Origin** configurations to prevent CORS fetching errors on the Host.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const PORT = 5101; // Port dedicated to this remote

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true,
    origin: `http://localhost:${PORT}`, // ⚠️ REQUIRED: Resolves asset URLs relative to the remote server
    cors: true, // ⚠️ REQUIRED: Allows the Host to fetch remote entries across ports
  },
  preview: { port: PORT, strictPort: true, cors: true },
  resolve: {
    conditions: ['@acme-platform/source', 'import', 'module', 'browser', 'default']
  },
  plugins: [
    federation({
      name: 'accounts',
      filename: 'remoteEntry.js', // Config file loaded by the Host runtime
      exposes: {
        './App': './src/App.tsx', // Expose App component
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
    react(),
  ],
});
```

---

## 🛡️ Step 6: Enforce Architecture via ESLint Tags

To prevent teams from importing internal files cross-domain (breaking architecture rules), define project `tags` in each package/app's `project.json` and configure restrictions in the root `eslint.config.mjs`.

### 1. Configure tags for the Remote (e.g., [apps/accounts/project.json](../acme-platform/apps/accounts/project.json)):
```json
{
  "name": "accounts",
  "tags": ["scope:accounts", "type:app"]
}
```

### 2. Configure boundary constraints in `eslint.config.mjs`:
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
              sourceTag: 'scope:accounts',
              // Accounts can only import its own packages or the shared platform layer
              onlyDependOnLibsWithTags: ['scope:accounts', 'scope:platform']
            },
            {
              sourceTag: 'type:ui',
              // Dumb UI components cannot import smart feature or data-access libraries
              onlyDependOnLibsWithTags: ['type:ui', 'type:util']
            }
          ]
        }
      ]
    }
  }
];
```

---

## 📈 Production Deployment Strategy

For production, the independent deployment workflow behaves as follows:

1.  **Independent Build**: Build only the modified remote (e.g., `apps/accounts`) in your CI pipeline: `vite build` within `apps/accounts`.
2.  **Upload to Versioned CDN**: Deploy directory `dist/apps/accounts` to a CDN path mapped to a specific release/commit version (e.g., `https://cdn.example.com/accounts/build-8f41a/`).
3.  **Update Registry Manifest**: Instead of hardcoding localhost endpoints, update the remote registry manifest (a JSON file served by the shell) to point to the new URL:
    ```json
    {
      "accounts": "https://cdn.example.com/accounts/build-8f41a/remoteEntry.js"
    }
    ```
4.  **Instant Rollback**: If the release introduces a critical bug, update the manifest file to point back to the previous stable CDN build URL (e.g., `v1.2.0`). The system rolls back instantly within seconds without rebuilding code.
