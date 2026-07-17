// pages/dashboard — ORCHESTRATOR (Scenario 10):
// Page biết TẤT CẢ features nó cần và kết nối chúng. Features KHÔNG biết nhau.
// Import trực tiếp file public — không barrel (Vite tree-shaking).
import { InvoiceTable } from "@/features/billing/components/InvoiceTable";
import { useBillingEvents } from "@/features/billing/hooks/useBillingEvents";
import { AvatarUploader } from "@/features/profile/components/AvatarUploader";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getFullName } from "@/entities/user/user";
import { StatsSection } from "@/features/dashboard-stats";
import { ActivitySection } from "@/features/dashboard-activity";

export function DashboardPage() {
  // billing tự subscribe websocket events — page chỉ cần kích hoạt
  useBillingEvents();
  const { data: user } = useCurrentUser();

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary, #10b981)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#fff",
              }}
            >
              {user ? user.firstName[0] : ""}
            </div>
          )}
          <span>{user ? getFullName(user) : "Đang tải..."}</span>
          <AvatarUploader />
        </div>
      </header>

      <StatsSection />

      <section aria-labelledby="invoices-heading">
        <h2 id="invoices-heading" style={{ marginBottom: "1rem" }}>Hóa đơn</h2>
        <InvoiceTable />
      </section>

      <ActivitySection />
    </main>
  );
}
