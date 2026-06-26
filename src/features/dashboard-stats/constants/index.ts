import type { DashboardStats } from "../types/stats.types";

/** Stats feature constants. */

export const STAT_LABELS: Record<keyof DashboardStats, string> = {
  totalUsers: "Total Users",
  activeUsers: "Active Users",
  revenue: "Revenue",
  growth: "Growth",
} as const;

export const STAT_THRESHOLDS = {
  highGrowth: 10,
  lowGrowth: 0,
  warningUsers: 100,
} as const;

/** Formatting options for stat values. */
export const CURRENCY_OPTIONS: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
};
