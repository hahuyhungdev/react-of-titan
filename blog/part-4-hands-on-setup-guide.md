# The Micro Frontend Dilemma (Part 4): The Complete Hands-On Setup Guide

_You have read the theory, defined the boundaries, and designed for failure. Now it is time to build the system. In this final part, we will create a working Nx 23 workspace with React, Vite, Module Federation, a shared UI package, runtime provider registration, route-level composition, and failure isolation._

> [!NOTE]
> This guide favors a small working system over a production platform. Part 3 covers the additional registry, observability, rollback, security, and failure-recovery controls required in production.

---

## What We Are Building

By the end of the guide, the workspace will contain:

```text
acme-platform/
├── apps/
│   ├── shell/                  # Consumer: layout, platform routing, provider loading
│   └── accounts/               # Provider: owns the /accounts route namespace
├── packages/
│   └── platform/
│       └── ui/                 # Shared compile-time design-system package
├── eslint.config.mjs
├── nx.json
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

The runtime relationship will look like this:

```text
Browser
  │
  ▼
Shell Consumer :5100
  ├── imports @acme-platform/ui at build time
  └── loads accounts/AccountsRoutes at runtime
                              │
                              ▼
                    Accounts Provider :5101
```

The important distinction is intentional:

- The shared UI package is a **compile-time dependency** inside the monorepo.
- The Accounts provider is a **runtime dependency** loaded through Module Federation.

---

## Prerequisites

Install the following before continuing:

- **Node.js 20.19+ or 22.12+**. Vite 8 requires one of these minimum versions.
- **pnpm 9+**.
- A terminal capable of running standard Node.js commands.

Verify the environment:

```bash
node --version
pnpm --version
```

> [!TIP]
> Use an active Node.js LTS release rather than relying on the oldest supported runtime.

---

## Step 1: Create the Nx Workspace

Create a minimal TypeScript Nx workspace:

```bash
npx create-nx-workspace@latest acme-platform \
  --preset=ts \
  --packageManager=pnpm \
  --interactive=false

cd acme-platform
```

Add the React, Vite, ESLint, and Playwright integrations:

```bash
pnpm nx add @nx/react
pnpm nx add @nx/vite
pnpm nx add @nx/eslint
pnpm nx add @nx/playwright
```

Using `nx add` instead of manually installing unrelated versions lets Nx install plugin versions compatible with the workspace.

Check that the workspace is healthy:

```bash
pnpm nx report
```

---

## Step 2: Generate the Consumer and Provider

Nx 23 uses the terms **consumer** and **provider** for the React Module Federation generators.

Generate the Shell consumer first:

```bash
pnpm nx g @nx/react:consumer apps/shell \
  --bundler=vite \
  --linter=eslint \
  --unitTestRunner=vitest \
  --e2eTestRunner=playwright
```

Generate the Accounts provider and attach it to the Shell:

```bash
pnpm nx g @nx/react:provider apps/accounts \
  --bundler=vite \
  --consumer=shell \
  --linter=eslint \
  --unitTestRunner=vitest
```

> [!IMPORTANT]
> Generator options can evolve between Nx releases. Run the following commands when a flag differs in your installed version:
>
> ```bash
> pnpm nx g @nx/react:consumer --help
> pnpm nx g @nx/react:provider --help
> ```

At this point, Nx has created real projects with project metadata, Vite targets, test targets, and task-graph integration. Avoid replacing this step with manual `mkdir` commands: folders alone are not Nx projects.

Inspect the generated graph:

```bash
pnpm nx graph
```

---

## Step 3: Generate the Shared UI Package

Create the platform UI library:

```bash
pnpm nx g @nx/react:library packages/platform/ui \
  --bundler=vite \
  --linter=eslint \
  --unitTestRunner=vitest \
  --tags=scope:platform,type:ui
