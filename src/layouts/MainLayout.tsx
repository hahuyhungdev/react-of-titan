import { Outlet, NavLink } from "react-router";
import { useAuth } from "@/shared/context/AuthContext";
import { Button } from "@/shared/components/ui/Button";

/**
 * Default app layout with header, sidebar navigation, and content area.
 * Used for authenticated / main app pages.
 */
export function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout-main">
      <header className="layout-header">
        <span className="layout-logo">MyApp</span>
        <nav className="layout-nav" aria-label="Main navigation">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        {user && (
          <div
            className="layout-user"
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Welcome, <strong>{user.name}</strong>
            </span>
            <Button size="sm" variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        )}
      </header>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
