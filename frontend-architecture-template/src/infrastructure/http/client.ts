// infrastructure/http/client.ts — HTTP adapter duy nhất của app.
// Features KHÔNG gọi fetch/axios trực tiếp (ESLint chặn axios ngoài folder này).
// Đổi fetch → axios → ky: chỉ sửa file này.
import { env } from "@/shared/config/env";

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.VITE_API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
    ...init,
  });
  if (!res.ok)
    throw new HttpError(res.status, `${init?.method ?? "GET"} ${path} failed`);
  if (res.status === 204 || res.status === 205)
    return undefined as unknown as T;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

export const httpClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { HttpError };
