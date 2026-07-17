# Vertical Architecture — Scenarios Thực Tế

> Từ basic tới complex. Mỗi scenario: tình huống → câu hỏi → quyết định → lý do.

---

# Cách dùng tài liệu này

Mỗi khi phân vân "code này để đâu?", tìm scenario giống nhất bên dưới.

Quy tắc quyết định nhanh:

| Câu hỏi                              | Nếu CÓ                      | Nếu KHÔNG                      |
| ------------------------------------ | --------------------------- | ------------------------------ |
| Có từ nghiệp vụ trong tên/logic?     | Thuộc vertical              | Có thể là shared/design-system |
| Nhiều vertical dùng?                 | Tách xuống tầng thấp hơn    | Giữ trong vertical             |
| Import chéo hai chiều?               | Merge hoặc cắt lại boundary | Giữ nguyên                     |
| Chỉ render props, không biết domain? | design-system               | vertical components            |

---

# LEVEL 1 — BASIC

---

## Scenario 1: Nút "Save" dùng ở nhiều nơi

**Tình huống:** Bạn có nút Save ở form profile, form billing, form settings.

**Câu hỏi:** Để đâu?

**Quyết định:**

```txt
design-system/
└── Button/
    ├── Button.tsx
    └── index.ts
```

**Lý do:** `Button` không biết nó đang save cái gì. Nó chỉ nhận `onClick`, `variant`, `children`. Zero business logic → design-system.

```tsx
// ✅ design-system: dumb, reusable
<Button variant="primary" onClick={handleSave}>
  Save
</Button>
```

---

## Scenario 2: Nút "Refund Payment"

**Tình huống:** Nút bấm vào sẽ mở confirm dialog, gọi API refund, show toast.

**Quyết định:**

```txt
billing/
└── components/
    └── RefundButton.tsx    ← wrap Button từ design-system
```

**Lý do:** Nó biết "refund" là gì → có business logic → thuộc vertical `billing/`.

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

**Pattern:** Vertical components **wrap** design-system components và thêm nghiệp vụ.

---

## Scenario 3: `formatDate()` — để đâu?

**Tình huống:** Cần format ngày ở billing, profile, dashboard.

**Quyết định:**

```txt
shared/
└── lib/
    └── date.ts    ← formatDate, isExpired, addDays
```

**Lý do:** Không có từ nghiệp vụ nào. Generic 100%. Có thể copy sang project khác mà không sửa gì.

**So sánh:**

```ts
formatDate(date); // ✅ shared/lib — generic
formatInvoiceDueDate(invoice); // ❌ → billing/utils — biết "invoice"
```

---

## Scenario 4: Bắt đầu feature mới "User Profile"

**Tình huống:** Team cần build trang profile: xem info, edit, upload avatar.

**Quyết định:** Tạo vertical mới ngay từ đầu, đừng rải code vào `components/` chung.

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
└── index.ts                  ← chỉ export những gì bên ngoài cần
```

```ts
// profile/index.ts — public API
export { ProfileCard } from "./components/ProfileCard";
export { useProfile } from "./hooks/useProfile";
// KHÔNG export EditProfileForm nếu chỉ dùng nội bộ
```

**Lý do:** Sau này mọi thay đổi về profile chỉ động vào 1 folder. Dev mới vào team tìm code profile trong 5 giây.

> ⚠️ **Caveat về barrel files (cập nhật từ Bulletproof React):** `index.ts` barrel export có thể phá tree-shaking của Vite và gây chậm build/dev server ở project lớn. Best practice hiện tại:
>
> - **Boundary là khái niệm logic** — enforce bằng **ESLint** (`import/no-restricted-paths` hoặc `eslint-plugin-boundaries`), không chỉ dựa vào barrel file
> - Nếu dùng Vite: cân nhắc import trực tiếp `@/profile/components/ProfileCard` + ESLint chặn import vào folder private
> - Nếu dùng bundler xử lý tốt barrel (hoặc monorepo với `package.json` exports): barrel vẫn ổn
>
> TkDodo/Sentry dùng chính cách này: [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) để chặn deep import vào private utils.

---

# LEVEL 2 — INTERMEDIATE

---

## Scenario 5: Hai vertical cần cùng một type `User`

**Tình huống:** `profile/` và `admin/` đều cần type `User` và hàm `getFullName(user)`.

**Cách SAI:**

```ts
// ❌ admin import từ ruột của profile
import { User } from "@/profile/types/profile.types";
```

**Quyết định:** Tách entity chung xuống tầng thấp hơn.

```txt
entities/
└── user/
    ├── user.types.ts      ← type User
    ├── user.lib.ts        ← getFullName, isAdmin
    └── index.ts

