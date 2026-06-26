import { StatsSection } from "@/features/dashboard-stats";
import { ActivitySection } from "@/features/dashboard-activity";

export function DashboardPage() {
  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      <StatsSection />
      <ActivitySection />
    </div>
  );
}
