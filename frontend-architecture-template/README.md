# Frontend Architecture Template

Repo mẫu thể hiện **vertical/feature architecture** theo best practices tổng hợp từ TkDodo (The Vertical Codebase), Feature-Sliced Design, và Bulletproof React.

## Stack

| Concern              | Lựa chọn                                                      |
| -------------------- | ------------------------------------------------------------- |
| Build                | Vite + TypeScript                                             |
| UI framework         | React 19                                                      |
| Server state         | TanStack Query                                                |
| Forms                | React Hook Form + Zod                                         |
| Routing              | React Router                                                  |
| Boundary enforcement | ESLint (`eslint-plugin-boundaries` + `no-restricted-imports`) |

## Cấu trúc

```txt
src/
├── app/                  # Tầng compose cao nhất: entry, providers, router
├── pages/                # Route-level: KẾT NỐI các features (orchestrator)
├── features/             # Verticals — mỗi feature tự chứa đủ mọi thứ
│   ├── auth/             #   business feature
│   ├── billing/          #   business feature
│   ├── profile/          #   business feature (demo AWS upload)
│   ├── notifications/    #   CAPABILITY — feature khác được import
│   └── search/           #   CAPABILITY — feature khác được import
├── entities/             # Business entities dùng chung (User, ...)
├── shared/               # Tầng Shared dùng chung
│   ├── components/       #   UI Components chung
│   │   ├── ui/           #     PURE UI — không biết vendor lib nào (Button, TextField, DataTable)
│   │   ├── form/         #     adapters cho form lib (RHF ↔ ui/) — nơi duy nhất biết RHF
│   │   └── icons/        #     SVG → components
│   ├── styles/           #   Styles chung
│   │   └── tokens.css    #     design tokens — nguồn sự thật duy nhất
│   ├── lib/              #   Generic helpers (date, currency, event-bus)
│   └── config/           #   Configurations (env.ts)
└── infrastructure/       # Adapters cho thế giới bên ngoài: http, aws, ws
```

## Luật dependency (một chiều, chảy xuống)

```txt
app ──► pages ──► features ──► entities ──► shared (components, styles, lib)
                     │
                     └──► infrastructure ──► shared
```

| Từ               | Được import                                                                | KHÔNG được import                               |
| ---------------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| `app`            | mọi thứ                                                                    | —                                               |
| `pages`          | features, entities, shared                                                 | app, pages khác                                 |
| `features`       | **capabilities** (notifications, search), entities, shared, infrastructure | **feature khác** (trừ capabilities), app, pages |
| `entities`       | shared                                                                     | features, infrastructure                        |
| `infrastructure` | shared                                                                     | features, entities                              |
| `shared`         | chỉ shared (hoặc internal sub-folders)                                     | mọi thứ khác                                    |

**Tất cả được enforce bằng ESLint** — xem [eslint.config.js](eslint.config.js). Vi phạm = CI fail, không phải "nhớ giùm".

## Conventions

### 1. Naming

- Folder feature: `kebab-case` (`billing/`, `page-filters/`)
- Component: `PascalCase.tsx` — hooks: `useXxx.ts` — schema/types: `xxx.schema.ts`, `xxx.types.ts`
- Test cạnh file source: `Button.test.tsx`

### 2. Public/private — KHÔNG dùng barrel files

Theo Bulletproof React: **không dùng `index.ts` barrel** trong app Vite — barrel phá tree-shaking và làm chậm dev server. Import trực tiếp file:

```ts
import { LoginForm } from "@/features/auth/components/LoginForm"; // ✅
import { LoginForm } from "@/features/auth"; // ❌ không có barrel
```

Ranh giới public/private enforce bằng ESLint theo **segment** (`boundaries/entry-point`):

| Segment                           | Visibility                                      |
| --------------------------------- | ----------------------------------------------- |
| `components/`, `hooks/`, `model/` | Public — bên ngoài được import                  |
| `api/`, `internal/`               | **Private** — ngoài feature import = lint error |

