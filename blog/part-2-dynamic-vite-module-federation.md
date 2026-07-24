# The Micro Frontend Dilemma (Part 2): Going Dynamic with Vite + Module Federation

*Welcome to Part 2 of our Micro Frontend series. In Part 1, we modularized our codebase at build-time using an Nx Monorepo. But what happens when synchronized deployments block your engineering velocity? Today, we transition to dynamic runtime composition using Vite and Module Federation, and analyze the configuration traps you must avoid.*

---

## 🚂 The Bottleneck of Sprint 15: The Release Train Stalls

It was Tuesday at 1:45 PM. The product manager for the Accounts Team was pacing back and forth. 

"We need this dashboard update live by 2:00 PM!" she insisted. "The marketing team has launched an email campaign pointing users to the new transaction features!"

The developer on the Accounts Team pulled up the CI/CD dashboard. The build pipeline was red. 

"I can't deploy," the developer sighed. "Someone on the Transfers Team pushed a breaking change to their transaction history component. Since we build all our packages together into a single monolith bundle, their broken code blocks our release. The whole 'Release Train' is stuck at the station."

This is the classic organizational bottleneck. As a company scales, teams become blocked by each other's release schedules. The Accounts Team, the Transfers Team, and the Cards Team should all be able to ship code to production independently. 

To solve this, we must shift the integration point from **build-time** (on our compile server) to **runtime** (directly on the user's browser). 

Let's look at how to achieve this using **Module Federation**.

---

## 🚫 Common Runtime & Architectural Anti-Patterns

When teams move to Module Federation, they often make mistakes that turn their system into a fragile, distributed monolith. Based on [micro-frontend.md](../docs/micro-frontend.md), here are the four major traps to avoid:

### 1. Component-Level Federation (The Micro-Component Trap)
*   **The Anti-Pattern**: Creating a remote MFE for small UI components (e.g. `Header`, `Button`, or `Table`).
*   **The Consequence**: Generates massive network overhead, duplicate resource fetching, complex loading spinners, and layout shifts.
*   **The Resolve**: Enforce **Route-Level Boundaries**. Federate only at the page or major feature domain level. The Shell should own the layout structure, while the remote owns the pages within its namespace:
    *   `/accounts/*` $\rightarrow$ Accounts MFE
    *   `/transfers/*` $\rightarrow$ Transfers MFE

### 2. Remotes Importing Remotes (The Direct Coupling Trap)
*   **The Anti-Pattern**: Remote A imports a component directly from Remote B's build bundle.
*   **The Consequence**: Couples their deployment order. If Remote B changes its signature, Remote A crashes at runtime.
*   **The Resolve**: Communication between remotes must go through the Shell using props/context, URLs, or typed Custom Events. Remotes must never import each other directly.

### 3. "Framework Anarchy" (The Multi-Framework Trap)
*   **The Anti-Pattern**: Letting Team A use Angular, Team B use React, and Team C use Vue just because "MFEs support multiple frameworks."
*   **The Consequence**: Users download three heavy framework runtimes. Performance metrics (Core Web Vitals) drop, and sharing code between teams becomes impossible.
*   **The Resolve**: Limit your stack. Multi-framework setups make sense *only* during a temporary legacy migration (using the Strangler Pattern), not as a permanent state.

### 4. Over-Sharing Dependencies
*   **The Anti-Pattern**: Placing almost all package dependencies (like `lodash`, `date-fns`, `axios`) into the `shared` module federation config.
*   **The Consequence**: Ruins tree-shaking, increases the bundle footprint, and creates version coupling.
*   **The Resolve**: Only share libraries that **must** run as a single instance (singletons like `react`, `react-dom`, and global event emitters). Let each remote bundle its own utility packages.

---

## 🛠️ Cấu hình Thực chiến (Nx 23 + Vite Setup)

Nx 23 has changed the terminology from `host/remote` to **`consumer/provider`**. (Note: the old `host` and `remote` generators are deprecated in Nx 23 and will be removed in Nx 24).

To generate a consumer and provider using Vite:
```bash
# Generate the shell consumer
nx g @nx/react:consumer apps/shell --bundler=vite --providerNames=accounts,transfers

# Generate a provider remote
nx g @nx/react:provider apps/accounts --bundler=vite --consumer=shell
```

Let's look at the production configurations based on [acme-platform](../acme-platform).

### 1. The Provider (Remote) Configuration
The remote must run on a strict port, enable CORS, and set its origin for asset paths.

```typescript
// apps/accounts/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const PORT = 5101;

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true, // ⚠️ Prevent Vite from falling back to random ports
    origin: `http://localhost:${PORT}`, // ⚠️ Crucial: prepends remote domain to image/CSS paths
    cors: true, // ⚠️ Crucial: allows Host to download chunks across origins
    host: '127.0.0.1',
  },
  preview: { port: PORT, strictPort: true, cors: true },
  plugins: [
    federation({
      name: 'accounts',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx', // Expose entry component
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

### 2. The Consumer (Host/Shell) Configuration
The Shell acts as the orchestrator and coordinates shared dependencies. We do not hardcode remotes here:

```typescript
// apps/shell/vite.config.ts
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

---

## The Hook for Part 3: The Fragility of Localhost

If you run both `shell` on port 5100 and `accounts` on port 5101 in your local terminal right now, everything works beautifully. The browser pulls the remote file, and you get independent execution.

But local development is a dream world. 

What happens on production at 3:00 AM when the network drops? What happens if the server hosting the Accounts remote crashes?

In a traditional monolith, if a server crashes, the user receives a 500 error page. In a Micro Frontend setup, if you haven't designed for runtime resilience, a single remote server crash will crash your entire application, leaving users looking at a blank white screen.

*How do we build a resilient, production-grade Shell that survives network failures, shares state safely, and supports zero-downtime rollbacks? Read **Part 3: Resilient Discovery, Error Boundaries, and 5-Second Rollbacks**.*
