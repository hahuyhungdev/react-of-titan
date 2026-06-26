/** Activity feature constants. */

export const ACTIVITY_TYPE_COLORS = {
  info: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
} as const;

export const ACTIVITY_TYPE_ICONS = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
} as const;

/** Max activities to display before "show more". */
export const ACTIVITY_PAGE_SIZE = 10;