profile/    ← import từ @/entities/user
admin/      ← import từ @/entities/user
```

**Lý do:** `User` là khái niệm nền mà nhiều vertical xây lên trên. Dependency đúng hướng:

```txt
profile/  admin/        ← tầng cao
    \      /
   entities/user        ← tầng thấp (không import ngược lên)
```

---

## Scenario 6: Billing xong thì phải gửi notification

**Tình huống:** Sau khi payment thành công, cần gửi in-app notification.

**Cách SAI:**

```ts
// ❌ billing đào sâu vào ruột notifications
import { pushToQueue } from "@/notifications/internal/queue";
```

**Quyết định:** Đi qua public API — một chiều.

```ts
// ✅ billing/hooks/usePayment.ts
import { useNotify } from "@/notifications";

const notify = useNotify();
onSuccess: () => notify({ type: "success", message: "Payment completed" });
```

```txt
billing → notifications    ✅ một chiều, qua public API
```

**Lý do:** `notifications/` là shared business capability — nó tồn tại để phục vụ các vertical khác. Dependency một chiều qua public API là lành mạnh.

> 📚 **Lưu ý — 3 trường phái về cross-imports giữa verticals:**
>
> | Trường phái           | Quy tắc                                                                                                                                        | Phù hợp khi                                                                                       |
> | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
> | **Bulletproof React** | **Cấm hoàn toàn** feature import feature. Mọi kết nối compose ở tầng `app/`                                                                    | Team nhỏ-vừa, muốn quy tắc đơn giản tuyệt đối                                                     |
> | **FSD**               | Cấm import **cùng layer**. `features/billing` không import `features/notifications` — nhưng được import từ layer dưới (`entities/`, `shared/`) | Muốn cấu trúc chuẩn hóa, có linter ([steiger](https://github.com/feature-sliced/steiger)) enforce |
> | **TkDodo / Sentry**   | **Cho phép**, nhưng phải explicit và qua public interface, có ESLint boundaries kiểm soát                                                      | Codebase lớn thực dụng, capability như notifications phục vụ nhiều vertical                       |
>
> Theo FSD chuẩn, cách giải scenario này là hạ `notifications` xuống layer thấp hơn (`shared/` hoặc coi như infrastructure capability) — khi đó `billing` import nó không vi phạm luật layer. Cả 3 trường phái đều đồng ý một điểm: **dependency phải một chiều và được kiểm soát bằng tooling, không phải bằng niềm tin.**

---

## Scenario 7: Search dùng ở 4 chỗ khác nhau

**Tình huống:** Search products, search users, search invoices, search docs. Logic search (debounce, highlight, recent searches) giống nhau ~80%.

**Cách SAI:** Copy-paste logic search vào 4 vertical. Hoặc nhét vào `shared/utils/search.ts` (bãi rác).

**Quyết định:** Search trở thành vertical riêng — dù nó không phải "business domain".

```txt
search/
├── components/
│   ├── SearchInput.tsx
│   └── SearchResults.tsx
├── hooks/
│   └── useSearch.ts        ← generic, nhận fetcher từ ngoài
└── index.ts
```

```tsx
// products/components/ProductSearch.tsx
import { useSearch, SearchInput } from "@/search";
import { searchProducts } from "../api/products.api";

