import { useNotifications, useMarkNotificationRead } from '../hooks/useNotifications';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function NotificationList() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications(user?.id ?? '');
  const markRead = useMarkNotificationRead();

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton-card h-20 mb-3" />
        <div className="skeleton-card h-20 mb-3" />
        <div className="skeleton-card h-20" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Notifications</h1>
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="font-medium text-text-primary mb-1">All caught up</p>
          <p className="text-sm text-text-secondary">No notifications yet</p>
        </div>
      </div>
    );
  }

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <div className="page-container pb-24">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Notifications</h1>
      <div className="card overflow-hidden">
        {notifications.map((notification, i) => (
          <div
            key={notification.id}
            onClick={() => !notification.read && handleMarkRead(notification.id)}
            className={`p-4 transition-colors cursor-pointer ${
              !notification.read ? 'hover:bg-surface-active' : 'opacity-75'
            } ${
              i < notifications.length - 1 ? 'border-b border-border/50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Unread indicator */}
              <div className="pt-2 flex-shrink-0">
                {!notification.read ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                ) : (
                  <div className="w-2.5 h-2.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.read ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {notification.body}
                </p>
                <p className="text-xs text-text-tertiary mt-1.5">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
