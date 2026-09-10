import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/users/hooks/useProfile';
import { useNotifications, useMarkNotificationRead } from '@/features/notifications/hooks/useNotifications';
import { useTheme, type Theme } from '@/ui/theme/ThemeContext';
import { Avatar } from '@/ui/primitives/Avatar';
import { Card } from '@/ui/primitives/Card';
import { Button } from '@/ui/primitives/Button';
import { SegmentedControl } from '@/ui/primitives/SegmentedControl';
import { EmptyState } from '@/ui/primitives/EmptyState';
import { Skeleton } from '@/ui/primitives/Skeleton';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id ?? '');
  const { data: notifications, isLoading: notifsLoading } = useNotifications(user?.id ?? '');
  const markRead = useMarkNotificationRead();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'activity' | 'settings'>('activity');
  const [copiedId, setCopiedId] = useState(false);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const email = profile?.email || user?.email || '';

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const appearanceOptions = [
    {
      value: 'light' as Theme,
      label: 'Light',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        </svg>
      ),
    },
    {
      value: 'dark' as Theme,
      label: 'Dark',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    {
      value: 'system' as Theme,
      label: 'System',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* Profile Header Card */}
      <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
        {profileLoading ? (
          <Skeleton variant="circular" width={64} height={64} />
        ) : (
          <Avatar name={displayName} size="xl" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] truncate">
            {displayName}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] truncate mt-0.5">
            {email}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent-light)] text-[var(--color-accent)]">
              SplitPay Member
            </span>
            {profile?.createdAt && (
              <span className="text-xs text-[var(--color-text-tertiary)]">
                Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Segmented Control Navigation */}
      <SegmentedControl
        options={[
          { value: 'activity', label: 'Activity & Notifications' },
          { value: 'settings', label: 'Preferences & Settings' },
        ]}
        value={activeTab}
        onChange={(val) => setActiveTab(val as 'activity' | 'settings')}
      />

      {/* TAB 1: Activity & Notifications */}
      {activeTab === 'activity' && (
        <div className="space-y-3">
          {notifsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 flex gap-3 items-start">
                  <Skeleton variant="circular" width={32} height={32} />
                  <div className="flex-1 space-y-2">
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="90%" height={12} />
                  </div>
                </Card>
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markRead.mutate(notif.id)}
                  className={`p-4 sm:p-5 flex items-start gap-3 transition-colors cursor-pointer ${
                    notif.read
                      ? 'bg-[var(--color-surface-raised)] opacity-75'
                      : 'bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-sunken)]'
                  }`}
                >
                  <div className="pt-1 flex-shrink-0">
                    {!notif.read ? (
                      <span className="block w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] shadow-sm" />
                    ) : (
                      <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className={`text-sm font-semibold truncate ${
                        !notif.read ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                      }`}>
                        {notif.title}
                      </h4>
                      <span className="text-[11px] text-[var(--color-text-tertiary)] flex-shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                      {notif.body}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <EmptyState
              emoji="🔔"
              title="All caught up!"
              description="When friends add expenses, settle debts, or invite you to groups, you will see notifications here."
            />
          )}
        </div>
      )}

      {/* TAB 2: Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Appearance Card */}
          <Card className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Appearance
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Customize your viewing experience with dark, light, or auto theme.
              </p>
            </div>
            <SegmentedControl<Theme>
              options={appearanceOptions}
              value={theme}
              onChange={(t) => setTheme(t)}
            />
          </Card>

          {/* Currency Card */}
          <Card className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Currency & Locale
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                All amounts are in whole Indian Rupees
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface-sunken)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-mono">
              ₹ INR
            </span>
          </Card>

          {/* Notification Preferences Card */}
          <Card className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Notification Preferences
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Configure your communication channels (backend preferences preview)
              </p>
            </div>
            <div className="space-y-3 text-sm divide-y divide-[var(--color-border-light)]">
              <div className="flex items-center justify-between pt-2">
                <span className="text-[var(--color-text-secondary)]">Email Notifications</span>
                <span className="text-xs font-semibold text-[var(--color-owed)]">
                  {profile?.notificationPreferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-[var(--color-text-secondary)]">Push Notifications</span>
                <span className="text-xs font-semibold text-[var(--color-owed)]">
                  {profile?.notificationPreferences?.pushNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-[var(--color-text-secondary)]">Daily Balance Reminder</span>
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                  {profile?.notificationPreferences?.dailyReminder ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </Card>

          {/* Account Details Card */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Account Details
            </h3>
            <div className="p-3 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)] space-y-1">
              <p className="text-xs text-[var(--color-text-tertiary)]">User ID</p>
              <div className="flex items-center justify-between font-mono text-xs text-[var(--color-text-secondary)]">
                <span className="truncate max-w-[240px] sm:max-w-xs">{user?.id}</span>
                <button
                  onClick={handleCopyId}
                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline ml-2 flex-shrink-0"
                >
                  {copiedId ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </Card>

          {/* Sign Out Button */}
          <div className="pt-2">
            <Button
              variant="secondary"
              fullWidth
              size="lg"
              onClick={() => signOut()}
              className="border-red-200 dark:border-red-950 text-[var(--color-owe)] hover:bg-[var(--color-owe-light)]"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              }
            >
              Sign Out of Splitwise
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