const { results, query, setQuery } = useSearch({ fetcher: searchProducts });
```

**Lý do:** Đây chính là lý do dùng từ "vertical" thay vì "domain". Search không phải nghiệp vụ, nhưng là nhóm code cohesive đáng có ownership và boundary riêng. Mỗi vertical **inject** phần nghiệp vụ của mình vào (fetcher).

---

## Scenario 8: `payments/` và `subscriptions/` import chéo nhau liên tục

**Tình huống:**

```txt
payments      → cần biết subscription plan để tính giá
subscriptions → cần biết payment status để active plan
payments      → cần subscription discount
subscriptions → cần payment method
```

**Red flag:** Import hai chiều, dày đặc.

**Quyết định:** Đừng cố duy trì boundary giả. Merge lại:

```txt
billing/
├── payments/          ← giờ là sub-folder, import nội bộ thoải mái
├── subscriptions/
├── shared/            ← types + logic chung của billing
└── index.ts           ← MỘT public API cho cả billing
```

**Lý do:** Nếu 2 thứ không thể sống thiếu nhau → chúng là **một unit**. Boundary sai gây ma sát mỗi ngày mà không đem lại lợi ích gì. Cùng domain thì import nội bộ là bình thường.

---

## Scenario 9: Component "gần giống nhau" ở 2 vertical

**Tình huống:** `billing/InvoiceTable` và `orders/OrderTable` giống nhau ~70%: sort, pagination, row selection.

**Cách SAI:** Vội abstract thành `SharedTable` với 30 props để cover cả 2 case.

**Quyết định theo 2 bước:**

**Bước 1** — Phần giống nhau có phải UI thuần không? → Có (sort, pagination là generic) → đẩy vào design-system:

```txt
design-system/
└── DataTable/          ← generic: columns, data, onSort, pagination
```

**Bước 2** — Mỗi vertical giữ phần nghiệp vụ của mình:

```tsx
// billing/components/InvoiceTable.tsx
import { DataTable } from "@/design-system";

<DataTable
  columns={invoiceColumns} // ← nghiệp vụ ở đây
  data={invoices}
  rowActions={<RefundButton />} // ← nghiệp vụ ở đây
/>;
```

**Lý do:** Tách đúng ranh giới generic/nghiệp vụ. Nhưng lưu ý: **duplicate 2 lần vẫn OK** — chỉ abstract khi xuất hiện lần thứ 3 (Rule of Three). Abstraction sai đắt hơn duplication.

---

# LEVEL 3 — COMPLEX

---

## Scenario 10: Checkout flow cần 3 verticals phối hợp

**Tình huống:** Trang checkout cần: `cart/` (giỏ hàng), `billing/` (payment form), `shipping/` (địa chỉ). Chúng cần "nói chuyện" với nhau: cart total → payment amount, shipping fee → total.

**Cách SAI:** Các vertical import lẫn nhau:

```txt
cart → billing → shipping → cart   ❌ vòng tròn dependency
```

**Quyết định:** Tầng **page** làm nhạc trưởng (orchestrator). Verticals không biết nhau.

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
      <PaymentForm amount={subtotal + shippingFee} /> {/* ← page kết nối */}
    </>
  );
}
```

```txt
        pages/checkout          ← biết TẤT CẢ, kết nối qua props
       /      |       \
    cart/  billing/  shipping/  ← KHÔNG biết nhau
```

**Lý do:** Đây là luật tầng của FSD: chỉ import từ tầng dưới. `PaymentForm` nhận `amount` — nó không quan tâm amount đến từ cart hay đâu. Mỗi vertical vẫn test độc lập được.

---

## Scenario 11: Real-time notification phải update 5 verticals

**Tình huống:** WebSocket đẩy event `payment.completed` → billing phải refetch, dashboard update chart, notifications hiện toast, orders đổi status, analytics log event.

**Cách SAI:** Vertical `websocket/` import 5 verticals kia để gọi trực tiếp → tầng thấp phụ thuộc tầng cao, thêm vertical mới là phải sửa websocket.

**Quyết định:** Event-driven — đảo ngược dependency:

