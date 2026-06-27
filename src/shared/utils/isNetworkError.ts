/**
 * Detect network/connectivity errors vs application errors.
 *
 * Centralised utility — avoids duplicating detection logic across providers
 * and hooks. Checks both standard Error instances and plain error-like objects
 * (as some HTTP libraries throw non-Error objects).
 *
 * @example
 * ```ts
 * try {
 *   await apiClient.get("/endpoint");
 * } catch (err) {
 *   if (isNetworkError(err)) {
 *     // Show offline banner or use fallback data
 *   } else {
 *     // Handle application-level error (401, 422, etc.)
 *   }
 * }
 * ```
 */
export function isNetworkError(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes("Failed to fetch") ||
      err.message.includes("Is the API server running") ||
      err.name === "TypeError"
    );
  }

  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: string }).message);
    return msg.includes("Failed to fetch") || msg.includes("Is the API server running");
  }

  return false;
}
