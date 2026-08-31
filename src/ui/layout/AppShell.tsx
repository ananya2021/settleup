import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

const navItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/groups', label: 'Groups', icon: 'groups' },
  { to: '/balances', label: 'Balances', icon: 'balances' },
];

function NavIcon({ name, isActive }: { name: string; isActive: boolean }) {
  const color = isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)';
  const weight = isActive ? 2.2 : 1.8;

  if (name === 'home') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }
  if (name === 'groups') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === 'balances') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  return null;
}

export function AppShell() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface)' }}>
      {/* Main content */}
      <main className="flex-1 safe-bottom">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0"
        style={{
          background: 'rgba(250, 250, 248, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid var(--color-border-light)',
        }}
      >
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5"
              style={{ minWidth: 64 }}
            >
              {({ isActive }) => (
                <>
                  <NavIcon name={item.icon} isActive={isActive} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                      transition: 'color 150ms ease',
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5"
            style={{ minWidth: 64 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
              Sign Out
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
