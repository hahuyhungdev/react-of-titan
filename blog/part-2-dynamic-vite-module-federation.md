# The Micro Frontend Dilemma : Going Dynamic with Vite + Module Federation

_Welcome to Part 2 of our Micro Frontend series. In [Part 1](./part-1-modular-monolith-decoupling.md), we modularized our codebase at compile-time using an Nx Monorepo. But what happens when synchronized deployments block your engineering velocity? Today, we’re transitioning to dynamic runtime composition using Vite and Module Federation—and analyzing the configuration traps that turn dream architectures into nightmare debugging sessions._

---

## Tuesday at 1:45 PM: The Release Train Stalls

The Product Manager for Team Accounts was standing behind my desk, tapping her foot and holding a cup of cold coffee like a weapon.

"We need this new dashboard update live by 2:00 PM," she said. "Marketing just blasted an email campaign to 50,000 users pointing them to the new analytics tab."

I pulled up the CI/CD pipeline dashboard. It was bright red.

```
[CI Build Log - 13:42:11]
Error: packages/transfers/feature/src/lib/TransferForm.tsx(42,18):
Property 'maxTransferLimit' does not exist on type 'UserConfig'.
[CI Status] Build Failed. Shell deploy aborted.
```

"I can't deploy," I sighed. "Someone on Team Transfers pushed a breaking TypeScript type change to their form component. Since our modular monolith compiles all packages together into a single production bundle, their broken code blocks our release. The whole Release Train is stuck at the station."

This is the classic organizational bottleneck. As your engineering team scales past 30+ developers, teams start stepping on each other's toes. Team Accounts, Team Transfers, and Team Cards should all be able to ship value to customers whenever they want, without coordinating a massive joint release.

To achieve this independence, we must shift our integration point: instead of compiling everything together on our CI server (**build-time**), we load and compose our application components directly in the user's browser (**runtime**).

---

## Under the Hood: Build-Time vs. Runtime Integration

To understand why this is a massive shift, let’s compare how the browser loads code under both models.

### Build-Time Integration (Static Imports)

When you write:

```typescript
import { AccountsPage } from "@acme-platform/accounts";
```

Vite resolves the static import during the build and includes the Accounts code in the shell’s build graph. The output may contain multiple optimized chunks (due to route-based code-splitting), but they belong to one versioned application release. Because the shell statically includes every domain in one deployable application, the production release requires the integrated application graph to compile successfully. A broken Transfers module can therefore prevent a new shell artifact from being released.

### Runtime Integration (Dynamic Federation)

With Module Federation, the Host Shell is built _without_ the Remote code. The integration is deferred to the browser in two distinct stages:

```
Step 1: Load Provider Entry
The browser loads remoteEntry.js ──► Registers container and shares dependencies
                                             │
                                             ▼
Step 2: Request Exposed Module
The Shell requests accounts/App   ──► Browser downloads MFE-specific chunks
```

1. **Register the Entry**: The browser first loads `remoteEntry.js`, the provider’s federation entry point. It contains executable code that registers the provider container and tells the federation runtime how to locate exposed modules and their related chunks.
2. **Import the Exposed Module**: When the user navigates to the Accounts route, the Shell requests the specific exposed module (e.g. `accounts/AccountsRoutes`). The federation runtime resolves the request and downloads the individual compiled chunks of the Accounts MFE from its independent server or CDN origin.

---

## Consumer/Provider Architecture & Routing Ownership

In a federated architecture, clear routing and navigation ownership is crucial to prevent route collisions and duplicate configurations.

We recommend **Route-level Federation**, where the Shell owns the top-level orchestrator routing and layout skeleton, while each provider owns the internal routes within its namespace.

```
Shell Router (apps/shell)
├── /accounts/*   ──► AccountsRoutes (Exposed by Accounts MFE)
├── /transfers/*  ──► TransfersRoutes (Exposed by Transfers MFE)
└── *             ──► PlatformNotFound (Owned by Shell)
```

