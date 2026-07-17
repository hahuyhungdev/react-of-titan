import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { getFullName } from '@/entities/user/user';

export function MainLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/login');
  };

  return (
    <div className="layout-main">
      <header className="layout-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span className="layout-logo" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>MyApp</span>
          <nav className="layout-nav" aria-label="Main navigation" style={{ display: 'flex', gap: '1rem' }}>
            <NavLink to="/dashboard" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? 'var(--color-primary, #10b981)' : '#495057', fontWeight: isActive ? 'bold' : 'normal' })}>Dashboard</NavLink>
            <NavLink to="/settings" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? 'var(--color-primary, #10b981)' : '#495057', fontWeight: isActive ? 'bold' : 'normal' })}>Settings</NavLink>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary, #10b981)', display: 'flex', alignItems: 'center', color: '#fff', fontSize: '10px', justifyContent: 'center' }}>
                  {user.firstName[0]}
                </div>
              )}
              <span style={{ fontSize: '0.9rem', color: '#495057' }}>{getFullName(user)}</span>
            </div>
          )}
          <button onClick={handleLogout} disabled={logout.isPending} style={{ padding: '0.25rem 0.75rem', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>
            {logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất'}
          </button>
        </div>
      </header>

      <main className="layout-content" style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
