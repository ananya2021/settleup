import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/users/hooks/useProfile';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useNotifications';
import { useTheme } from '@/ui/theme/ThemeContext';
import { Avatar } from '@/ui/primitives/Avatar';

const navItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/groups', label: 'Groups', icon: 'groups' },
  { to: '/balances', label: 'Balances', icon: 'balances' },
  { to: '/profile', label: 'Activity & Profile', icon: 'profile', shortLabel: 'Activity' },
];

function NavIcon({ name, isActive }: { name: string; isActive: boolean }) {
  const strokeColor = isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)';
  const strokeWidth = isActive ? 2.4 : 1.8;

  if (name === 'home') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20V9.5z" />
        <polyline points="9 21 9 12 15 12 15 21" />
      </svg>
    );
  }
  if (name === 'groups') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === 'balances') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10" />
        <path d="M15 9.5H9.5a2.5 2.5 0 0 0 0 5h5" />
      </svg>
    );
  }
  if (name === 'profile') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  return null;
}

export function AppShell() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id ?? '');
  const { data: unreadCount } = useUnreadNotificationCount(user?.id ?? '');
  const { setTheme, isDark } = useTheme();
  const location = useLocation();

  const displayName = profile?.name || user?.email?.split('@')[0] || 'You';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      {/* Desktop Top Header (Hidden on Mobile) */}
      <header className="hidden md:block sticky top-0 z-40 border-b border-[var(--color-border)] glass-surface">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 pressable">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-[var(--color-text-primary)]">
              Splitwise
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to) ||
                    (item.to === '/profile' && location.pathname.startsWith('/notifications'));

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all pressable ${
                    isActive
                      ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <NavIcon name={item.icon} isActive={isActive} />
                    <span>{item.label}</span>
                    {item.to === '/profile' && typeof unreadCount === 'number' && unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[var(--color-owe)] text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Right Controls (Theme toggle & Avatar) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors pressable"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <NavLink to="/profile" className="pressable" title={displayName}>
              <Avatar name={displayName} size="sm" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content Area: Centered Shell on Desktop */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 safe-bottom">
        <Outlet />
      </main>

      {/* Mobile Persistent Bottom Tab Bar (Hidden on Desktop) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] glass-surface"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Mobile Navigation"
      >
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to) ||
                  (item.to === '/profile' && location.pathname.startsWith('/notifications'));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className="flex-1 relative flex flex-col items-center justify-center py-1 select-none pressable"
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div
                    className="absolute top-0 w-8 h-1 rounded-full shadow-sm"
                    style={{ background: 'var(--gradient-primary)' }}
                  />
                )}

                <div className="relative">
                  <NavIcon name={item.icon} isActive={isActive} />
                  {item.to === '/profile' && typeof unreadCount === 'number' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-[var(--color-owe)] text-white min-w-[15px] text-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                <span
                  className="text-[11px] font-medium tracking-tight mt-0.5 transition-colors"
                  style={{
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {item.shortLabel ?? item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
