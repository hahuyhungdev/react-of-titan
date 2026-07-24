# The Micro Frontend Dilemma (Part 3): Resilient Discovery, Error Boundaries, and 5-Second Rollbacks

*Welcome to Part 3 of our Micro Frontend series. In Part 2, we dynamically loaded remote components over the network. But local development is a dream world. Today, we confront the harsh realities of production operations: network outages, rendering crashes, shared state nightmares, and how to achieve zero-downtime rollbacks.*

---

## 🎭 The Crisis at 2:00 AM: The Cascade Crash

It was 2:00 AM. The platform monitoring alerts began firing. 

The customer service hotline was receiving dozens of calls: "Your website is broken. It's just a blank white screen."

The on-call developer checked the logs. The main application shell was running. The servers were healthy. The database was responding. 

Then he spotted the issue: the CDN serving the `transfers` remote was down. Because the Host Shell was importing `transfers` statically, the browser failed to fetch `transfers/remoteEntry.js`. The network rejection bubbled up unchecked, crashing the entire React render cycle. 

A single failure in one minor remote feature had dragged down the entire platform. This is the **Cascade Crash**. 

Micro Frontends are distributed systems. If you treat them like a traditional monolith and assume all code is always available, your system will fail. You must design for runtime resilience.

---

## 🚫 Common Production Anti-Patterns

When moving Module Federation to production, engineering teams frequently make four architectural mistakes:

### 1. The Shared Redux Store (The State Coupling Trap)
*   **The Anti-Pattern**: Creating a single global Redux store that stretches across both the Shell and all Remotes.
*   **The Consequence**: Remotes become dependent on each other's internal state structures. An action type rename in one remote silently breaks selectors in another remote. You have rebuilt the monolith, but over the network.

### 2. Hardcoded Production URLs
*   **The Anti-Pattern**: Baking production remote URLs into your Host's build configuration:
    ```typescript
    remotes: {
      accounts: 'https://prod-accounts.example.com/remoteEntry.js'
    }
    ```
*   **The Consequence**: If you change the remote URL, or deploy a versioned build to a different path, you must rebuild and redeploy the Host Shell.

### 3. Missing Boundaries
*   **The Anti-Pattern**: Rendering a remote component directly inside your application tree without safety wrappers.
*   **The Consequence**: If the remote fails to load or throws an unhandled rendering error, the entire application crashes and unmounts.

### 4. Broadcasting Tokens via Event Bus
*   **The Anti-Pattern**: Exposing user authorization tokens by broadcasting them on a global custom event bus for all remotes to read.
*   **The Consequence**: Vulnerable to XSS. An XSS vulnerability in one remote can capture the tokens and compromise the entire application session.

---

## 🛠️ The Resolution: Building a Resilient Platform

Let's look at the production-grade resolutions implemented in the [acme-platform](../acme-platform) model.

### 1. Isolate the Failure: The Provider Boundary
Every remote component loaded over the network is a potential point of failure. We must wrap each remote inside a **Class-based Error Boundary** combined with React **Suspense**.

> 💡 **Why Class-based?** React does not currently support functional component hooks (`useState`/`useEffect`) for catching rendering errors (`componentDidCatch` or `getDerivedStateFromError`).

Here is the implementation:

```tsx
// apps/shell/src/App.tsx
import React, { Component, Suspense, type ReactNode } from 'react';
import { lazyProvider } from './mf';

class ProviderBoundary extends Component<
  { children: ReactNode; name: string },
  { error: Error | null }
> {
  override state = { error: null as Error | null };

  // Update state so the next render will show the fallback UI.
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override render() {
    if (this.state.error) {
      // 💡 Resilient UI: The rest of the app (Header, Navigation) stays alive!
      return (
        <div role="alert" className="p-4 border border-red-500 rounded bg-red-50">
          <h3>Feature "{this.props.name}" is temporarily unavailable</h3>
          <p>We are working to resolve the issue. Please try other sections of the website.</p>
        </div>
      );
    }

    return (
      <Suspense fallback={<div className="loading-spinner">Loading {this.props.name}...</div>}>
        {this.props.children}
      </Suspense>
    );
  }
}
```

---