```

The exact generated project name depends on the workspace naming rules. Confirm it with:

```bash
pnpm nx show projects
```

### Add the package manifest

Create or update `packages/platform/ui/package.json`:

```json
{
  "name": "@acme-platform/ui",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
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

The export conditions serve two different environments:

| Condition               | Purpose                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `@acme-platform/source` | Resolve raw TypeScript source during local development          |
| `types`                 | Resolve generated type declarations                             |
| `import` / `default`    | Resolve built JavaScript when the package is consumed as output |

### Configure TypeScript module resolution

Add the custom condition to `tsconfig.base.json` without deleting the settings generated by Nx:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "customConditions": ["@acme-platform/source"]
  }
}
```

This fragment is illustrative. Merge the properties into the existing `compilerOptions` object rather than replacing the whole file.

### Configure Vite module resolution

In both `apps/shell/vite.config.ts` and `apps/accounts/vite.config.ts`, add the custom condition:

```typescript
resolve: {
  conditions: ['@acme-platform/source'],
},
```

Do not replace Vite's complete default condition list manually unless you have a specific reason. Adding the custom condition is enough for the source-export use case.

### Add the shared component

Create `packages/platform/ui/src/lib/button.tsx`:

```tsx
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export type ButtonProps = PropsWithChildren<
  Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "disabled" | "type">
>;

export function Button({
  children,
  type = "button",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      {...buttonProps}
      style={{
        padding: "0.625rem 1rem",
        border: 0,
        borderRadius: "0.375rem",
        background: "#1463ff",
        color: "#fff",
        cursor: buttonProps.disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
```

Export it from `packages/platform/ui/src/index.ts`:

```typescript
export { Button, type ButtonProps } from "./lib/button";
```

Install the workspace links after adding the package manifest:

```bash
pnpm install
```

---

## Step 4: Define the Provider's Public Runtime Contract

An exposed Module Federation module is a public runtime API. Do not expose the provider's generic root `App` merely because it is convenient.

Create a stable boundary file:

```text
apps/accounts/src/federation/AccountsRoutes.tsx
```

Add the following implementation:

```tsx
import { Route, Routes } from "react-router-dom";
import { Button } from "@acme-platform/ui";

export interface PlatformUser {
  id: string;
  name: string;
}

export interface AccountsRoutesProps {
  currentUser: PlatformUser;
}

function AccountsOverview({ currentUser }: AccountsRoutesProps) {
  return (
    <section>
      <h2>Accounts overview</h2>
      <p>Welcome, {currentUser.name}.</p>
      <Button onClick={() => window.alert("Accounts action")}>
        Remote action
      </Button>
    </section>
  );
}

export default function AccountsRoutes(props: AccountsRoutesProps) {
  return (
    <Routes>
      <Route index element={<AccountsOverview {...props} />} />
      <Route path="settings" element={<h2>Accounts settings</h2>} />
      <Route path="*" element={<h2>Accounts page not found</h2>} />
    </Routes>
  );
}
```

In a larger system, place `PlatformUser` and `AccountsRoutesProps` in a small versioned contracts package rather than duplicating them between applications.

---

## Step 5: Configure the Accounts Provider

Update `apps/accounts/vite.config.ts` while preserving any Nx-generated plugins or test configuration that your workspace needs:

```typescript
import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const PORT = 5101;

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true,
    host: "127.0.0.1",
    origin: `http://localhost:${PORT}`,
    cors: true,
  },
  preview: {
    port: PORT,
    strictPort: true,
    cors: true,
  },
  resolve: {
    conditions: ["@acme-platform/source"],
  },
  plugins: [
    federation({
      name: "accounts",
      filename: "remoteEntry.js",
      exposes: {
        "./AccountsRoutes": "./src/federation/AccountsRoutes.tsx",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "^19.0.0",
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^19.0.0",
        },
        "react-router-dom": {
          singleton: true,
        },
      },
    }),
    react(),
  ],
});
```

Why share the router here? The Shell owns the `BrowserRouter`, while the provider consumes the same router context to render nested routes. Both sides must resolve a compatible runtime instance.

> [!NOTE]
> `server.origin` and permissive CORS are useful for localhost development across ports. Production deployments should use the real CDN base/public path and restrict cross-origin access appropriately.

---

## Step 6: Register Providers in the Shell

The Shell needs runtime discovery metadata before it can load exposed modules.

Create or update `apps/shell/src/mf.ts`:

```typescript
import { loadRemote, registerRemotes } from "@module-federation/runtime";
import { lazy, type ComponentType } from "react";

