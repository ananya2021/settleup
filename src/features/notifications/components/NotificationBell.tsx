import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadNotificationCount(user?.id ?? '');

  return (
    <Link
      to="/profile"
      className="relative w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)] transition-colors pressable"
      aria-label="View notifications"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount !== undefined && unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 text-white rounded-full flex items-center justify-center font-bold text-[10px] min-w-[17px] h-[17px] px-1"
          style={{ background: 'var(--color-owe)' }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