### 2. Resilient State Management
To prevent state coupling, we use the following hierarchy:
1.  **URL**: The single source of truth for routing, navigation, and page filter criteria.
2.  **API Cache**: Each remote maintains its own cache (e.g. TanStack Query) to store server responses.
3.  **Typed custom events**: Share small event notifications (e.g. `cart:item-added`) between remotes. Never share heavy state slices or actions.
    ```typescript
    // event-contracts/src/lib/events.ts
    export type PlatformEvents = {
      "cart:item-added": { productId: string; quantity: number };
    };
    ```

---

### 3. Dynamic Discovery & Manifest Registry
To avoid hardcoding URLs, the Host Shell fetches a JSON configuration file (manifest) when loading and registers the remotes dynamically using `@module-federation/runtime`:

```typescript
// apps/shell/src/mf.ts
import { registerRemotes, loadRemote } from '@module-federation/runtime';
import { lazy } from 'react';

// 1. Fetch this registry list dynamically in production from your backend API
const PROVIDERS = [
  {
    name: 'accounts',
    alias: 'accounts',
    entry: 'http://localhost:5101/remoteEntry.js', // CDN URL in production
    type: 'module',
  },
  {
    name: 'transfers',
    alias: 'transfers',
    entry: 'http://localhost:5102/remoteEntry.js', // CDN URL in production
    type: 'module',
  }
];

registerRemotes(PROVIDERS);

// 2. Export a clean helper that maps to React.lazy
export function lazyProvider<Props = unknown>(alias: string, exposeName: string) {
  return lazy(async () => {
    const mod = await loadRemote<{ default: React.ComponentType<Props> }>(
      `${alias}/${exposeName}`
    );
    return { default: mod.default };
  });
}
```

---

### 4. The 5-Second Rollback Deployment Strategy
With dynamic manifest registry in place, we completely decouple building code from launching code. 

Our deployment pipeline looks like this:

```
[MFE Code Change] ──► [Build Independent Remote Bundle]
                            │ 
                            ▼
                      [Deploy Static Artifacts to Versioned CDN Path]
                            │ (e.g. cdn.com/accounts/build-8f41a/)
                            ▼
                      [Run Isolation Tests (Smoke Tests)]
                            │
                            ├─► PASSED ──► [Update pointer in Registry Manifest API]
                            │
                            └─► FAILED ──► [Abort. Registry still points to old build]
```

#### The Zero-Downtime Rollback:
If the Accounts Team deploys a buggy update (`build-8f41a`) that passes test pipelines but fails on production:
1.  **Do not run a panic roll-back of Git commits.**
2.  **Do not rebuild the codebase.**
3.  **Simply update the registry API** to point the `accounts` entry back to the last stable URL (`build-2a909`).
4.  The change takes effect **instantly** (within 5 seconds) for all new browser loads.

---

## 🧪 Composed Integration Testing (The Testing Pyramid)

Because Module Federation integrates components at runtime, unit tests alone cannot catch errors. We implement the MFE Testing Pyramid:
1.  **Unit Tests (Packages)**: Fast, run inside each library using Vitest.
2.  **Contract Compatibility Tests**: Verify that API schemas and event payloads match between remotes.
3.  **Composed Playwright E2E Tests**: Run inside `apps/shell-e2e` to simulate user clicking across MFE domains (e.g. adding an item in Catalog MFE, clicking checkout, and paying in Checkout MFE).

---

## 📈 The Ultimate Decision Matrix

How do you decide which architecture is right for your project? Use this scorecard:

| Architectural Metric | Modular Monolith (Part 1) | Module Federation (Part 2 & 3) |
| :--- | :--- | :--- |
| **Release schedule** | Single release train (synchronized) | Independent (any team, any time) |
| **Developer count** | 1 to 20 developers | 30+ developers (multiple product teams) |
| **CI/CD Build time** | Medium (optimized with caching) | Super fast (individual remote builds) |
| **Runtime failure risk**| Zero (build-time safety checks) | High (requires error boundaries) |
| **Infrastructure overhead**| Low (simple static web server) | High (Requires Manifest DB, E2E tests) |

### Final Recommendation
*   **Modular Monolith**: Start here. Enforce strict package boundaries inside a single Nx workspace. 
*   **Module Federation**: Transition here only when the team's scale starts to bottleneck your deployment pipeline.
