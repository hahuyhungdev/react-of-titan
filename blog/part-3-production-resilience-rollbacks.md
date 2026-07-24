# The Micro Frontend Dilemma (Part 3): Resilient Discovery, Error Boundaries, and Fast Rollbacks

_Welcome to Part 3 of our Micro Frontend series. In [Part 2](./part-2-dynamic-vite-module-federation.md), we moved integration from build time to runtime using Vite and Module Federation. That gave teams independent deployment—but it also introduced network failures, version drift, partial outages, and a much larger runtime failure surface._

_Today, we will build a resilient Shell that can survive unavailable providers, discover deployments dynamically, protect authentication boundaries, and roll back a broken release without rebuilding the entire platform._

---

## 🎭 2:00 AM on a Wednesday: The Cascade Crash

My phone was vibrating on the nightstand so violently that it was about to crawl off the edge. The ringtone was the default iPhone “Radar” alarm—which, as every on-call engineer knows, is the universal sound of pure dread.

Our customer-support channel was exploding:

> “Users are reporting that the entire app is broken. It is just a blank white screen.”

I opened the production site and found a blank canvas. The browser console contained one angry red error:

```text
TypeError: Failed to fetch dynamically imported module:
https://cdn.acme.com/transfers/build-456/remoteEntry.js

    at loadRemote (mf.ts:42:19)
    at TransfersRoute (App.tsx:67:12)
```

The Shell servers were healthy. The APIs were healthy. The database was responding in single-digit milliseconds.

The problem was the CDN origin serving the Transfers provider.

When the user navigated to `/transfers`, the Shell attempted to load the provider entry. The request failed, the rejected lazy import reached the React tree without a local recovery boundary, and the route rendered nothing useful. In a worse composition, the error could take down the shared layout as well.

A failure in one independently deployed feature had become a platform-wide incident.

This is the **cascade-crash problem**.

Micro Frontends are a distributed system inside the browser. Providers can be unavailable, incompatible, partially deployed, cached incorrectly, or broken only for specific users. Runtime integration therefore requires the same mindset we apply to distributed back-end services:

- assume dependencies can fail;
- isolate failures locally;
- use explicit contracts;
- observe every boundary;
- make rollback a metadata operation rather than a rebuild.

---

## 🚫 Four Production Anti-Patterns

### 1. The Shared Global-State Trap

**The trap:** The Shell and every provider import the same global Redux store, Zustand store, or mutable React Context.

**The failure mode:** The Shell changes `user.firstName` to `user.name.first`. An independently deployed Accounts provider still reads the old shape and crashes at runtime.

You achieved independent deployment physically, but preserved synchronized contracts logically.

**The safer model:** Assign each kind of state to an explicit owner.

| State type                           | Preferred owner                                |
| ------------------------------------ | ---------------------------------------------- |
| Current route, filters, selected tab | URL                                            |
| Server data                          | API and provider-local query cache             |
| Authentication/session               | Shell or BFF                                   |
| Provider form state                  | Owning provider                                |
| Cross-domain command                 | Shell orchestration or typed platform contract |
| Low-frequency notification           | Typed event, used sparingly                    |

Avoid sharing mutable feature state merely because all applications run on the same page.

---

### 2. Hardcoded Production Provider URLs

**The trap:** Build provider locations directly into the Shell:

```typescript
remotes: {
  accounts: 'https://cdn.example.com/accounts/remoteEntry.js',
}
```

**The failure mode:** Changing the active Accounts build requires rebuilding and redeploying the Shell—even though the Shell code itself did not change.

**The safer model:** Resolve provider locations from runtime configuration or a deployment registry. The Shell knows the provider contract, while deployment metadata determines which immutable build currently satisfies it.

---

### 3. Missing Failure Boundaries

**The trap:** Render a lazy provider directly beneath the platform layout.

**The failure mode:** A failed network request, missing export, or render exception escapes into a large React subtree and leaves the user with an empty route—or an empty application.

**The safer model:** Every provider mount point gets its own:

- `Suspense` fallback;
- Error Boundary;
- retry/reset path;
- telemetry context;
- user-safe degraded experience.

---

### 4. Broadcasting Credentials Through JavaScript

**The trap:** Publish access tokens through Custom Events, shared stores, `localStorage`, or props so every provider can call APIs directly.

