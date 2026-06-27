import { Outlet, NavLink } from "react-router";

/**
 * Default app layout with header, sidebar navigation, and content area.
 * Used for authenticated / main app pages.
 */
export function MainLayout() {
  return (
    <div className="layout-main">
      <header className="layout-header">
        <span className="layout-logo">MyApp</span>
        <nav className="layout-nav" aria-label="Main navigation">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