- **Shell Router**: Manages the base paths and mounts providers lazily. It also manages authentication guards and high-level layout elements (header, sidebar).
- **Provider Router**: Defines internal nested routes (e.g., `/accounts/overview`, `/accounts/settings`) using a clean wild-card catch-all on the Shell side (`/accounts/*`).
- **Platform Context**: Providers receive shared platform capabilities (like user profile metadata or navigation triggers) through props or platform SDK interfaces passed down by the Shell, rather than spawning independent authentication stores.

---

## The Public Provider Contract (Exposes API)

An exposed module in Module Federation is a **runtime public API**. Just like public endpoints or npm package entry points, you must treat exposed routes with extreme care:

- **Do not expose arbitrary folders**: Avoid exposing generic file locations like `./src/App.tsx`.
- **Use stable boundary entry points**: Create a dedicated federation folder to export routes or modules clearly. This creates a stable contract and isolates your MFE's internal folder structures.

```typescript
// Exposed contract inside Provider MFE
exposes: {
  './AccountsRoutes': './src/federation/AccountsRoutes.tsx',
}
```

---

## The Nx 23 Generator Workflow

Nx 23 introduces the **Consumer** (formerly Host) and **Provider** (formerly Remote) terminology to better reflect the service relationship of Module Federation.

To keep configurations clean and clear, we generate our apps separately. This gives us explicit control over port allocations and sibling files:

```bash
# 1. Generate the Shell Consumer app
nx g @nx/react:consumer apps/shell --bundler=vite

# 2. Generate the Accounts Provider app
nx g @nx/react:provider apps/accounts --bundler=vite --consumer=shell

# 3. Generate the Transfers Provider app
nx g @nx/react:provider apps/transfers --bundler=vite --consumer=shell
```

---

## Provider (Remote) Configuration

The provider MFE needs to run on a strict port, open up CORS so the consumer can download its chunks, and specify the source asset origin.

```typescript
// apps/accounts/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

const PORT = 5101;

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true, // ⚠️ Stop Vite from silently falling back to port 5102 if 5101 is busy!
    origin: `http://localhost:${PORT}`, // ⚠️ Prepend the domain to development asset fetches
    cors: true, // 💡 Local cross-origin development; restrict origins in production
    host: "127.0.0.1", // 💡 Local-only; use 0.0.0.0 when external/container access is needed
  },
  preview: { port: PORT, strictPort: true, cors: true },
  plugins: [
    federation({
      name: "accounts",
      filename: "remoteEntry.js",
      exposes: {
        "./AccountsRoutes": "./src/federation/AccountsRoutes.tsx", // Expose stable entry point
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
      },
    }),
    react(),
  ],
});
```

> [!IMPORTANT]
> **A Note on Production Origins**:
> During development, `server.origin` helps Vite emit absolute asset URLs associated with the provider server. Production deployments must configure the correct `base` path or runtime public path for the provider’s CDN origin. Similarly, CORS is essential for localhost ports, but in production, you might route apps behind a single CDN domain (via path rewrites), making CORS unnecessary.

---

## Consumer (Host) Runtime Registration

Nx 23's `@nx/react:consumer` generator configures the consumer using **Dynamic Discovery** at runtime. The build-time Vite plugin configuration remains simple, containing only shared dependencies:

```typescript
// apps/shell/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

const PORT = 5100;

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true,
    host: "127.0.0.1",
  },
  preview: { port: PORT, strictPort: true },
  plugins: [
    federation({
      name: "shell",
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
      },
    }),
    react(),
  ],
});
```

All providers are loaded dynamically in the application code via a generated `src/mf.ts` loader file:

```typescript
// apps/shell/src/mf.ts
import { loadRemote, registerRemotes } from "@module-federation/runtime";
import { lazy } from "react";

const PROVIDERS = [
  {
    alias: "accounts",
    name: "accounts",
    entry: "http://localhost:5101/remoteEntry.js",
    type: "module" as const,
  },
];

// Register MFE sources dynamically
registerRemotes(PROVIDERS);

