import { useState, useEffect } from "react";
import type { Activity } from "../types/activity.types";

const MOCK_ACTIVITIES: Activity[] = [
  { id: "1", message: "New user signed up", timestamp: "2026-06-25", type: "success" },
  { id: "2", message: "Server CPU spike detected", timestamp: "2026-06-25", type: "warning" },
  { id: "3", message: "Deployment completed", timestamp: "2026-06-24", type: "info" },
];

/**
 * Activity feature hook.
 * TODO: Replace mock with activityApi.getRecent() once backend is ready.
 */
export function useActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchActivity() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!cancelled) setActivities(MOCK_ACTIVITIES);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load activity");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchActivity();
    return () => {
      cancelled = true;
    };
  }, []);

  return { activities, isLoading, error };
}
