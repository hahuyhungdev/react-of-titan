import { useState, useEffect } from "react";
import type { DashboardStats } from "../types/stats.types";

const MOCK_STATS: DashboardStats = {
  totalUsers: 1284,
  activeUsers: 342,
  revenue: 48250,
  growth: 12.5,
};

/**
 * Stats feature hook.
 * TODO: Replace mock with statsApi.getStats() once backend is ready.
 */
export function useStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (!cancelled) setStats(MOCK_STATS);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  return { stats, isLoading, error };
}
