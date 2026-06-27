import { ActivityFeed } from "./components/ActivityFeed";
import { useActivity } from "./hooks/useActivity";

/**
 * Compound component — composes activity internals.
 * Page renders this single component.
 */
export function ActivitySection() {
  const { activities, isLoading, error } = useActivity();

  if (isLoading) return <div className="page-loading">Loading activity…</div>;
  if (error)
    return (
      <div className="page-error" role="alert">
        {error}
      </div>
    );

  return (
    <section className="activity-section" aria-label="Recent activity">
      <h2>Recent Activity</h2>
      <ActivityFeed activities={activities} />
    </section>
  );
}
