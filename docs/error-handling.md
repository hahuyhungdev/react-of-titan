# ⚠️ Error Handling

## API Errors

The `apiClient` in `shared/lib/apiClient.ts` handles API errors:

- **Non-JSON responses** — throws a clear error ("Is the API server running?")
- **Non-OK status** — extracts error message from response body
- **Network failures** — caught by the fetch catch block

Features handle errors in their hooks:

```tsx
try {
  const response = await statsApi.getStats();
  setStats(response.data);
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed to load stats");
}
```

The compound component renders the error state:

```tsx
if (error)
  return (
    <div className="page-error" role="alert">
      {error}
    </div>
  );
```

## Component Errors

Use React Error Boundaries to catch rendering errors. Instead of one boundary for the whole app, place them at feature level — a broken feature shouldn't crash the entire app.

```tsx
<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <StatsSection />
</ErrorBoundary>
```

## Form Validation

Features that have forms should validate input before submission:

```tsx
// features/auth/utils/validators.ts
export function validateEmail(email: string): ValidationResult {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return { valid: false, error: "Invalid email format" };
  return { valid: true };
}
```

Validation utilities stay inside the feature — they're domain-specific.

## Error Tracking

For production, integrate error tracking (e.g., Sentry) to capture and report errors with context:

- Source maps for stack traces
- User context for reproduction
- Breadcrumbs for debugging

## AI Assistance

The [code-reviewer](https://github.com/hahuyhungdev/ai-coding-config) agent checks that API calls have proper error handling. The [security-reviewer](https://github.com/hahuyhungdev/ai-coding-config) agent validates that errors don't leak sensitive information.