Boundary là khái niệm logic do tooling enforce, không cần barrel. (Barrel/public-API file chỉ dùng khi tách monorepo packages — khi đó dùng `package.json` `exports` như TkDodo/Sentry.)

### 3. Vendor isolation (quan trọng)

Thư viện bên thứ ba "rò rỉ" khắp codebase = khóa chặt vendor lock-in. Rule:

| Vendor                          | Chỉ được import trong                                                      |
| ------------------------------- | -------------------------------------------------------------------------- |
| `@radix-ui/*`, headless UI libs | `shared/components/`                                                       |
| `@aws-sdk/*`, `aws-amplify`     | `infrastructure/aws/`                                                      |
| `axios` / fetch wrapper         | `infrastructure/http/`                                                     |
| `react-hook-form`, `zod`        | features (form là logic nghiệp vụ) + `shared/components/form` (UI wrapper) |

→ Ngày mai đổi Radix sang React Aria: chỉ sửa `shared/components/`. Đổi AWS S3 sang GCS: chỉ sửa `infrastructure/aws/`.

**Cấu trúc nội bộ shared/components/** (design system của app) — cô lập vendor theo sub-folder:

| Folder                            | Chứa gì                                         | Được biết vendor?                          |
| --------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `ui/`                             | Pure UI: Button, TextField, DataTable, Modal…   | ❌ KHÔNG — chỉ nhận props                  |
| `form/`                           | Adapters nối form lib với `ui/` (RHFTextField…) | ✅ react-hook-form                         |
| `icons/`                          | SVG convert thành components                    | ❌ (hoặc SVGR generate)                    |
| _(mở rộng)_ `charts/`, `editor/`… | Wrappers cho Recharts, TipTap…                  | ✅ vendor tương ứng, mỗi folder một vendor |

Quy tắc: **`ui/` không bao giờ import vendor lib hay import từ `form/`/`charts/`** — chiều phụ thuộc là `form/ → ui/`, không bao giờ ngược lại.

### 4. Forms

- Schema Zod đặt trong `features/<x>/model/` — schema LÀ business logic
- `useForm` + submit logic trong feature
- Field component dùng `shared/components/form/` (adapter RHF ↔ pure UI) — `ui/` không biết RHF
- Xem demo: [src/features/auth/components/LoginForm.tsx](src/features/auth/components/LoginForm.tsx)

### 5. Server state

- TanStack Query, `queryOptions` colocate trong `features/<x>/api/`
- Query keys có prefix feature: `['billing', 'invoices']`
- Không copy server state vào client store

### 6. Cross-feature communication

1. **Ưu tiên:** compose ở `pages/` — truyền props/callbacks ([DashboardPage](src/pages/dashboard/DashboardPage.tsx))
2. **Capabilities** (notifications, search): feature khác import trực tiếp file public (components/hooks/model) — whitelist trong ESLint
3. **Fan-out** (1 event → n features): event bus ([shared/lib/event-bus.ts](src/shared/lib/event-bus.ts) + [useBillingEvents](src/features/billing/hooks/useBillingEvents.ts))

### 7. Khi feature phình to

Chia sub-verticals đệ quy: `billing/invoices/`, `billing/payments/` — mỗi sub-vertical giữ cùng segment convention, luật public/private theo segment vẫn áp dụng.

## Cheat sheet: "code này để đâu?"

```txt
Có từ nghiệp vụ (invoice, user, refund)?
├─ CÓ  → features/<domain>/
│        Nhiều feature cùng cần?
│        ├─ là type/entity  → entities/
│        ├─ là capability   → features/<capability>/ (whitelist)
│        └─ là flow         → compose ở pages/
└─ KHÔNG
   ├─ UI thuần            → shared/components/ui/
   ├─ util thuần          → shared/lib/
   └─ gọi ra ngoài (http, aws, ws) → infrastructure/
```

## Chạy

```bash
pnpm install
pnpm dev          # dev server
pnpm lint         # kiểm tra boundaries + code quality
pnpm typecheck
pnpm build
```
