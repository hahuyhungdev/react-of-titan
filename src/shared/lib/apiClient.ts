import { API_BASE_URL } from "@/shared/constants";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Lightweight fetch wrapper.
 * Extend with interceptors, auth headers, retry logic as needed.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const token = localStorage.getItem("auth_token");
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const contentType = response.headers.get("Content-Type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON but received ${contentType || "unknown content type"} from ${url}. ` +
        "Is the API server running?",
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw error;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
