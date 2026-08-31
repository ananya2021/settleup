import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadNotificationCount(user?.id ?? '');

  return (
    <Link
      to="/notifications"
      className="relative w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-active transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount !== undefined && unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
