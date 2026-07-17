# Frontend Architecture Notes

## DDD + Vertical Codebase + Feature-Sliced Design

---

# The Big Idea

Most frontend codebases start like this:

```txt
src/
├── components/
├── hooks/
├── utils/
├── types/
├── services/
└── constants/
```

This is called a **horizontal structure** because code is grouped by technical type.

The problem:

- Hard to navigate at scale.
- Ownership is unclear.
- Related code is scattered.
- High cognitive load.
- "Shared" folders become garbage dumps.

---

# Core Principle

> Group code by what it does, not by what it is.

Instead of:

```txt
components/
hooks/
utils/
```

Prefer:

```txt
billing/
auth/
profile/
notifications/
search/
```

This is the central idea behind:

- Vertical Codebase
- DDD Frontend
- Feature-Sliced Design
- Modular Monoliths
- Domain-Oriented Frontend

---

# The Golden Rule

> Code that changes together should live together.

Example:

Instead of:

```txt
components/
└── UserProfile.tsx

hooks/
└── useUserProfile.ts

api/
└── user.api.ts

types/
└── user.types.ts
```

Put everything together:

```txt
profile/
├── UserProfile.tsx
├── useUserProfile.ts
├── profile.api.ts
└── profile.types.ts
```

Now every profile-related change happens in one place.

---

# Domain vs Feature

## Domain

A business area.

Examples:

```txt
Billing
Authentication
User Management
Notifications
Analytics
Inventory
```

Domains usually live for years.

Example:

```txt
billing/
├── invoices
├── payments
├── subscriptions
└── refunds
```

---

## Feature

A user-facing capability.

Examples:

```txt
Create Invoice
Refund Payment
Login
Upload Avatar
Export CSV
```

Features often belong to a domain.

Example:

```txt
billing/
├── create-invoice
├── refund
└── subscriptions
```

---

## Relationship

```txt
Domain
    └── Features
```

Example:

```txt
Billing
├── Subscription
├── Payments
└── Refunds
```

---

# Why TkDodo Uses "Vertical"

Because not everything is a domain.

Examples:

```txt
search/
page-filters/
design-system/
```

These are not really business domains.

They are still logical groups of code.

So the more generic term is:

```txt
Vertical
```

---

# What Is a Vertical?

A vertical is a cohesive unit of functionality.

Examples:

```txt
auth/
billing/
search/
notifications/
design-system/
analytics/
```

Inside:

```txt
billing/
├── components/
├── hooks/
├── api/
├── model/
├── types/
└── index.ts
```

Notice:

Components still exist.

Hooks still exist.

They are simply scoped to Billing.

---

# Shared Code Problem

The typical anti-pattern:

```txt
shared/
utils/
common/
helpers/
```

After years:

```txt
shared/
├── formatDate.ts
├── calculateTax.ts
├── useData.ts
├── search.ts
├── pageFilter.ts
├── auth.ts
└── randomStuff.ts
```

Nobody owns it.

Nobody understands it.

Everything depends on it.

---

# Better Approach

## Shared Business Capability

If many domains use it:

```txt
notifications/
search/
page-filters/
```

Create a dedicated vertical.

Example:

```txt
src/
├── billing/
├── dashboard/
├── search/
└── notifications/
```

---

## Shared UI

Create a design system.

```txt
design-system/
├── Button/
├── Input/
├── Modal/
└── Table/
```

---

## Truly Generic Code

Keep only generic utilities here.

```txt
shared/
├── lib/
│   ├── date.ts
│   ├── string.ts
│   └── currency.ts
│
├── config/
└── constants/
```

Good examples:

```ts
formatDate();
sleep();
debounce();
```

Bad examples:

```ts
calculateInvoiceTax();
sendNotification();
searchProducts();
```

Those belong to domains.

---

# Boundaries

Each vertical should expose a public API.

Example:

```txt
billing/
├── api/
├── hooks/
├── internal/
└── index.ts
```

Public:

```ts
import { useBilling } from "@/billing";
```

Avoid:

```ts
import { calculateFee } from "@/billing/internal/utils/calculateFee";
```

---

# Cross Imports

## Same Domain

Okay.

```txt
billing/
├── payments/
└── subscriptions/
```

Example:

```txt
subscriptions
      ↓
payments
```

Normal.

---

## Different Domains

Possible, but controlled.

```txt
billing
    ↓
notifications
```

Prefer going through public APIs.

---

## Red Flag

If:

```txt
payments
      ↓
subscriptions

subscriptions
      ↓
payments
```

everywhere,

you may have split the boundary incorrectly.

Maybe they should be one vertical.

---

# Architecture Evolution

Most teams evolve like this:

## Phase 1

```txt
components/
hooks/
utils/
```

Simple.

Works for small projects.

---

## Phase 2

```txt
components/
hooks/
utils/
```

Starts becoming painful.

---

## Phase 3

```txt
auth/
billing/
profile/
```

Vertical organization emerges.

---

## Phase 4

```txt
domains/
├── billing/
├── auth/
└── profile/
```

Clear ownership.

---

## Phase 5

```txt
monorepo
├── billing
├── analytics
├── notifications
└── design-system
```

Strong boundaries.

Independent ownership.

---

# Architectures That Follow This Philosophy

## 1. Feature-Sliced Design (FSD)

```txt
app/
pages/
widgets/
features/
entities/
shared/
```

Feature ownership.

Domain thinking.

Strict boundaries.

Most aligned with Vertical Codebase thinking.

---

## 2. Bulletproof React

```txt
features/
├── auth/
├── users/
├── comments/
└── discussions/
```

Simple and practical.

Great for React teams.

---

## 3. Domain-Driven Frontend

```txt
domains/
├── billing/
├── analytics/
├── notifications/
└── users/
```

Very DDD-inspired.

Works well in large products.

---

## 4. Nx Monorepo

```txt
libs/
├── billing/
├── analytics/
├── notifications/
└── design-system/
```

Strong dependency control.

Enterprise friendly.

---

# Recommended Structure (Practical)

For a React/NestJS product:

```txt
src/
├── app/
│
├── domains/
│   ├── auth/
│   ├── billing/
│   ├── dashboard/
│   ├── profile/
│   ├── notifications/
│   └── search/
│
├── design-system/
│
├── shared/
│   ├── lib/
│   ├── config/
│   └── constants/
│
└── infrastructure/
```

Inside a domain:

```txt
billing/
├── components/
├── hooks/
├── api/
├── model/
├── types/
├── utils/
└── index.ts
```

---

# Final Takeaways

### 1

```txt
Group by business capability
not by file type.
```

---

### 2

```txt
Code that changes together
should live together.
```

---

### 3

```txt
Shared business logic
should become its own vertical.
```

---

### 4

```txt
Every vertical needs boundaries.
```

---

### 5

```txt
Public API ✅
Deep imports ❌
```

---

### 6

```txt
High Cohesion
Low Coupling
```

---

# One-Sentence Summary

> Build your frontend around domains/verticals that represent real business capabilities, colocate everything that changes together, and expose clear boundaries through public APIs.