export interface PlatformUser {
  id: string;
  name: string;
}

export interface AccountsRoutesProps {
  currentUser: PlatformUser;
}

interface ProviderModules {
  "accounts/AccountsRoutes": ComponentType<AccountsRoutesProps>;
}

const providers = [
  {
    name: "accounts",
    alias: "accounts",
    entry: "http://localhost:5101/remoteEntry.js",
    type: "module" as const,
  },
];

registerRemotes(providers);

export function lazyProvider<K extends keyof ProviderModules>(moduleKey: K) {
  return lazy(async () => {
    const remoteModule = await loadRemote<{
      default: ProviderModules[K];
    }>(moduleKey);

    if (!remoteModule?.default) {
      throw new Error(
        `Provider module "${moduleKey}" did not expose a default component.`,
      );
    }

    return { default: remoteModule.default };
  });
}
```

The `ProviderModules` map improves the example in two ways:

- only registered provider keys can be passed to `lazyProvider`;
- each provider key carries its expected React prop contract.

For a production system, replace the hardcoded provider array with the validated runtime registry described in Part 3.

---

## Step 7: Add a Resettable Provider Boundary

A lazy provider can fail while downloading or while rendering. Wrap it in both `Suspense` and an Error Boundary so the rest of the Shell remains available.

Create `apps/shell/src/ProviderBoundary.tsx`:

```tsx
import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";

interface ProviderBoundaryProps {
  children: ReactNode;
  name: string;
  resetKey?: string | number;
}

interface ProviderBoundaryState {
  error: Error | null;
}

export class ProviderBoundary extends Component<
  ProviderBoundaryProps,
  ProviderBoundaryState
