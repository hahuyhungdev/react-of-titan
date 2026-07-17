# Vertical Architecture — Real-World Scenarios

> From basic to complex. Each scenario covers: situation → question → decision → rationale.

---

# How to Use This Document

Whenever you find yourself questioning "where should this code go?", look up the most similar scenario below.

Quick Decision Rules:

| Question | If YES | If NO |
| --- | --- | --- |
| Is there business/domain vocabulary in the name or logic? | Belongs to a vertical | Likely shared / design-system |
| Is it used by multiple verticals? | Extract to a lower layer | Keep inside the vertical |
| Is there a two-way circular import? | Merge or redefine boundaries | Keep as is |
| Is it a pure presentational component with no domain knowledge? | design-system | vertical components |

---

# LEVEL 1 — BASIC

---

## Scenario 1: "Save" Button used in multiple places

**Situation:** You have a "Save" button in the profile form, billing form, and settings form.

**Question:** Where should it go?

**Decision:**

```txt
design-system/
└── Button/
    ├── Button.tsx
    └── index.ts
```

**Rationale:** The `Button` doesn't know what it is saving. It only accepts `onClick`, `variant`, and `children`. It contains zero business logic → belongs in `design-system`.

```tsx
// ✅ design-system: dumb, reusable
<Button variant="primary" onClick={handleSave}>
  Save
</Button>
```

---

## Scenario 2: "Refund Payment" Button

**Situation:** A button that opens a confirmation dialog, invokes a refund API, and displays a toast.

**Decision:**

```txt
billing/
└── components/
    └── RefundButton.tsx    ← wraps the Button from design-system
```

**Rationale:** It knows what "refund" means → contains business logic → belongs to the `billing/` vertical.

```tsx
// billing/components/RefundButton.tsx
import { Button } from "@/design-system";
import { useRefund } from "../hooks/useRefund";

export function RefundButton({ paymentId }: Props) {
  const refund = useRefund();
  return (
    <Button variant="danger" onClick={() => refund.mutate(paymentId)}>
      Refund
    </Button>
  );
}
```

**Pattern:** Vertical components **wrap** design-system components and inject business domain logic.

---

## Scenario 3: `formatDate()` — Where to place it?

**Situation:** You need to format dates in billing, profile, and dashboard.

**Decision:**

```txt
shared/
└── lib/
    └── date.ts    ← formatDate, isExpired, addDays
```

**Rationale:** It has no domain/business terminology. It is 100% generic. You could copy it to an entirely different project without changing anything.

**Comparison:**

```ts
formatDate(date); // ✅ shared/lib — generic
formatInvoiceDueDate(invoice); // ❌ → billing/utils — knows about "invoice"
```

---

## Scenario 4: Starting a new feature "User Profile"

**Situation:** The team needs to build a profile page: view info, edit profile, upload avatar.

**Decision:** Create a new vertical from the beginning instead of scattering code in shared folders.

```txt
profile/
├── components/
│   ├── ProfileCard.tsx
│   ├── EditProfileForm.tsx
│   └── AvatarUploader.tsx
├── hooks/
│   ├── useProfile.ts
│   └── useUpdateProfile.ts
├── api/
│   └── profile.api.ts
├── types/
│   └── profile.types.ts
└── index.ts                  ← only exports what the outside needs
```

```ts
// profile/index.ts — public API
export { ProfileCard } from "./components/ProfileCard";
export { useProfile } from "./hooks/useProfile";
// DO NOT export EditProfileForm if it is only used internally
```

**Rationale:** Moving forward, any changes to user profiles only touch this single folder. A new developer joining the team can locate profile-related code in 5 seconds.

> ⚠️ **Caveat about barrel files (updated from Bulletproof React):** `index.ts` barrel exports can break Vite's tree-shaking and slow down build/dev server performance in large projects. Current best practice:
>
> - **Boundary is a logical concept** — enforce it using **ESLint** (`import/no-restricted-paths` or `eslint-plugin-boundaries`), rather than relying solely on barrel files.
> - If using Vite: consider direct imports like `@/profile/components/ProfileCard` and use ESLint to prevent importing private folders.
> - If using a bundler that handles barrel files well (or a monorepo using `package.json` exports): barrel files are still perfectly fine.
>
> TkDodo/Sentry use exactly this approach: [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) to block deep imports into private utils.

---

# LEVEL 2 — INTERMEDIATE

---

## Scenario 5: Two verticals need the same `User` type

**Situation:** Both `profile/` and `admin/` need the `User` type and the `getFullName(user)` helper.

