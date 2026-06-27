import { StatsCard } from "./components/StatsCard/StatsCard";
import { useStats } from "./hooks/useStats";

/**
 * Compound component — composes stats internals.
 * Page renders this single component.
 */
export function StatsSection() {
  const { stats, isLoading, error } = useStats();

  if (isLoading) return <div className="page-loading">Loading stats…</div>;
  if (error)
    return (
      <div className="page-error" role="alert">
        {error}
      </div>
    );

  return (
    <section className="stats-grid" aria-label="Key metrics">
      <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} change={12} />
      <StatsCard label="Active Users" value={stats?.activeUsers ?? 0} change={8} />
      <StatsCard label="Revenue" value={`$${stats?.revenue ?? 0}`} change={stats?.growth} />
    </section>
  );
}