**The failure mode:** Any provider compromised by cross-site scripting can read and exfiltrate the token. Federation boundaries do not create browser security boundaries: all providers execute in the same page unless you isolate them with a stronger mechanism such as an iframe.

**The safer model:** Keep sensitive credentials outside provider JavaScript where possible:

- use secure, `httpOnly`, `SameSite` cookies;
- let a Backend-for-Frontend own the user session;
- expose narrowly scoped platform capabilities instead of raw tokens;
- apply CSP, dependency governance, and trusted deployment controls to every provider.

---

## 🏗️ The Architecture of a Resilient Shell

A resilient Shell separates four concerns:

```text
                    ┌────────────────────────┐
                    │ Runtime Deployment Map │
                    │ alias → immutable URL  │
                    └────────────┬───────────┘
                                 │
                                 ▼
┌──────────────┐       ┌──────────────────────┐       ┌────────────────────┐
│ Platform UI  │──────►│ Federation Runtime   │──────►│ Versioned Provider │
│ Router/Auth  │       │ register/load/observe│       │ CDN Artifacts      │
└──────┬───────┘       └──────────────────────┘       └────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Provider Boundary    │
│ Suspense + Error UI  │
│ Retry + Telemetry    │
└──────────────────────┘
```

The Shell owns platform continuity. Providers own domain behavior. The deployment registry selects immutable provider builds. Boundaries prevent one provider from taking down unrelated platform functions.

---

## 1. Isolate Failures with a Provider Boundary

React still requires an Error Boundary to catch render errors in descendant components. A class component remains the built-in mechanism for implementing `getDerivedStateFromError` and `componentDidCatch` directly.

A production boundary should do more than display a red box. It should:

- distinguish loading from failure;
- log the provider name and route;
- provide a retry action;
- reset when a new provider version or route is selected;
- preserve the rest of the platform.

```tsx
// apps/shell/src/federation/ProviderBoundary.tsx
import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";

interface ProviderBoundaryProps {
  children: ReactNode;
  name: string;
  resetKey: string;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ProviderBoundaryState {
  error: Error | null;
}

export class ProviderBoundary extends Component<
  ProviderBoundaryProps,
  ProviderBoundaryState
> {
  override state: ProviderBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ProviderBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  override componentDidUpdate(previousProps: ProviderBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private retry = () => {
    this.setState({ error: null });
  };

  override render() {
    if (this.state.error) {
      return (
        <section role="alert" aria-live="assertive">
          <h2>{this.props.name} is temporarily unavailable</h2>
          <p>
            The rest of the platform is still available. Retry this feature or
            continue using another section.
          </p>
          <button type="button" onClick={this.retry}>
            Try again
          </button>
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

Mount each provider beneath a dedicated boundary:

```tsx
<Route
  path="/accounts/*"
  element={
    <ProviderBoundary
      name="Accounts"
      resetKey={`${registryVersion}:accounts`}
      onError={(error, info) => {
        reportProviderError({
          provider: "accounts",
          route: window.location.pathname,
          error,
          componentStack: info.componentStack ?? undefined,
        });
      }}
    >
      <AccountsRoutes currentUser={currentUser} />
    </ProviderBoundary>
  }
/>
```

### What an Error Boundary does not catch

An Error Boundary is not a universal exception handler. It does not automatically catch every error from event handlers, arbitrary asynchronous callbacks, service workers, or unrelated network requests.

Handle those errors at their actual boundary:

```tsx
async function submitTransfer() {
  try {
    await transferApi.submit();
  } catch (error) {
    showTransferError(normalizeError(error));
  }
}
```

Use Error Boundaries for rendering and lazy-loading failures. Use ordinary `try/catch`, query error states, and platform-level rejection monitoring for other failures.

---

## 2. Discover Providers at Runtime

A deployment registry maps a logical provider alias to an immutable deployment entry.

```json
{
  "version": "2026-07-24T08:30:00Z",
  "providers": [
    {
      "name": "accounts",
      "alias": "accounts",
      "entry": "https://cdn.acme.com/accounts/build-2a909/remoteEntry.js",
      "type": "module"
    },
    {
      "name": "transfers",
      "alias": "transfers",
      "entry": "https://cdn.acme.com/transfers/build-7cd31/remoteEntry.js",
      "type": "module"
    }
  ]
}
```

The Shell fetches this metadata before rendering provider routes.

```typescript
// apps/shell/src/federation/registry.ts
import { registerRemotes } from "@module-federation/runtime";