```txt
shared/
└── lib/
    └── event-bus.ts        ← generic pub/sub, không biết nghiệp vụ

infrastructure/
└── websocket/
    └── socket.ts           ← nhận message, emit lên bus. KHÔNG biết ai nghe
```

```ts
// infrastructure/websocket/socket.ts
socket.on("message", (msg) => eventBus.emit(msg.type, msg.payload));

// billing/hooks/useBillingEvents.ts — billing TỰ đăng ký
useEffect(() => {
  return eventBus.on("payment.completed", () => {
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  });
}, []);

// dashboard/hooks/useDashboardEvents.ts — dashboard TỰ đăng ký
useEffect(() => {
  return eventBus.on("payment.completed", refreshChart);
}, []);
```

```txt
infrastructure/websocket → event-bus ← billing, dashboard, orders...
         (emit)                            (subscribe)
```

**Lý do:** Websocket không cần biết ai lắng nghe. Thêm vertical thứ 6 → nó tự subscribe, không sửa code cũ. Loose coupling thật sự.

---

## Scenario 12: Feature flag + A/B testing xuyên toàn app

**Tình huống:** Cần bật/tắt features theo user segment: new checkout cho 10% users, beta dashboard cho internal team.

**Quyết định:** Feature-flags là một vertical infrastructure-flavored:

```txt
feature-flags/
├── hooks/
│   └── useFlag.ts
├── components/
│   └── FeatureGate.tsx
├── api/
│   └── flags.api.ts       ← fetch từ LaunchDarkly/Unleash/tự host
└── index.ts
```

```tsx
// pages/checkout/CheckoutPage.tsx — quyết định ở tầng page
import { useFlag } from "@/feature-flags";
import { CheckoutV2 } from "@/checkout-v2";
import { CheckoutV1 } from "@/checkout";

const isV2 = useFlag("new-checkout");
return isV2 ? <CheckoutV2 /> : <CheckoutV1 />;
```

**Lý do quan trọng:** Switch version ở **tầng page**, không rải `if (flag)` khắp ruột các vertical. Khi rollout 100% → xóa `checkout/` (V1) là xóa nguyên folder, không phải đi lượm if/else khắp nơi. Vertical structure làm cho việc **xóa code** cực rẻ — đây là lợi ích bị đánh giá thấp nhất.

---

## Scenario 13: Migrate codebase horizontal 300 files sang vertical

**Tình huống:** App đang có `components/` (120 files), `hooks/` (60 files), `utils/` (80 files), `api/` (40 files). Team 6 người, không thể dừng ship feature để refactor.

**Cách SAI:** Big-bang rewrite trong 1 sprint. Sẽ conflict với mọi PR đang mở và không bao giờ xong.

**Quyết định:** Migrate dần theo chiến lược **Strangler Fig**:

```txt
Bước 1: Feature MỚI → viết theo vertical ngay (không thêm rác vào chỗ cũ)

src/
├── components/        ← legacy, đóng băng, không thêm mới
├── hooks/             ← legacy
├── domains/
│   └── referral/      ← feature mới, vertical chuẩn ngay từ đầu

Bước 2: Khi SỬA feature cũ → tiện tay move code liên quan vào vertical
        "Boy Scout Rule": chạm vào đâu, dọn tới đó

Bước 3: Đặt ESLint rule chặn import mới vào legacy folders

Bước 4: Sau 6-12 tháng, legacy folder teo dần → xóa
```

```jsonc
// ESLint chặn deep import + chặn thêm rác vào legacy
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/domains/*/internal/*"],
            "message": "Dùng public API của vertical",
          },
          {
            "group": ["@/utils/*"],
            "message": "utils/ đã đóng băng. Đặt code vào vertical hoặc shared/lib",
          },
        ],
      },
    ],
  },
}
```

**Lý do:** Migration là quá trình, không phải event. Giá trị đến ngay từ tuần đầu (feature mới đã sạch), rủi ro gần như zero.

---

## Scenario 14: Monorepo — khi nào tách vertical thành package riêng?

