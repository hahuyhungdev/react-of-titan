import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/testing/msw/server";
import { STORAGE_KEYS } from "@/shared/constants";
import type { ApiResponse } from "@/shared/types/api";
import { apiClient } from "./apiClient";

describe("apiClient", () => {
  it("sends JSON requests with the stored auth token", async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "token-123");

    server.use(
      http.get("http://localhost/api/profile", ({ request }) =>
        HttpResponse.json({
          data: {
            authorization: request.headers.get("authorization"),
          },
          message: "OK",
          status: 200,
        }),
      ),
    );

    const response = await apiClient.get<ApiResponse<{ authorization: string | null }>>("/profile");

    expect(response.data.authorization).toBe("Bearer token-123");
  });

  it("throws a clear error when the API returns non-JSON content", async () => {
    server.use(
      http.get(
        "http://localhost/api/html",
        () => new HttpResponse("<html></html>", { headers: { "Content-Type": "text/html" } }),
      ),
    );

    await expect(apiClient.get("/html")).rejects.toThrow("Expected JSON");
  });

  it("serializes JSON bodies for mutation requests", async () => {
    server.use(
      http.post("http://localhost/api/profile", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          data: body,
          message: "Saved",
          status: 200,
        });
      }),
    );

    const response = await apiClient.post<ApiResponse<{ name: string }>>("/profile", {
      name: "Titan",
    });

    expect(response.data.name).toBe("Titan");
  });
});