export interface ProviderRegistration {
  name: string;
  alias: string;
  entry: string;
  type: "module" | "script";
}

interface ProviderRegistry {
  version: string;
  providers: ProviderRegistration[];
}

const FALLBACK_REGISTRY: ProviderRegistry = {
  version: "shell-fallback-1",
  providers: [
    {
      name: "accounts",
      alias: "accounts",
      entry: "https://cdn.acme.com/accounts/build-2a909/remoteEntry.js",
      type: "module",
    },
    {
      name: "transfers",
      alias: "transfers",
      entry: "https://cdn.acme.com/transfers/build-7cd31/remoteEntry.js",
      type: "module",
    },
  ],
};

const REGISTRY_TIMEOUT_MS = 3_000;

async function fetchRegistry(signal: AbortSignal): Promise<ProviderRegistry> {
  const response = await fetch("/runtime/provider-registry.json", {
    signal,
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`Registry request failed with status ${response.status}`);
  }

  const registry = (await response.json()) as ProviderRegistry;

  if (!registry.version || !Array.isArray(registry.providers)) {
    throw new Error("Provider registry has an invalid shape");
  }

  return registry;
}

export async function initializeProviders(): Promise<ProviderRegistry> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    REGISTRY_TIMEOUT_MS,
  );

  try {
    const registry = await fetchRegistry(controller.signal);
    registerRemotes(registry.providers);
    return registry;
  } catch (error) {
    console.warn(
      "Provider registry unavailable; using the last known shell fallback.",
      error,
    );

    registerRemotes(FALLBACK_REGISTRY.providers);
    return FALLBACK_REGISTRY;
  } finally {
    window.clearTimeout(timeout);
  }
}
```

Initialize the runtime before mounting the application:

```tsx
// apps/shell/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initializeProviders } from "./federation/registry";

async function bootstrap() {
  const registry = await initializeProviders();
  const root = document.getElementById("root");

  if (!root) {
    throw new Error("Root element was not found");
  }

  createRoot(root).render(
    <StrictMode>
      <App registryVersion={registry.version} />
    </StrictMode>,
  );
}

void bootstrap();
```

### Be careful with fallback registries

A compiled fallback prevents the registry service from becoming a single point of failure, but it introduces a different risk: the fallback may point to a provider that is old, incompatible, or already removed.

Treat the fallback as a **last-known compatible baseline**, not a random default:

- keep fallback artifacts available for at least the Shell support window;
- test the fallback registry during every Shell release;
- prefer immutable provider URLs;
- monitor how often the fallback path is used;
- consider storing the last valid registry in a controlled client cache when appropriate.

The registry solves discovery. It does not eliminate contract compatibility.

---

## 3. Load Providers Defensively

The loader should validate the resolved module instead of assuming every provider exports a default React component.

```typescript
// apps/shell/src/federation/lazyProvider.ts
import { loadRemote } from "@module-federation/runtime";
import { lazy, type ComponentType } from "react";

export function lazyProvider<Props>(providerModule: string) {
  return lazy(async () => {
    const loadedModule = await loadRemote<{
      default?: ComponentType<Props>;
    }>(providerModule);

    if (!loadedModule?.default) {
      throw new Error(
        `Provider module "${providerModule}" did not expose a default component.`,
      );
    }

    return {
      default: loadedModule.default,
    };
  });
}
```

This error will be caught by the nearest Provider Boundary and reported with the provider name and route.

For stricter type safety, generate a typed provider registry or expose shared contract packages with backward-compatible interfaces. Do not rely on arbitrary strings scattered throughout the Shell.

---

## 4. Deploy Immutable Artifacts and Move a Pointer

Fast rollback comes from separating **artifact publication** from **release activation**.

```text
Provider source change
        │
        ▼
Build provider bundle
        │
        ▼
Publish immutable artifacts
/accounts/build-8f41a/...
        │
        ▼
Run contract, smoke, and composed tests
        │
        ├── Failed ──► Keep current registry pointer
        │
        └── Passed ──► Promote registry pointer to build-8f41a