**INCORRECT Way:**

```ts
// ❌ admin importing from the internals of profile
import { User } from "@/profile/types/profile.types";
```

**Decision:** Extract the shared business entity to a lower layer.

```txt
entities/
└── user/
    ├── user.types.ts      ← User type
    ├── user.lib.ts        ← getFullName, isAdmin
    └── index.ts

profile/    ← imports from @/entities/user
admin/      ← imports from @/entities/user
```

**Rationale:** `User` is a foundational domain concept that multiple verticals build upon. The dependency flows in the correct direction:

```txt
profile/  admin/        ← higher layer
    \      /
   entities/user        ← lower layer (never imports upwards)
```

---

## Scenario 6: Billing triggers a notification

**Situation:** After a payment succeeds, you need to trigger an in-app notification.

**INCORRECT Way:**

```ts
// ❌ billing digging deep into notifications internals
import { pushToQueue } from "@/notifications/internal/queue";
```

**Decision:** Go through the public API — unidirectional.

```ts
// ✅ billing/hooks/usePayment.ts
import { useNotify } from "@/notifications";

const notify = useNotify();
onSuccess: () => notify({ type: "success", message: "Payment completed" });
```

```txt
billing → notifications    ✅ unidirectional, via public API
```

**Rationale:** `notifications/` is a shared business capability — it exists to serve other verticals. Unidirectional dependencies via public APIs are healthy.

