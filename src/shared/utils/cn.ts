/**
 * Merge class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 *
 * @example
 *   cn("btn", isActive && "btn-active", className)
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
