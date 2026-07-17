import { ACTIVITY_TYPE_ICONS } from "../constants";
import type { Activity } from "../types/activity.types";

/**
 * Get the icon for an activity type.
 */
export function getActivityIcon(type: Activity["type"]): string {
  return ACTIVITY_TYPE_ICONS[type] ?? ACTIVITY_TYPE_ICONS.info;
}

/**
 * Format activity timestamp as relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Group activities by date string.
 */
export function groupByDate(activities: Activity[]): Record<string, Activity[]> {
  return activities.reduce(
    (groups, item) => {
      const date = new Date(item.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
      return groups;
    },
    {} as Record<string, Activity[]>,
  );
}
