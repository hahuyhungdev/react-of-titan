import { CURRENCY_OPTIONS } from "../constants";

/**
 * Format a number as currency (USD).
 */
export function formatCurrency(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, CURRENCY_OPTIONS).format(value);
}

/**
 * Format a large number with abbreviations (1.2k, 3.4M).
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toString();
}

/**
 * Format growth percentage with sign.
 */
export function formatGrowth(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Determine stat status based on growth value.
 */
export function getGrowthStatus(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}