> {
  override state: ProviderBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ProviderBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Provider "${this.props.name}" failed`, { error, info });
  }

  override componentDidUpdate(previousProps: ProviderBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  override render() {
    if (this.state.error) {
      return (
        <section
          role="alert"
          style={{ padding: "1rem", border: "1px solid #c00" }}
        >
          <h2>{this.props.name} is temporarily unavailable</h2>
          <p>The rest of the platform is still available.</p>
        </section>
      );
    }

    return (
      <Suspense fallback={<p>Loading {this.props.name}…</p>}>
        {this.props.children}
      </Suspense>
    );
  }
}
```

Error Boundaries catch errors during rendering, lifecycle methods, and lazy-module resolution beneath the boundary. They do not automatically catch every asynchronous callback, event-handler exception, or server error. Handle those at their appropriate boundaries.

---

## Step 8: Compose the Shell Router

Update `apps/shell/src/App.tsx`:

```tsx
import { useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Button } from "@acme-platform/ui";
import { lazyProvider, type PlatformUser } from "./mf";
import { ProviderBoundary } from "./ProviderBoundary";

const AccountsRoutes = lazyProvider("accounts/AccountsRoutes");

const currentUser: PlatformUser = {
  id: "usr_123",
  name: "John Doe",
};

export function App() {
  const [accountsResetKey, setAccountsResetKey] = useState(0);

  return (
    <BrowserRouter>
      <div
        style={{
          fontFamily: "sans-serif",
          maxWidth: "64rem",
          margin: "0 auto",
        }}
      >
        <header style={{ padding: "1rem 0" }}>
          <h1>Acme Platform</h1>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/accounts">Accounts</Link>
            <Link to="/accounts/settings">Account settings</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route
              path="/accounts/*"
              element={
                <ProviderBoundary name="Accounts" resetKey={accountsResetKey}>
                  <AccountsRoutes currentUser={currentUser} />
                </ProviderBoundary>
              }
            />

            <Route
              path="/"
              element={
                <section>
                  <h2>Shell home</h2>
                  <Button
                    onClick={() => setAccountsResetKey((value) => value + 1)}
                  >
                    Reset Accounts boundary
                  </Button>
                </section>
              }
            />

            <Route path="*" element={<h2>Platform page not found</h2>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

The Shell owns the base route `/accounts/*`. The provider owns everything underneath that namespace.

### Bootstrap the Shell

Ensure `apps/shell/src/main.tsx` renders the application:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Unable to find the root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

---

## Step 9: Align the Shell's Shared Dependencies

Update the federation section in `apps/shell/vite.config.ts` so it uses the same shared-runtime policy as the provider:

```typescript
federation({
  name: 'shell',
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^19.0.0',
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^19.0.0',
    },
    'react-router-dom': {
      singleton: true,
    },
  },
}),
```

Also add the source condition:

```typescript
resolve: {
  conditions: ['@acme-platform/source'],
},
```

Keep the generated Nx and test plugins that are already present in the configuration.

---

## Step 10: Enforce Architectural Boundaries

The generated projects need tags before the dependency rule can enforce anything.

Assign tags to the application projects in their generated project configuration or package-level `nx.tags` metadata:

```json
{
  "nx": {
    "tags": ["scope:accounts", "type:app"]
  }
}
```

For the Shell, use platform ownership:

```json
{
  "nx": {
    "tags": ["scope:platform", "type:app"]
  }
}
```

Then merge this rule into the root `eslint.config.mjs`:

```javascript
import nxPlugin from "@nx/eslint-plugin";

export default [
  {
    plugins: {
      "@nx": nxPlugin,
    },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          allow: [],
          depConstraints: [
            {
              sourceTag: "scope:accounts",
              onlyDependOnLibsWithTags: ["scope:accounts", "scope:platform"],
            },
            {
              sourceTag: "type:ui",
              onlyDependOnLibsWithTags: ["type:ui"],
            },
          ],
        },
      ],
    },
  },
];
```

Do not overwrite Nx's generated flat-config entries blindly. Merge the rule into the existing configuration so TypeScript, React, and project-specific lint settings remain active.

Verify the rules:

```bash
pnpm nx run-many -t lint
```

---

## Step 11: Run the System

Use the project names returned by `pnpm nx show projects`.

In two terminals, run:

```bash
pnpm nx serve accounts
```

```bash
pnpm nx serve shell
```

Alternatively, start both projects together:

```bash
pnpm nx run-many -t serve -p shell accounts --parallel=2
```

Open:

```text
http://localhost:5100
```

Navigate to `/accounts`. The Shell should fetch the Accounts provider entry from port `5101`, request `accounts/AccountsRoutes`, and mount the provider inside the Shell's router and Error Boundary.

---

## Step 12: Verify the Architecture

### Test 1: Shared package HMR

Edit the button in:

```text
packages/platform/ui/src/lib/button.tsx
```

The Shell and Accounts provider should resolve the source export directly during development. Changes should appear without manually building the UI package.

### Test 2: Provider isolation

Stop the Accounts development server, then reload `/accounts`.

Expected result:

- the Shell header and navigation remain rendered;
- the Accounts boundary displays its unavailable state;
- the application does not collapse into a blank page.

Restart the provider and use the boundary reset action or reload the page.

### Test 3: Boundary enforcement

Inside an Accounts-owned project, attempt to import another business domain that is not allowed by the tag constraints.

Run:

```bash
pnpm nx run-many -t lint
```

Nx ESLint should reject the illegal dependency.

### Test 4: Production builds

Build both deployable applications:

```bash
pnpm nx run-many -t build -p shell accounts
```

The provider's output should contain its federation entry and related chunks. The Shell output should not embed the provider implementation as a normal static application import.

---

## Step 13: Add a Composed Smoke Test

Unit tests do not verify that the Shell can resolve a provider entry, negotiate shared dependencies, and mount its exposed route.

Add a Playwright smoke test to the generated Shell E2E project:

```typescript
import { expect, test } from "@playwright/test";

test("loads the Accounts provider through the Shell", async ({ page }) => {
  await page.goto("/accounts");

  await expect(
    page.getByRole("heading", { name: "Accounts overview" }),
  ).toBeVisible();

  await expect(page.getByText("Welcome, John Doe.")).toBeVisible();
});
```

Add a separate failure-injection test that prevents the provider entry from loading:

```typescript
import { expect, test } from "@playwright/test";

test("keeps the Shell alive when Accounts cannot load", async ({ page }) => {
  await page.route("**/remoteEntry.js", (route) => route.abort());
  await page.goto("/accounts");

  await expect(
    page.getByRole("heading", { name: "Acme Platform" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Accounts is temporarily unavailable",
    }),
  ).toBeVisible();
});
```

The failure test is as important as the happy-path test. A resilient architecture must prove that partial failure remains partial.

---

## Common Setup Failures

### `remoteEntry.js` returns 404

Check that:

- the Accounts provider is running on port `5101`;
- `filename` matches `remoteEntry.js`;
- the registry entry points to the correct URL;
- the plugin emits the entry at the path expected by the current version.

### Invalid hook call or missing router context

This often indicates duplicate or incompatible runtime instances. Verify that the Shell and provider share compatible versions of:

- `react`;
- `react-dom`;
- `react-router-dom` when the provider consumes the Shell router.

### Workspace package resolves to `dist` during development

Check all three layers:

1. `package.json` contains the custom export condition.
2. `tsconfig.base.json` contains `customConditions`.
3. each Vite application includes the same condition in `resolve.conditions`.

### Nx cannot serve the manually created application

A folder is not an Nx project. Generate applications and libraries through Nx or add complete project metadata and targets yourself.

### The Error Boundary never recovers

An Error Boundary retains its error state. Change its `resetKey`, remount it with a different React `key`, or expose an explicit retry action that resets the boundary before retrying the provider.

---

## What This Demo Does Not Yet Include

The system is a solid learning baseline, but production requires more:

- environment-aware provider discovery;
- validated registry manifests with timeouts and fallbacks;
- immutable versioned provider assets;
- pointer-based rollback and controlled caching;
- contract compatibility checks;
- centralized authentication or a BFF session model;
- provider-level logging, tracing, and error attribution;
- content security policy and trusted provider origins;
- release health checks and automated rollback criteria.

Those concerns are architectural features, not cleanup tasks to postpone until after launch.

---

## Final Architecture Checklist

Before calling a Micro Frontend implementation ready, verify that:

- business domains have explicit ownership;
- compile-time boundaries are enforced before runtime federation;
- the Shell owns platform layout and top-level routes;
- providers own stable route namespaces;
- exposed modules are treated as public contracts;
- shared dependencies are limited to libraries requiring runtime identity;
- every provider is wrapped in `Suspense` and an Error Boundary;
- provider failure does not unmount the platform Shell;
- provider URLs can change without rebuilding the Shell in production;
- composed tests cover both successful loading and provider failure;
- deployment and rollback happen independently for each provider.

---

## Wrapping Up the Series

Across this four-part series, we moved through the complete architectural progression:

1. **Part 1 — Modular Monolith:** Organize code by business domain and enforce compile-time boundaries.
2. **Part 2 — Runtime Federation:** Introduce independent deployment through consumer/provider composition.
3. **Part 3 — Production Resilience:** Design for network failure, runtime crashes, discovery, and rollback.
4. **Part 4 — Hands-On Setup:** Build the smallest complete version of the architecture and prove its failure isolation.

The final lesson is not that every frontend should use Module Federation.

It is this:

> Micro Frontends are an organizational tool expressed through software architecture. Adopt them when independent ownership and release autonomy justify the additional runtime and operational complexity.

Start with clear modules. Federate only real ownership boundaries. Design every remote as a dependency that can fail.