// Export a dynamic import helper
export function lazyProvider<Props = unknown>(
  alias: string,
  exposeName: string,
) {
  return lazy(async () => {
    const mod = await loadRemote<{ default: React.ComponentType<Props> }>(
      `${alias}/${exposeName}`,
    );
    return { default: mod.default };
  });
}
```

---

## 🧭 Composing the Routing Code

To demonstrate how the routing and platform contexts are passed down, here is the concrete implementation in both the Consumer (Shell) and the Provider (MFE).

### 1. Consumer (Shell) Router setup

The Shell manages the core navigation wrapper, provides authentication states, and delegates the wildcard routes downward:

```tsx
// apps/shell/src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { lazyProvider } from "./mf";

// Load remote entrypoints dynamically
const AccountsRoutes = lazyProvider<{ currentUser: any }>(
  "accounts",
  "AccountsRoutes",
);

export function App() {
  // Shell manages the authentication context
  const currentUser = { id: "usr_123", name: "John Doe" };

  return (
    <BrowserRouter>
      <div style={{ display: "flex", fontFamily: "sans-serif" }}>
        <nav
          style={{
            width: "200px",
            borderRight: "1px solid #ccc",
            padding: "20px",
            minHeight: "100vh",
          }}
        >
          <h3>Nav Menu</h3>
          <Link to="/accounts">Accounts Dashboard</Link>
          <br />
          <Link to="/accounts/settings">Accounts Settings</Link>
        </nav>
        <main style={{ flex: 1, padding: "20px" }}>
          <Routes>
            {/* 💡 Capture the entire namespace path and delegate route ownership to the MFE */}
            <Route
              path="/accounts/*"
              element={<AccountsRoutes currentUser={currentUser} />}
            />
            {/* 💡 Shell owns the catch-all 404 handler for the platform */}
            <Route path="*" element={<h2>Platform Page Not Found</h2>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

### 2. Provider (Remote MFE) Router setup

The Accounts provider resolves its internal routes relative to the parent path configured in the Shell:

```tsx
// apps/accounts/src/federation/AccountsRoutes.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

interface AccountsRoutesProps {
  currentUser?: { id: string; name: string };
}

export default function AccountsRoutes({ currentUser }: AccountsRoutesProps) {
  return (
    <div>
      <p style={{ fontSize: "12px", color: "#666" }}>
        Logged in as: {currentUser?.name}
      </p>
      <Routes>
        {/* 💡 Sub-routes are resolved relative to the parent "/accounts" path */}
        <Route index element={<h3>Accounts Dashboard Overview</h3>} />
        <Route path="settings" element={<h3>Accounts Settings Panel</h3>} />
        <Route
          path="*"
          element={<h3>Sub-page not found (Accounts Domain)</h3>}
        />
      </Routes>
    </div>
  );
}
```

---

## 🛡️ Type Safety Across the Boundary

Since Module Federation integrates components at runtime, TypeScript cannot resolve `lazyProvider('accounts', 'AccountsRoutes')` out of the box.

We solve this contract gap in a monorepo by creating a shared TypeScript declaration file in the consumer shell (`apps/shell/src/types/remotes.d.ts`):

```typescript
declare module "accounts/AccountsRoutes" {
  const AccountsRoutes: React.ComponentType<{ currentUser: any }>;
  export default AccountsRoutes;
}
```

For production-grade setups, you can also leverage plugins like `@module-federation/typescript` to automatically generate and pull type definitions (`.d.ts` files) across MFEs during development.

---

## 🚫 The Four Horsemen of MFE Anti-Patterns

When teams transition to runtime composition, they often introduce architectural errors that compromise system resilience. Avoid these four common traps:

### 1. The "Micro-Component" Trap (Component-Level Federation)

- **The Trap**: Federating small, presentational components (like a `Header` or a `Button`) over the network.
- **The Pain**: Avoid federating primitives whose independent deployment value is smaller than their runtime coordination, loading, caching, and failure costs. Creating dynamic remotes for tiny buttons introduces Cumulative Layout Shift (CLS) and cascading loading states.
- **The Cure**: Use **Route-Level Boundaries**. Keep your primitive design system in a shared package (Modular Monolith) and federate only at the page or major feature domain level.

### 2. The Direct Coupling Trap (Remotes Importing Remotes)

- **The Trap**: Remote A imports code directly from Remote B's build bundle.
- **The Pain**: If Remote B changes its signature, Remote A crashes at runtime. You have successfully recreated spaghetti code, but this time with network lag.
- **The Cure**: Communication must be decoupled. Use:
  1. **Shell-mediated props**: The Shell coordinates state and passes callbacks.
  2. **URL-mediated parameters**: E.g., navigating to `/transfers?recipientId=usr_123` to share context in a bookmarkable way.
  3. **Contract-based global events**: Use global events sparingly for asynchronous notifications where direct ownership is intentionally decoupled.

Here is a strict, contract-based event emitter pattern:

```typescript
// shared/event-contracts/src/index.ts
export interface PlatformEventMap {
  "platform:open-transfer": {
    recipientId: string;
    amount: number;
  };
}

export function emitPlatformEvent<K extends keyof PlatformEventMap>(
  type: K,
  detail: PlatformEventMap[K],
) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}
```

### 3. Framework Anarchy (The Multi-Framework Trap)

- **The Trap**: Allowing each product team to write code in completely different frameworks (Angular, React, Vue).
- **The Pain**: Users download multiple framework runtimes, duplicated infrastructure libraries, and compatibility layers. Observability and shared design tokens become extremely difficult to maintain.
- **The Cure**: Limit your stack. Multi-framework setups make sense _only_ during temporary legacy migrations using the Strangler Pattern.

### 4. Over-Sharing Dependencies

- **The Trap**: Sharing every utility package (`lodash`, `date-fns`) in the Module Federation shared scope to reduce file sizes.
- **The Pain**: Version negotiation becomes complex and hard to debug. You risk runtime mismatches and version locks.
- **The Cure**: Share the minimum set of dependencies that require runtime identity or offer enough duplication savings to justify version coordination.

---

## Shared Dependency Decision Tree

Refer to this guide when deciding whether to share a dependency or bundle it locally:

| Dependency                      | Typical Strategy       | Rationale                                                        |
| :------------------------------ | :--------------------- | :--------------------------------------------------------------- |
| **React / React-DOM**           | Singleton              | Required to prevent duplicate React contexts and render crashes. |
| **Context-based Design System** | Often Singleton        | Must maintain a single theme/context instance across domains.    |
| **Router**                      | Context-Dependent      | Singleton if route sync is global; local if router is isolated.  |
| **Authentication SDK**          | Often Platform-Owned   | Session state must remain unified in the Shell.                  |
| **date-fns / lodash**           | Usually Bundle Locally | Let Vite tree-shake and bundle locally; avoids negotiation lag.  |
| **Small Pure Utilities**        | Bundle Locally         | Low overhead, safer to compile into local modules.               |

> [!WARNING]
> **Dependency Options Warning**:
> Supported shared-dependency options (such as version enforcement properties like `strictVersion`) can vary between Module Federation integrations and versions. Verify the generated configurations and installed plugin types inside `@module-federation/vite` before enabling strict version validation.

---

## The Catch: The Fragility of Localhost

If you fire up `shell` on port 5100 and `accounts` on port 5101 right now, everything works beautifully. The browser pulls the remote file, stitches the components together, and you get independent execution.

But local development is a dream world.

What happens on production at 3:00 AM when the network drops? What happens if the server hosting the Accounts MFE crashes, or a CDN edge server goes offline?

In a traditional monolith, a server crash means the user gets a 500 page. In a poorly designed Micro Frontend setup, a crash in a single remote MFE will bubble up and crash your entire application, leaving your users looking at a blank white screen.

_How do we build a resilient, production-grade Shell that survives network failures, shares state safely, and supports zero-downtime, 5-second rollbacks? Read **[Part 3: Resilient Discovery, Error Boundaries, and 5-Second Rollbacks](./part-3-production-resilience-rollbacks.md)**._
