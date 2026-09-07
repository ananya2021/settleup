import { useNotifications, useMarkNotificationRead } from '../hooks/useNotifications';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Card } from '@/ui/primitives/Card';
import { EmptyState } from '@/ui/primitives/EmptyState';
import { Skeleton } from '@/ui/primitives/Skeleton';

export function NotificationList() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications(user?.id ?? '');
  const markRead = useMarkNotificationRead();

  if (isLoading) {
    return (
      <div className="space-y-3 max-w-xl mx-auto pb-12">
        <Skeleton height={28} width={140} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={72} />
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="max-w-xl mx-auto pb-12 space-y-4">
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Notifications
        </h1>
        <EmptyState
          emoji="🔔"
          title="All caught up!"
          description="You have no notifications. Updates on expenses and settlements will show up here."
        />
      </div>
    );
  }

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12">
      <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
        Notifications
      </h1>
      <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => !notification.read && handleMarkRead(notification.id)}
            className={`p-4 sm:p-5 flex items-start gap-3 transition-colors cursor-pointer ${
              notification.read
                ? 'bg-[var(--color-surface-raised)] opacity-75'
                : 'bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-sunken)]'
            }`}
          >
            <div className="pt-1.5 flex-shrink-0">
              {!notification.read ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] shadow-sm" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className={`text-sm font-semibold truncate ${
                    !notification.read
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {notification.title}
                </p>
                <span className="text-[11px] text-[var(--color-text-tertiary)] flex-shrink-0">
                  {new Date(notification.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                {notification.body}
              </p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
