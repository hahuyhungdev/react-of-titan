# 📡 API Layer

## API Client

A single preconfigured fetch wrapper lives in `shared/lib/apiClient.ts`. All features use it — they don't create their own HTTP clients.

```tsx
import { apiClient } from "@/shared/lib/apiClient";
```

The client handles:

- Base URL configuration (`VITE_API_BASE_URL`)
- JSON content-type headers
- Auth token injection from localStorage
- Non-JSON response detection (catches HTML fallbacks)
- Error extraction from failed responses

## Feature API Pattern

Each feature has an `api/` folder with request functions:

```
features/dashboard-stats/
└── api/
    └── statsApi.ts
```

API files export an object with named request functions:

```tsx
// features/dashboard-stats/api/statsApi.ts
import { apiClient } from "@/shared/lib/apiClient";
import type { ApiResponse } from "@/shared/types/api";
import type { DashboardStats } from "../types/stats.types";

export const statsApi = {
  getStats: () => apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
};
```

## Request Declarations

Every API request should have:

- **TypeScript types** for request/response data
- **A fetcher function** using the shared API client
- **A hook** (optional) that wraps the fetcher with loading/error state

This pattern keeps API calls typed, testable, and consistent across features.

## Shared Types

Common API response shapes live in `shared/types/api.ts`:

```tsx
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Error Handling

The API client throws on non-JSON responses and non-OK status codes. Features handle errors in their hooks:

```tsx
try {
  const response = await statsApi.getStats();
  setStats(response.data);
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed to load");
}
```

When using AI assistants, the [code-reviewer](https://github.com/hahuyhungdev/ai-coding-config) agent checks that API calls have proper error handling and type safety.