```

The provider deployment does not overwrite the previous release. Every build receives a unique, immutable path:

```text
/accounts/build-2a909/remoteEntry.js
/accounts/build-8f41a/remoteEntry.js
/accounts/build-c184e/remoteEntry.js
```

The registry decides which one is active.

### Rollback procedure

Suppose `build-8f41a` passes CI but produces a production-only failure:

1. Mark the build unhealthy in the release system.
2. Change the Accounts registry entry back to `build-2a909`.
3. Invalidate or revalidate only the small registry document.
4. Leave both immutable artifact trees untouched.
5. Verify recovery using synthetic checks and provider-load telemetry.

No Git revert is required for immediate mitigation. No provider rebuild is required. No Shell deployment is required.

### Is it really a five-second rollback?

The pointer update itself can complete in seconds, but user-visible recovery depends on:

- registry propagation;
- CDN behavior;
- browser caching;
- service workers;
- whether the current tab already loaded the broken provider;
- whether the application refreshes its registry during a session.

Therefore, describe this honestly as a **seconds-level control-plane rollback for new loads**, not a universal guarantee that every active browser session heals within exactly five seconds.

A practical cache policy is:

```http
# Mutable registry metadata
Cache-Control: no-cache, must-revalidate
ETag: "registry-2026-07-24T08:30:00Z"
```

```http
# Immutable hashed provider assets
Cache-Control: public, max-age=31536000, immutable
```

`no-cache` allows the registry to be stored but requires revalidation before reuse. `no-store` forbids storage entirely and is appropriate only when that stricter behavior is truly required. Use one intentional policy rather than stacking every legacy cache header without understanding the trade-off.

### Existing tabs require a strategy

A registry pointer change affects future discovery. An already-open tab may continue executing a provider it loaded earlier.

Choose an explicit policy:

- recover on the next full navigation or refresh;
- poll for registry changes and offer a “New version available” reload;
- reload automatically only for critical incidents;
- use runtime hooks to observe provider failures and switch to a known fallback when safe.

Do not silently hot-swap arbitrary React implementations inside a mounted tree unless you have designed and tested that lifecycle carefully.

---

## 5. Keep Authentication at the Platform Boundary

A provider usually needs identity information, but it rarely needs the raw credential.

Prefer a narrow platform contract:

```typescript
export interface CurrentUserSummary {
  id: string;
  displayName: string;
  permissions: readonly string[];
}

export interface AccountsRoutesProps {
  currentUser: CurrentUserSummary;
  requestSignIn: () => void;
}
```

The Shell or BFF owns session establishment. Providers receive the minimum information and capabilities necessary for their domain.

For API calls, common patterns include:

```text
Browser ── secure session cookie ──► BFF ──► domain APIs
```

or:

```text
Provider ── platform API client ──► same-origin gateway/BFF
```

Avoid passing bearer tokens into provider props, events, browser storage, or shared mutable state.

Authentication centralization does not remove the need for server-side authorization. Every API must still enforce permissions independently.

---

## 6. Observe the Federation Boundary

Without provider-specific telemetry, every failure appears as “the frontend is broken.”

Record at least:

- Shell version;
- registry version;
- provider alias;
- provider build identifier;
- entry URL;
- route;
- load duration;
- load outcome;
- fallback-registry usage;
- render failure;
- retry outcome.

Example event:

```typescript
interface ProviderLoadEvent {
  provider: string;
  registryVersion: string;
  entry: string;
  route: string;
  durationMs: number;
  status: "loaded" | "failed" | "recovered";
  errorCode?: string;
}
```

Useful service-level indicators include:

```text
Provider load success rate
Provider load p95 latency
Provider render-error rate
Fallback-registry activation rate
Rollback recovery time
Percentage of sessions on each provider build
```

A release should not be considered healthy merely because its files exist on a CDN. It is healthy when real consumers can discover, load, render, and use it successfully.

---

## 🧪 Test the Composed System

Provider unit tests cannot detect every integration failure. A provider may pass locally while failing in composition because of:

- an incorrect expose name;
- missing shared dependencies;
- router-context mismatches;
- incompatible props;
- CORS or CDN configuration;
- a broken registry entry;
- authentication assumptions;
- CSS collisions.

Use a layered testing strategy.

### Layer 1: Provider tests

Each team owns:

- unit tests;
- component tests;
- accessibility checks;
- API-contract tests;
- isolated smoke tests for exposed modules.

### Layer 2: Consumer contract tests

Before promotion, verify that the provider:

- publishes the expected entry;
- exposes the expected module names;
- satisfies shared dependency constraints;
- accepts the supported public props;
- renders inside the Shell test harness.

### Layer 3: Composed Playwright tests

Run a small number of high-value journeys across domain boundaries.

```typescript
import { expect, test } from "@playwright/test";

