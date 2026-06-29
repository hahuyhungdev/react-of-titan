import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AuthContext, type AuthContextType } from "@/shared/context/AuthContext";
import { ProtectedRoute } from "../ProtectedRoute";

function renderProtectedRoute(authValue: AuthContextType) {
  render(
    <AuthContext value={authValue}>
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Private content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext>,
  );
}

const baseAuthValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

describe("ProtectedRoute", () => {
  it("redirects anonymous users to login", async () => {
    renderProtectedRoute(baseAuthValue);

    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    renderProtectedRoute({
      ...baseAuthValue,
      user: { id: "user-1", email: "user@example.com", name: "User" },
      isAuthenticated: true,
    });

    expect(screen.getByText("Private content")).toBeInTheDocument();
  });
});
