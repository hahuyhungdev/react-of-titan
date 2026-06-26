import { useState, useEffect } from "react";

/**
 * Debounce a value by `delay` milliseconds.
 * Useful for search inputs, resize handlers, etc.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