test("user can transfer funds and see the updated balance", async ({
  page,
}) => {
  await page.goto("/accounts");

  const balance = page.getByTestId("balance");
  await expect(balance).toBeVisible();
  const balanceBefore = Number(await balance.textContent());

  await page.getByRole("link", { name: "Transfers" }).click();
  await page.getByLabel("Recipient").fill("usr_999");
  await page.getByLabel("Amount").fill("100");

  const transferResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/transfers") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Submit transfer" }).click();
  await expect((await transferResponse).ok()).toBe(true);
  await expect(page.getByRole("status")).toContainText("Transfer complete");

  await page.getByRole("link", { name: "Accounts" }).click();
  await expect(balance).toHaveText(String(balanceBefore - 100));
});
```

Prefer accessible locators and deterministic network assertions over CSS selectors and manual sleeps.

### Layer 4: Failure-injection tests

A resilient architecture must test failure deliberately:

```typescript
test("Transfers failure does not take down the platform shell", async ({
  page,
}) => {
  await page.route("**/transfers/**/remoteEntry.js", (route) => route.abort());

  await page.goto("/transfers");

  await expect(page.getByRole("alert")).toContainText(
    "Transfers is temporarily unavailable",
  );

  await expect(page.getByRole("navigation")).toBeVisible();
  await page.getByRole("link", { name: "Accounts" }).click();
  await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
});
```

Also test:

- a registry timeout;
- an invalid JSON registry;
- a provider with a missing export;
- an incompatible shared dependency;
- a provider render exception;
- rollback from a bad build to the previous build.

---

## 📈 Architecture Scorecard

| Characteristic          | SPA                      | Modular Monolith              | Runtime MFE                                       |
| ----------------------- | ------------------------ | ----------------------------- | ------------------------------------------------- |
| Source boundaries       | Mostly internal folders  | Enforced packages             | Enforced applications/providers                   |
| Release boundary        | One application          | One application               | Multiple independently releasable units           |
| Runtime composition     | One deployed application | One deployed application      | Multiple runtime-loaded deployments               |
| Team autonomy           | Low–medium               | Medium–high                   | High                                              |
| Operational complexity  | Low                      | Medium                        | High                                              |
| Runtime failure surface | Small                    | Small                         | Larger                                            |
| Rollback unit           | Whole application        | Whole application             | Individual provider pointer                       |
| Observability needs     | Application-level        | Application and package-level | Application, registry, and provider-level         |
| Best fit                | Small product/team       | Growing product teams         | Teams that genuinely require independent releases |

---

## 🏁 Production Readiness Checklist

Before calling a federated frontend production-ready, verify that:

- every provider route has `Suspense` and an Error Boundary;
- failed providers degrade locally rather than blanking the Shell;
- the registry has timeout, validation, telemetry, and a tested fallback;
- provider artifacts are immutable and versioned;
- registry metadata has an intentional cache policy;
- rollback changes a pointer instead of rebuilding code;
- exposed modules are stable, typed public contracts;
- shared contracts evolve backward-compatibly;
- credentials are not distributed through provider JavaScript;
- provider load and render health are observable;
- composed and failure-injection tests run before promotion;
- previous provider artifacts remain available for the supported rollback window.

---

## Final Recommendation

A Micro Frontend architecture is not production-ready merely because the browser can load `remoteEntry.js`.

It becomes production-ready when:

1. provider failures are isolated;
2. discovery is dynamic but controlled;
3. contracts remain compatible across independent releases;
4. credentials remain at the platform boundary;
5. deployments use immutable artifacts;
6. rollback is a safe metadata change;
7. real composed behavior is observable and tested.

The trade-off is explicit: independent deployment replaces build-time coordination with runtime operations. Make that trade only when release autonomy is valuable enough to justify the additional failure modes and platform engineering.

_Now that the architecture, runtime composition, and resilience model are clear, it is time to build the system from a blank workspace. Continue with **[Part 4: The Complete Hands-On Setup Guide](./part-4-hands-on-setup-guide.md)**._