**Tình huống:** App lớn dần, 3 teams: Billing team, Growth team, Platform team. Verticals trong 1 app bắt đầu giẫm chân nhau: CI chạy 25 phút, PR review chéo team.

**Quyết định:** Nâng verticals thành libs trong monorepo (Nx/Turborepo):

```txt
apps/
└── web/                     ← chỉ là shell: routing + compose

libs/
├── billing/                 ← Billing team own
│   ├── feature-invoices/
│   ├── feature-payments/
│   └── data-access/
├── growth/                  ← Growth team own
│   ├── feature-referral/
│   └── feature-onboarding/
├── design-system/           ← Platform team own
└── shared/
    └── util-date/
```

Kèm dependency rules cứng (Nx module boundaries):

```jsonc
// billing không được import growth và ngược lại
{ "sourceTag": "scope:billing", "onlyDependOnLibsWithTags": ["scope:billing", "scope:shared"] }
{ "sourceTag": "scope:growth",  "onlyDependOnLibsWithTags": ["scope:growth", "scope:shared"] }
```

**Lý do:** Vertical trong 1 app = boundary bằng **quy ước** (convention). Monorepo libs = boundary bằng **công cụ** (tooling enforce, CI chỉ build affected). Chỉ nâng cấp khi đau thật: team > 5-6 người, CI chậm, ownership conflict. Đây là Phase 5 — đừng nhảy vào từ ngày đầu.

---

## Scenario 15: Vertical phình to — 60 files trong `billing/`

**Tình huống:** Sau 2 năm, `billing/` có 60+ files: invoices, payments, subscriptions, refunds, tax, coupons trộn trong `components/` và `hooks/` của nó.

**Quyết định:** Vertical hóa đệ quy — chia sub-verticals theo feature:

```txt
billing/
├── invoices/            ← mỗi feature là 1 vertical con
│   ├── components/
│   ├── hooks/
│   └── index.ts
├── payments/
├── subscriptions/
├── tax/
├── shared/              ← chung TRONG billing (billing.types, hooks chung)
└── index.ts             ← public API tổng, re-export từ các con
```

Quy tắc import sau khi chia:

```txt
Trong cùng billing:     invoices → payments        ✅ (qua index.ts của payments)
Từ ngoài vào:           dashboard → @/billing      ✅ (chỉ qua index.ts tổng)
Từ ngoài đào sâu:       dashboard → @/billing/tax  ❌
```

**Lý do:** Cấu trúc vertical là **fractal** — nguyên tắc áp dụng lại ở mọi scale. Domain (billing) chứa features (invoices, payments), mỗi feature lại tự chứa đủ những gì nó cần.

---

# Tổng kết — Decision Tree

```txt
Code này để đâu?
│
├─ Có từ nghiệp vụ? (invoice, user, refund...)
│   ├─ CÓ → vertical của domain đó
│   │   └─ Nhiều vertical cùng cần?
│   │       ├─ Là entity/type → entities/ (Scenario 5)
│   │       ├─ Là capability → vertical riêng (Scenario 6, 7)
│   │       └─ Là flow phối hợp → compose ở page (Scenario 10)
│   │
│   └─ KHÔNG →
│       ├─ Là UI component thuần → design-system/ (Scenario 1, 9)
│       ├─ Là utility thuần → shared/lib/ (Scenario 3)
│       └─ Là hạ tầng (socket, http) → infrastructure/ (Scenario 11)
│
└─ Hai vertical import chéo dày đặc?
    └─ Merge lại thành một (Scenario 8)
```

## 5 nguyên tắc rút ra từ mọi scenario

1. **Từ nghiệp vụ trong tên = thuộc về vertical.** `formatDate` ≠ `formatInvoiceDate`.
2. **Dependency chỉ chảy xuống:** pages → verticals → entities → shared. Không bao giờ ngang hàng hoặc ngược lên.
3. **Verticals không biết nhau** — tầng page kết nối, hoặc event bus khi cần fan-out.
4. **Boundary sai tệ hơn không có boundary** — import chéo hai chiều là tín hiệu merge.
5. **Cấu trúc là fractal** — nguyên tắc vertical áp dụng lại bên trong mỗi vertical khi nó phình to.