> 📚 **Note — 3 schools of thought on cross-imports between verticals:**
>
> | School of Thought | Rule | Ideal Context |
> | --- | --- | --- |
> | **Bulletproof React** | **Strictly forbids** features importing other features. All composition occurs at the `app/` layer. | Small to medium teams that prefer absolute simplicity. |
> | **FSD** | Forbids imports **within the same layer**. `features/billing` cannot import `features/notifications` — but is allowed to import from lower layers (`entities/`, `shared/`). | Teams looking for standardized architecture enforced by a linter ([steiger](https://github.com/feature-sliced/steiger)). |
> | **TkDodo / Sentry** | **Allows** imports but requires them to be explicit and go through public interfaces, controlled via ESLint boundaries. | Pragmatic large codebases where capabilities like notifications are heavily reused by multiple verticals. |
>
> Under strict FSD guidelines, the solution to this scenario is to demote `notifications` to a lower layer (e.g. `shared/` or treated as an infrastructure capability), so `billing` can import it without violating layer rules. All three schools agree on one crucial point: **dependencies must be unidirectional and enforced by tooling, not by team agreements.**

---

## Scenario 7: Search used in 4 different places

**Situation:** Searching products, searching users, searching invoices, and searching docs. The search logic (debounce, highlighting, recent searches) is ~80% identical.

**INCORRECT Way:** Copy-paste search logic into 4 verticals, or dump it all into a global helper file like `shared/utils/search.ts` (turning it into a junkyard).

**Decision:** Make search its own vertical — even though it is not a pure "business domain".

```txt
search/
├── components/
│   ├── SearchInput.tsx
│   └── SearchResults.tsx
├── hooks/
│   └── useSearch.ts        ← generic, accepts a fetcher from the caller
└── index.ts
```

```tsx
// products/components/ProductSearch.tsx
import { useSearch, SearchInput } from "@/search";
import { searchProducts } from "../api/products.api";

const { results, query, setQuery } = useSearch({ fetcher: searchProducts });
```

**Rationale:** This is exactly why we use the term "vertical" instead of "domain". Search is not a business domain itself, but it is a cohesive block of code that deserves its own ownership and boundary. Each vertical then **injects** its own business logic (the fetcher) into it.

---

## Scenario 8: `payments/` and `subscriptions/` constantly import each other

**Situation:**

```txt
payments      → needs subscription plan info to calculate pricing
subscriptions → needs payment status to activate plans
payments      → needs subscription discount logic
subscriptions → needs payment method data
```

**Red Flag:** Highly coupled, two-way imports.

**Decision:** Stop fighting a fake boundary. Merge them:

```txt
billing/
├── payments/          ← now a sub-folder, free internal imports
├── subscriptions/
├── shared/            ← common billing types + logic
└── index.ts           ← ONE public API for all billing
```

**Rationale:** If two things cannot live without each other → they are **one unit**. An incorrect boundary causes friction every day without providing any architectural benefits. Within the same domain, internal imports are natural.

---

## Scenario 9: "Almost identical" component in 2 verticals

**Situation:** `billing/InvoiceTable` and `orders/OrderTable` are ~70% identical: sorting, pagination, row selection.

**INCORRECT Way:** Rushing to abstract it into a `SharedTable` with 30 props to cover both cases.

**Decision (in two steps):**

**Step 1** — Is the overlapping part pure UI? → Yes (sorting, pagination are generic UI behaviors) → move it to the design system:

```txt
design-system/
└── DataTable/          ← generic: columns, data, onSort, pagination
```

**Step 2** — Each vertical keeps its own business logic:

```tsx
// billing/components/InvoiceTable.tsx
import { DataTable } from "@/design-system";

<DataTable
  columns={invoiceColumns} // ← business logic here
  data={invoices}
  rowActions={<RefundButton />} // ← business logic here
/>;
```

**Rationale:** Separate the generic UI concern from the business logic. Note: **duplicating code twice is still fine** — only abstract when you hit a third occurrence (Rule of Three). A wrong abstraction is far more expensive than code duplication.

---

# LEVEL 3 — COMPLEX

---

## Scenario 10: Checkout flow requires 3 verticals working together

**Situation:** The checkout page needs: `cart/` (cart items), `billing/` (payment form), and `shipping/` (delivery address). They need to communicate: cart total → payment amount, shipping fee → total.

**INCORRECT Way:** Verticals importing each other:

```txt
cart → billing → shipping → cart   ❌ circular dependency
```

**Decision:** The **page** acts as the orchestrator. Verticals have no knowledge of each other.

```tsx
// pages/checkout/CheckoutPage.tsx
import { useCart, CartSummary } from "@/cart";
import { PaymentForm } from "@/billing";
import { ShippingForm, useShippingFee } from "@/shipping";

export function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [address, setAddress] = useState<Address>();
  const shippingFee = useShippingFee(address);

  return (
    <>
      <CartSummary items={items} />
      <ShippingForm onSubmit={setAddress} />
      <PaymentForm amount={subtotal + shippingFee} /> {/* ← page orchestrates */}
    </>
  );
}
```

```txt
        pages/checkout          ← knows EVERYTHING, connects via props
       /      |       \
    cart/  billing/  shipping/  ← do NOT know each other
```

**Rationale:** This follows FSD's layer rules: only import from lower layers. `PaymentForm` receives `amount` — it doesn't care if the amount comes from a cart or somewhere else. Each vertical remains independently testable.

---

## Scenario 11: Real-time notifications need to update 5 verticals

**Situation:** A WebSocket pushes a `payment.completed` event → billing must refetch, the dashboard must update its charts, notifications must show a toast, orders must update status, and analytics must log the event.

**INCORRECT Way:** The `websocket/` vertical imports all 5 verticals to trigger them directly → lower layers depending on higher layers. Adding a new vertical would force modifying the websocket module.

**Decision:** Event-driven — invert the dependency flow:

```txt
shared/
└── lib/
    └── event-bus.ts        ← generic pub/sub, zero business knowledge

infrastructure/
└── websocket/
    └── socket.ts           ← receives messages, emits on the event bus. Doesn't care who listens.
```

```ts
// infrastructure/websocket/socket.ts
socket.on("message", (msg) => eventBus.emit(msg.type, msg.payload));

// billing/hooks/useBillingEvents.ts — billing registers ITSELF
useEffect(() => {
  return eventBus.on("payment.completed", () => {
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  });
}, []);

// dashboard/hooks/useDashboardEvents.ts — dashboard registers ITSELF
useEffect(() => {
  return eventBus.on("payment.completed", refreshChart);
}, []);
```

```txt
infrastructure/websocket → event-bus ← billing, dashboard, orders...
         (emits)                           (subscribes)
```

**Rationale:** The WebSocket module does not need to know about listeners. Adding a 6th vertical simply means subscribing internally, with zero modifications to existing code. This achieves true loose coupling.

---

## Scenario 12: Application-wide Feature Flags & A/B Testing

**Situation:** You need to toggle features based on user segments: a new checkout page for 10% of users, or a beta dashboard for the internal team.

**Decision:** Treat feature flags as an infrastructure-flavored vertical:

```txt
feature-flags/
├── hooks/
│   └── useFlag.ts
├── components/
│   └── FeatureGate.tsx
├── api/
│   └── flags.api.ts       ← fetch from LaunchDarkly/Unleash/self-hosted
└── index.ts
```

```tsx
// pages/checkout/CheckoutPage.tsx — handled at the page level
import { useFlag } from "@/feature-flags";
import { CheckoutV2 } from "@/checkout-v2";
import { CheckoutV1 } from "@/checkout";

const isV2 = useFlag("new-checkout");
return isV2 ? <CheckoutV2 /> : <CheckoutV1 />;
```

**Rationale:** Toggle versions at the **page layer**, rather than scattering `if (flag)` checks throughout the inner workings of different verticals. When rolling out to 100%, deleting `checkout/` (V1) is as simple as deleting a folder, instead of searching for if/else blocks across files. A vertical structure makes **deleting code** extremely cheap — which is its most underrated benefit.

---

## Scenario 13: Migrating a legacy horizontal codebase (300 files) to vertical

**Situation:** The app currently has `components/` (120 files), `hooks/` (60 files), `utils/` (80 files), and `api/` (40 files). The team has 6 people and cannot pause shipping features to refactor.

**INCORRECT Way:** A big-bang rewrite in a single sprint. This will conflict with every open PR and will never get finished.

**Decision:** Migrate incrementally using the **Strangler Fig** strategy:

```txt
Step 1: NEW features → write them as verticals immediately (don't add to legacy folders)

src/
├── components/        ← legacy, frozen, no new additions
├── hooks/             ← legacy
├── domains/
│   └── referral/      ← new feature, structured as a clean vertical from day 1

Step 2: When EDITING a legacy feature → relocate related code into a vertical
        Follow the "Boy Scout Rule": leave the playground cleaner than you found it.

Step 3: Set ESLint rules to block new imports into legacy folders.

Step 4: Over 6-12 months, legacy folders shrink until they can be safely deleted.
```

```jsonc
// ESLint configuration to block deep imports and freeze legacy folders
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/domains/*/internal/*"],
            "message": "Use the vertical's public API instead.",
          },
          {
            "group": ["@/utils/*"],
            "message": "utils/ is frozen. Put new code inside a vertical or shared/lib.",
          },
        ],
      },
    ],
  },
}
```

**Rationale:** Migration is a process, not an event. You get architectural value from week one (new features are clean), and the risk of breaking things is practically zero.

---

## Scenario 14: Monorepos — When should a vertical become its own package?

**Situation:** The app grows, and there are now 3 teams: Billing, Growth, and Platform. Verticals within the same app start clashing: CI takes 25 minutes, and PR reviews constantly cross team boundaries.

**Decision:** Promote verticals to libraries in a monorepo (Nx/Turborepo):

```txt
apps/
└── web/                     ← shell app: routing & composition only

libs/
├── billing/                 ← owned by the Billing team
│   ├── feature-invoices/
│   ├── feature-payments/
│   └── data-access/
├── growth/                  ← owned by the Growth team
│   ├── feature-referral/
│   └── feature-onboarding/
├── design-system/           ← owned by the Platform team
└── shared/
    └── util-date/
```

Enforce strict dependency rules (using Nx module boundaries):

```jsonc
// billing is forbidden from importing growth and vice versa
{ "sourceTag": "scope:billing", "onlyDependOnLibsWithTags": ["scope:billing", "scope:shared"] }
{ "sourceTag": "scope:growth",  "onlyDependOnLibsWithTags": ["scope:growth", "scope:shared"] }
```

**Rationale:** Verticals inside a single app rely on boundaries enforced by **conventions**. Monorepo libraries enforce boundaries using **tooling** (CI only builds affected libraries). Only upgrade when you experience real pain: teams grow beyond 5-6 people, CI gets slow, or ownership conflicts arise. This is Phase 5 — don't jump here on day one.

---

## Scenario 15: A vertical grows too large — 60 files inside `billing/`

**Situation:** After 2 years, `billing/` has 60+ files: invoices, payments, subscriptions, refunds, tax, and coupons are all mixed up inside its `components/` and `hooks/` folders.

**Decision:** Verticalize recursively — split into sub-verticals by feature:

```txt
billing/
├── invoices/            ← each feature is a sub-vertical
│   ├── components/
│   ├── hooks/
│   └── index.ts
├── payments/
├── subscriptions/
├── tax/
├── shared/              ← common billing utilities (billing.types, shared billing hooks)
└── index.ts             ← main public API, re-exporting from sub-verticals
```

Import rules after splitting:

```txt
Within billing:         invoices → payments        ✅ (via payments' index.ts)
From outside billing:   dashboard → @/billing      ✅ (only via main index.ts)
Deep importing:         dashboard → @/billing/tax  ❌
```

**Rationale:** Vertical architecture is **fractal** — the same principles apply at all scales. A domain (billing) contains features (invoices, payments), and each feature remains self-contained with everything it needs.

---

# Summary — Decision Tree

```txt
Where should this code go?
│
├─ Does it contain domain/business vocabulary? (invoice, user, refund...)
│   ├─ YES → the vertical of that domain
│   │   └─ Is it needed by multiple verticals?
│   │       ├─ Is it an entity/type → entities/ (Scenario 5)
│   │       ├─ Is it a capability → its own vertical (Scenario 6, 7)
│   │       └─ Is it a flow orchestration → compose at page level (Scenario 10)
│   │
│   └─ NO →
│       ├─ Is it a pure UI component → design-system/ (Scenario 1, 9)
│       ├─ Is it a pure utility helper → shared/lib/ (Scenario 3)
│       └─ Is it infrastructure (socket, http) → infrastructure/ (Scenario 11)
│
└─ Do two verticals have circular imports?
    └─ Merge them into a single vertical (Scenario 8)
```

## 5 Principles Extracted from All Scenarios

1. **Domain terminology in the name = belongs to a vertical.** `formatDate` is different from `formatInvoiceDate`.
2. **Dependencies flow only downwards:** pages → verticals → entities → shared. Never horizontally or upwards.
3. **Verticals do not know about each other** — connect them at the page layer, or use an event bus for fan-out requirements.
4. **A bad boundary is worse than no boundary** — circular imports are a clear signal to merge.
5. **Structure is fractal** — vertical rules apply recursively within each vertical as it grows.

---

# Verification against Industry Best Practices

> Verified against: [TkDodo — The Vertical Codebase](https://tkdodo.eu/blog/the-vertical-codebase) (04/2026), [Feature-Sliced Design docs](https://feature-sliced.design/docs/get-started/overview), [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md).

## Core Consensus Points (Best Practices)

| Principle | TkDodo | FSD | Bulletproof React |
| --- | --- | --- | --- |
| Group by functionality, not file type | ✅ | ✅ (slices) | ✅ (`features/`) |
| Co-locate code that changes together | ✅ reduces cognitive load | ✅ high cohesion | ✅ |
| Unidirectional dependencies: shared → features → app | ✅ | ✅ strict layer rules | ✅ unidirectional |
| Enforced by tooling, not verbal rules | ✅ eslint-plugin-boundaries | ✅ steiger linter | ✅ import/no-restricted-paths |
| Design system is its own vertical | ✅ `/design-system` | ✅ `shared/ui` | ✅ `components/` |
| Migrate incrementally, no big-bang | ✅ | ✅ dedicated guide | ✅ |

## Differences (Adjust based on your context)

| Topic | Options |
| --- | --- |
| Cross-feature imports | Bulletproof React: strictly forbidden · FSD: forbidden on same layer · TkDodo: allowed with boundaries |
| Barrel files (`index.ts`) | Bulletproof React: **avoid** (breaks Vite tree-shaking) · TkDodo: use `package.json` exports in monorepos · FSD: use public API per slice |
| Standardized layers | FSD: 6 fixed layers (app/pages/widgets/features/entities/shared) · TkDodo & Bulletproof: flexible, fewer layers |
| Ceremony level | FSD: highest (standardized + custom linter) · Bulletproof: medium · TkDodo: lowest, highly pragmatic |

## Insights from TkDodo (2026)

1. **Page-driven vertical heuristic:** start from **routes/pages** — a page `/dashboard` implies a vertical `dashboard/`. A widget used in multiple routes can be promoted.
2. **Align with team ownership:** code structure should reflect organization. A vertical should align with a `CODEOWNERS` entry: Billing team owns `src/billing/`.
3. **AI agents need structure too:** agents operate best under clear boundaries, constraints, and fast feedback loops. This is why agents thrive on clean architectures but struggle with messy, legacy codebases.
4. **Trade-offs:** selecting the right vertical is not always clear-cut; private code carries the risk of duplicate implementations, requiring better communication.

## Conclusion: What should you choose?

```txt
Small project / MVP        → Bulletproof React style: features/ + forbidden cross-imports
                             (simplest, sufficient)

Medium team, uniformity    → FSD: fixed layers + steiger linter
                             (easy onboarding due to uniform structure)

Large codebase, many teams → TkDodo verticals + monorepo packages
                             + eslint-plugin-boundaries / Nx module boundaries

All cases                  → Unidirectional dependencies + ESLint enforcement
                             are ABSOLUTELY mandatory.
```
