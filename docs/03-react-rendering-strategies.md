# ⚛️ Lesson 3: React Rendering Strategies (CSR, SSR, SSG, RSC)

This lesson explores how React code is executed, compiled, and sent to the browser across different rendering paradigms. You will learn the performance trade-offs, SEO impact, and architectural differences of CSR, SSR, SSG, ISR, and React Server Components (RSC).

---

## 🗺️ Table of Contents
*   [Section 1: The Evolution of Web Rendering Strategies](#section-1-the-evolution-of-web-rendering-strategies)
*   [Section 2: Client-Side Rendering (CSR / SPA)](#section-2-client-side-rendering-csr--spa)
*   [Section 3: Server-Side Rendering (SSR)](#section-3-server-side-rendering-ssr)
*   [Section 4: Static Site Generation (SSG) & ISR](#section-4-static-site-generation-ssg--isr)
*   [Section 5: React Server Components (RSC)](#section-5-react-server-components-rsc)
*   [Section 6: Patterns in the Real World](#section-6-patterns-in-the-real-world)

---

## Section 1: The Evolution of Web Rendering Strategies

The web rendering timeline represents a cycle of balancing work between the server and client:

```
[Server-Rendered MVC] ──> [SPA Revolution] ──> [Static Site Generation] ──> [React Server Components]
  - Server renders HTML     - Empty HTML shell   - Build-time HTML        - Hybrid component-level
  - Full-page reloads       - Browser runs JS    - Global CDN caching     - Server & Client split
```

*   **Server MVC Era (Pre-2010)**: Server did all the work. Every click sent a request, server fetched DB, generated HTML, and browser reloaded the entire page. Interactivity was added later via jQuery.
*   **SPA Golden Age (2013-2020)**: React shifted all routing and rendering to the browser. The server became a simple JSON API. While this improved transitions, initial loads slowed down, and SEO became a major challenge.
*   **Modern Hybrid Era (2020+)**: Modern architectures combine server pre-rendering with client interactivity.

---

## Section 2: Client-Side Rendering (CSR / SPA)

In a pure Client-Side Rendered application (e.g. Vite React template), the server returns an empty HTML wrapper:

### 1. Initial Server Response HTML:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Single Page App</title>
    <link rel="stylesheet" href="/assets/style.css" />
  </head>
  <body>
    <div id="root"></div> <!-- Empty Mount Node -->
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>
```

### 2. Loading Waterfall Diagram:
```
Time (seconds)
│
├───► [0.0s] HTTP Request Sent
├───► [0.3s] HTML Shell Received (Empty page painted)
├───► [1.5s] JS Bundle Downloaded (Spinner / blank screen)
├───► [2.0s] JS Executed, React Mounts, API Fetch Begins (First Contentful Paint)
└───► [3.2s] API Response Received, UI Renders (Largest Contentful Paint)
```

---

## Section 3: Server-Side Rendering (SSR)

SSR executes React on the server during request time to populate HTML before sending it to the client.

### 1. Hydration Flow Diagram:
```
           [ SERVER ]                                [ BROWSER ]
┌──────────────────────────────┐          ┌────────────────────────────────┐
│   Fetch Data from Database   │          │  Paints HTML instantly (FCP)   │
└──────────────┬───────────────┘          └───────────────▲────────────────┘
               │                                          │ (Streams)
               ▼                                          │
┌──────────────────────────────┐          ┌───────────────┴────────────────┐
│ Render React Tree -> HTML    │ ───────► │ Downloads JS bundle in parallel│
└──────────────────────────────┘          └───────────────┬────────────────┘
                                                          │
                                                          ▼
                                          ┌────────────────────────────────┐
                                          │ React Hydrates (Attaches event │
                                          │ listeners to matching DOM nodes)│
                                          └────────────────────────────────┘
```

### 2. Common Hydration Mismatch Error
If server-rendered HTML does not match browser-rendered HTML (e.g. using `new Date()` or `window` variables during render), hydration fails, causing a visual flash and performance penalty:
```typescript
// ❌ Buggy component (causes Hydration Mismatch)
export function ClientClock() {
  // Server-side renders UTC, browser renders local time -> Match mismatch!
  const time = new Date().toLocaleTimeString();
  return <div>Current Time: {time}</div>;
}
```

---

## Section 4: Static Site Generation (SSG) & ISR

SSG renders pages into HTML files at build-time, letting you deploy static files directly to global CDNs.

### 1. Incremental Static Regeneration (ISR)
ISR lets you update static pages in the background *without* rebuilding the entire site:

```
[User Request] ──► [Is Cache Fresh?] ── YES ──► [Serve CDN HTML instantly (TTFB ~50ms)]
                      │
                      NO (Stale)
                      │
                      ├─► [Serve STALE CDN HTML immediately to user]
                      │
                      └─► [Background Process: Run Build server, fetch new DB, update CDN cache]
```

### 2. Next.js App Router ISR Code Example:
```tsx
// app/products/[id]/page.tsx
export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function ProductPage({ params }: { params: { id: string } }) {
  const res = await fetch(`https://api.example.com/products/${params.id}`);
  const product = await res.json();

  return (
    <main>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
    </main>
  );
}
```

---

## Section 5: React Server Components (RSC)

RSC splits components into Server Components (run exclusively on the server, 0KB browser JS) and Client Components (hydrate in the browser, contain interactivity).

### 1. Server vs. Client Components Capabilities:
| Capability | Server Components (Default) | Client Components (`'use client'`) |
| :--- | :--- | :--- |
| **Direct DB/FS Access** | ✅ Yes (can run prisma query) | ❌ No |
| **useState / useEffect** | ❌ No | ✅ Yes |
| **Browser APIs (window)** | ❌ No | ✅ Yes |
| **Browser JS Bundle** | 📉 0KB (Code remains on server) | 📦 Shipped & hydrated |

### 2. Server Functions (Server Actions):
Call backend functions directly from client forms with progressive enhancement:

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache';
import { db } from './db';

export async function addSubscriber(formData: FormData) {
  const email = formData.get('email') as string;
  
  // Validate and write to Database securely
  await db.subscribers.create({ data: { email } });
  
  // Clear layout cache and reload UI
  revalidatePath('/waitlist');
}
```

```tsx
// app/waitlist/page.tsx
import { addSubscriber } from '../actions';

export default function Waitlist() {
  return (
    <form action={addSubscriber}>
      <input name="email" type="email" required />
      <button type="submit">Join Waitlist</button>
    </form>
  );
}
```

---

## Section 6: Patterns in the Real World

Modern production architectures combine multiple strategies to maximize performance:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SaaS Platform                             │
├───────────────────────────────────┬────────────────────────────────────┤
│           Public Pages            │          App Shell (Auth)          │
│    - Marketing (SSG)              │    - Billing dashboard (CSR)       │
│    - Blog & Docs (ISR)            │    - Realtime team editor (CSR)    │
│    - SEO critical                 │    - Heavy client-state interactivity│
└───────────────────────────────────┴────────────────────────────────────┘
```

*   **Static Pages (Landing, Docs)**: Rendered via SSG and cached on CDN edge servers.
*   **Dynamic Client Panels (Apps, Chats)**: Structured as Client-Side Applications communicating via WebSockets or REST APIs to backend systems.
