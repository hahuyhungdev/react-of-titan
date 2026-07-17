import { Outlet } from 'react-router-dom';

/**
 * Minimal layout for authentication pages (login, register).
 * No header or sidebar — just centered content.
 */
export function AuthLayout() {
  return (
    <div className="layout-auth">
      <main className="layout-auth-content">
        <Outlet />
      </main>
    </div>
  );
}
