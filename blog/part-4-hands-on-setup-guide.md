# The Micro Frontend Dilemma (Part 4): The Complete Hands-On Setup Guide

*You've read the theory, you understand the architecture, and you know the pitfalls. Now, let's roll up our sleeves and build it. In this final part of our series, we write the complete blueprint: how to build a resilient Nx Monorepo + Module Federation system from a completely blank folder in 15 minutes.*

---

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:
*   **Node.js**: Version 20+ (Vite 8 and Nx 23 require modern Node runtimes)
*   **Package Manager**: `pnpm` (recommended for faster workspace linking and caching)

---

## 🚀 Step 1: Create the Workspace Foundation

We will initialize an empty Nx workspace using the minimal `empty` template to maintain complete control over our package structures.

Open your terminal and run:

```bash
# 1. Initialize an empty workspace
npx create-nx-workspace@latest acme-platform --template=empty --packageManager=pnpm
cd acme-platform

# 2. Add the official React, ESLint, and Playwright plugins
pnpm add -D @nx/react @nx/eslint-plugin @nx/playwright
```

Now, let's configure the root configurations to support **Package Manager Workspaces** and compile-free local imports.

### 1. Root [package.json](../acme-platform/package.json)
Configure the `workspaces` field so the package manager symlinks our shared libraries into `node_modules` automatically:

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

### 2. Root [tsconfig.base.json](../acme-platform/tsconfig.base.json)
We configure **`customConditions`** so that the TypeScript compiler loads the raw source code of our shared libraries during development instead of requiring a separate compile step:

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

---

## 📦 Step 2: Create the Shared Package (Zero-Compilation UI)

We will build a shared design system package at `packages/platform/ui` that both the Shell and our Remotes can import directly.

### 1. Configure the package manifest
Create `packages/platform/ui/package.json` with **Conditional Exports**:

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
      "@acme-platform/source": "./src/index.ts", // 💡 Loaded during dev (direct source imports!)
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",                // 💡 Loaded in production builds
      "default": "./dist/index.js"
    }
  },
  "nx": {
    "tags": ["scope:platform", "type:ui"]
  }
}
```

### 2. Add source code
Create `packages/platform/ui/src/lib/ui.tsx`:
```tsx
export function Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
    >
      {children}
    </button>
  );
}
```

Expose the component in `packages/platform/ui/src/index.ts`:
```typescript
export { Button } from './lib/ui';
```

---

## 🖥️ Step 3: Create the Shell Host (Vite + Module Federation)

The Shell (`apps/shell`) orchestrates routing and mounts remotes dynamically.

### 1. Vite Configuration
Create `apps/shell/vite.config.ts` specifying shared runtime singletons and custom conditions resolution:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const PORT = 5100;

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: { port: PORT, strictPort: true },
  resolve: {
    conditions: ['@acme-platform/source', 'import', 'module', 'browser', 'default']
  },
  plugins: [
    federation({
      name: 'shell',
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
    react(),
  ],
});
```

### 2. Setup the Dynamic Registry (`apps/shell/src/mf.ts`)
Register remotes dynamically at runtime to support hot-swapping URLs on production:

```typescript
import { registerRemotes, loadRemote } from '@module-federation/runtime';
import { lazy } from 'react';

const PROVIDERS = [
  {
    name: 'accounts',
    alias: 'accounts',
    entry: 'http://localhost:5101/remoteEntry.js',
    type: 'module',
  }
];

registerRemotes(PROVIDERS);

export function lazyProvider<Props = unknown>(alias: string, exposeName: string) {
  return lazy(async () => {
    const mod = await loadRemote<{ default: React.ComponentType<Props> }>(
      `${alias}/${exposeName}`
    );
    return { default: mod.default };
  });
}
```

### 3. Handle Rendering and Failures (`apps/shell/src/App.tsx`)
Bọc remote component inside a class-based error boundary so a remote crash doesn't unmount the shell:

```tsx
import React, { Component, Suspense, type ReactNode } from 'react';
import { lazyProvider } from './mf';
import { Button } from '@acme-platform/ui'; // 💡 direct shared import!

class ProviderBoundary extends Component<
  { children: ReactNode; name: string },
  { error: Error | null }
> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }

  override render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '15px', border: '1px solid red', backgroundColor: '#fff5f5' }}>
          <h3>Feature "{this.props.name}" unavailable</h3>
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

const ProviderAccounts = lazyProvider('accounts', 'App');

export function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Shell Dashboard</h1>
      <Button onClick={() => alert('Clicked Shell Button!')}>Shared Button</Button>
      <hr />
      <ProviderBoundary name="Accounts">
        <ProviderAccounts />
      </ProviderBoundary>
    </div>
  );
}

export default App;
```

---

## ⚡ Step 4: Create the Remote Provider (e.g. `accounts`)

The Remote MFE (`apps/accounts`) exposes its internal dashboard component.

### 1. Vite Configuration
Create `apps/accounts/vite.config.ts` specifying the port, CORS, and exposed asset origin:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const PORT = 5101;

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true,
    origin: `http://localhost:${PORT}`, // Fixes remote asset loading URL
    cors: true,                         // Allows Host to download code
    host: '127.0.0.1',
  },
  preview: { port: PORT, strictPort: true, cors: true },
  resolve: {
    conditions: ['@acme-platform/source', 'import', 'module', 'browser', 'default']
  },
  plugins: [
    federation({
      name: 'accounts',
      filename: 'remoteEntry.js',
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

### 2. Add Remote App Code (`apps/accounts/src/App.tsx`)
```tsx
import { Button } from '@acme-platform/ui'; // 💡 imports the same shared design library!

export function App() {
  return (
    <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Accounts Module (Remote MFE)</h2>
      <p>Managing transaction accounts and users.</p>
      <Button onClick={() => alert('Accounts remote action!')}>Remote Action</Button>
    </div>
  );
}

export default App;
```

---

## 🏃 Step 5: Verification — Running the System

Let's test both our happy-path integration and our resilience setup.

1.  **Start the Remote**:
    Run `vite` inside `apps/accounts`. It serves on `http://localhost:5101`.
2.  **Start the Shell**:
    Run `vite` inside `apps/shell`. It serves on `http://localhost:5100`.
3.  **Open Browser**:
    Navigate to `http://localhost:5100`. You will see the Shell dashboard rendering the shared UI Button, and the Accounts remote mounted cleanly beneath it.
4.  **Resilience Test**:
    Stop the Accounts remote process in your terminal. F5 refresh the browser at `http://localhost:5100`. 
    *   **The Result**: The Shell Dashboard and the Shared UI button remain fully interactive, while the Accounts slot gracefully renders the fallback *"Feature Accounts unavailable"* card.

You have successfully built a production-grade, highly resilient Micro Frontend application.