---

# Đối chiếu với Industry Best Practices

> Verified against: [TkDodo — The Vertical Codebase](https://tkdodo.eu/blog/the-vertical-codebase) (04/2026), [Feature-Sliced Design docs](https://feature-sliced.design/docs/get-started/overview), [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md).

## Những điểm cả 3 nguồn ĐỒNG THUẬN (chắc chắn là best practice)

| Nguyên tắc                                     | TkDodo                      | FSD                | Bulletproof React             |
| ---------------------------------------------- | --------------------------- | ------------------ | ----------------------------- |
| Group theo chức năng, không theo file type     | ✅                          | ✅ (slices)        | ✅ (`features/`)              |
| Code thay đổi cùng nhau sống cùng nhau         | ✅ cognitive load           | ✅ cohesion        | ✅                            |
| Dependency một chiều: shared → features → app  | ✅                          | ✅ luật layer cứng | ✅ unidirectional             |
| Enforce bằng tooling, không bằng quy ước miệng | ✅ eslint-plugin-boundaries | ✅ steiger linter  | ✅ import/no-restricted-paths |
| Design system là vertical riêng                | ✅ `/design-system`         | ✅ `shared/ui`     | ✅ `components/`              |
| Migrate incremental, không big-bang            | ✅                          | ✅ có guide riêng  | ✅                            |

## Những điểm các nguồn KHÁC NHAU (chọn theo context)

| Vấn đề                    | Các lựa chọn                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Cross-feature imports     | Bulletproof React: cấm tuyệt đối · FSD: cấm cùng layer · TkDodo: cho phép có kiểm soát                                                     |
| Barrel files (`index.ts`) | Bulletproof React: **tránh** (phá tree-shaking Vite) · TkDodo: dùng `package.json` exports trong monorepo · FSD: dùng public API per slice |
| Số tầng chuẩn hóa         | FSD: 6 layers cố định (app/pages/widgets/features/entities/shared) · TkDodo & Bulletproof: linh hoạt, ít tầng hơn                          |
| Mức độ ceremony           | FSD: cao nhất (chuẩn hóa + linter riêng) · Bulletproof: trung bình · TkDodo: thấp nhất, pragmatic                                          |

## Insight riêng từ TkDodo (2026) chưa có ở nguồn khác

1. **Heuristic tìm vertical:** bắt đầu từ **routes/pages** — có page `/dashboard` thì có vertical `dashboard/`. Widget dùng ở nhiều route → nâng thành vertical riêng.
2. **Align với team ownership:** vertical nên khớp với `CODEOWNERS` — team profiling own `src/profiling/`. Cấu trúc code phản chiếu cấu trúc tổ chức.
3. **AI agents cũng cần vertical:** agents làm việc hiệu quả cần cùng thứ con người cần — boundaries, constraints, fast feedback. Đó là lý do agents giỏi ở codebase mới nhưng kém ở codebase organic lâu năm.
4. **Cái giá phải trả (trade-off thật):** chọn đúng vertical cho mỗi piece of code là việc khó, không clear-cut như "components vào đây"; và private code có rủi ro các team re-implement trùng nhau → đòi hỏi giao tiếp giữa teams nhiều hơn.

## Kết luận: chọn gì cho project của bạn?

```txt
Project nhỏ / MVP          → Bulletproof React style: features/ + cấm cross-import
                             (đơn giản nhất, đủ dùng)

Team vừa, muốn chuẩn hóa   → FSD: layers cố định + steiger linter
                             (onboarding dễ vì structure uniform)

Codebase lớn, nhiều teams  → TkDodo verticals + monorepo packages
                             + eslint-plugin-boundaries / Nx module boundaries

Mọi trường hợp             → Dependency một chiều + enforce bằng ESLint
                             là điều KHÔNG được bỏ qua
```
