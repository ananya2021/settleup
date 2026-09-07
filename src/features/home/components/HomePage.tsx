import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/users/hooks/useProfile';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useUserNames } from '@/features/users/hooks/useUserNames';
import { formatMoney, createMoneyOrZero } from '@/domain/entities/Money';
import { Card } from '@/ui/primitives/Card';
import { Button } from '@/ui/primitives/Button';
import { Badge } from '@/ui/primitives/Badge';
import { GroupAvatar } from '@/ui/primitives/GroupAvatar';
import { Avatar } from '@/ui/primitives/Avatar';
import { EmptyState } from '@/ui/primitives/EmptyState';
import { Skeleton } from '@/ui/primitives/Skeleton';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useProfile(user?.id ?? '');
  const { data: balances, isLoading: balancesLoading } = useBalances(user?.id ?? '');
  const { data: groups, isLoading: groupsLoading } = useGroups(user?.id ?? '');

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Friend';
  const greeting = getTimeOfDayGreeting();

  const netBalance = balances?.netBalance ?? 0;
  const obligations = balances?.obligations ?? [];
  const pairwise = balances?.pairwise ?? {};

  // Extract involved user IDs to resolve names
  const involvedUserIds = useMemo(() => {
    const ids = new Set<string>();
    obligations.forEach((o) => {
      if (o.creditorId) ids.add(o.creditorId);
      if (o.debtorId) ids.add(o.debtorId);
    });
    return Array.from(ids);
  }, [obligations]);

  const { data: userNameMap } = useUserNames(involvedUserIds);

  // Compute helper line contextually from real obligations data
  const helperLine = useMemo(() => {
    if (balancesLoading) return 'Calculating balances…';
    if (netBalance === 0) return "You're all settled 🎉 No outstanding debts.";

    const peopleWhoOweUser = Object.values(pairwise).filter((b) => b > 0).length;
    const peopleUserOwes = Object.values(pairwise).filter((b) => b < 0).length;

    if (netBalance > 0) {
      return `${peopleWhoOweUser} ${peopleWhoOweUser === 1 ? 'person owes' : 'people owe'} you money. You have ₹${netBalance.toLocaleString('en-IN')} to collect.`;
    } else {
      return `You owe ₹${Math.abs(netBalance).toLocaleString('en-IN')} across ${peopleUserOwes} ${peopleUserOwes === 1 ? 'relationship' : 'relationships'}.`;
    }
  }, [balancesLoading, netBalance, pairwise]);

  // Recent activity: sort obligations by date desc, top 5
  const recentActivity = useMemo(() => {
    return [...obligations]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }, [obligations]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            {greeting} 👋
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mt-0.5 tracking-tight">
            {displayName}
          </h1>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="pressable rounded-full p-0.5 border-2 border-transparent hover:border-[var(--color-accent)] transition-colors"
          aria-label="View profile"
        >
          <Avatar name={displayName} size="md" />
        </button>
      </div>

      {/* Hero Balance Card */}
      <div
        className="relative overflow-hidden rounded-[24px] p-6 sm:p-8 text-white shadow-xl transition-all select-none"
        style={{
          background:
            netBalance > 0
              ? 'var(--gradient-owed)'
              : netBalance < 0
              ? 'var(--gradient-owe)'
              : 'var(--gradient-primary)',
        }}
      >
        {/* Soft decorative background circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium tracking-wide uppercase text-white/80">
              Total Balance
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
              {netBalance > 0 ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                  </svg>
                  <span>You're owed</span>
                </>
              ) : netBalance < 0 ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                  </svg>
                  <span>You owe</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Settled up</span>
                </>
              )}
            </span>
          </div>

          <div>
            {balancesLoading ? (
              <div className="h-10 w-44 bg-white/20 rounded-xl animate-pulse" />
            ) : (
              <p className="text-amount-hero tracking-tight">
                {netBalance < 0 ? '-' : netBalance > 0 ? '+' : ''}
                {formatMoney(createMoneyOrZero(Math.abs(netBalance)))}
              </p>
            )}
            <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed font-medium">
              {helperLine}
            </p>
          </div>

          {netBalance !== 0 && (
            <div className="pt-2 flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/settle')}
                className="bg-white text-gray-900 border-none hover:bg-white/90 shadow-md font-bold"
              >
                Settle Up
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/balances')}
                className="text-white hover:bg-white/20"
              >
                View Breakdown →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Row */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
          {/* 1. Add Expense */}
          <button
            onClick={() => navigate('/expenses/new')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] shadow-sm pressable"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-text-primary)] text-center">
              Add Expense
            </span>
          </button>

          {/* 2. Settle Up */}
          <button
            onClick={() => navigate('/settle')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] shadow-sm pressable"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm"
              style={{ background: 'var(--gradient-owed)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-text-primary)] text-center">
              Settle Up
            </span>
          </button>

          {/* 3. New Group */}
          <button
            onClick={() => navigate('/groups')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] shadow-sm pressable"
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-[var(--color-accent)] bg-[var(--color-accent-light)] mb-2"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-text-primary)] text-center">
              New Group
            </span>
          </button>

          {/* 4. Request Money (Coming Soon per Step 0 inspection) */}
          <div
            className="relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)] opacity-60 cursor-not-allowed select-none"
            title="Request Money requires additional payment gateway integration (Coming Soon)"
          >
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[var(--color-border)] text-[var(--color-text-secondary)]">
              Soon
            </span>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[var(--color-text-tertiary)] bg-[var(--color-surface-raised)] mb-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-text-secondary)] text-center">
              Request
            </span>
          </div>
        </div>
      </div>

      {/* Your Groups Preview */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Your Groups
          </h3>
          {groups && groups.length > 0 && (
            <button
              onClick={() => navigate('/groups')}
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline pressable"
            >
              See All ({groups.length})
            </button>
          )}
        </div>

        {groupsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <Card key={i} className="flex items-center gap-3">
                <Skeleton variant="rounded" width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} />
                </div>
              </Card>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.slice(0, 4).map((g) => (
              <Card
                key={g.id}
                interactive
                onClick={() => navigate(`/groups/${g.id}`)}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <GroupAvatar name={g.name} size="md" />
                  <div className="min-w-0">
                    <h4 className="font-display font-semibold text-sm text-[var(--color-text-primary)] truncate">
                      {g.name}
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      Created {new Date(g.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="👥"
            title="Your first group is waiting ✨"
            description="Create a group for trips, roommates, dinners, or anything you share."
            actionLabel="Create Group"
            onAction={() => navigate('/groups')}
          />
        )}
      </div>

      {/* Recent Activity Feed */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Recent Activity
          </h3>
          {recentActivity.length > 0 && (
            <button
              onClick={() => navigate('/balances')}
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline pressable"
            >
              All Debts
            </button>
          )}
        </div>

        {balancesLoading ? (
          <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton width="40%" height={14} />
                    <Skeleton width="60%" height={12} />
                  </div>
                </div>
                <Skeleton width={60} height={16} />
              </div>
            ))}
          </Card>
        ) : recentActivity.length > 0 ? (
          <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
            {recentActivity.map((ob) => {
              const isCreditor = ob.creditorId === user?.id;
              const otherUserId = isCreditor ? ob.debtorId : ob.creditorId;
              const otherName = userNameMap?.[otherUserId]?.name || 'Member';
              const remaining = ob.originalAmount - ob.settledAmount;

              return (
                <div
                  key={ob.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--color-surface-sunken)] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar name={otherName} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {isCreditor ? `${otherName} owes you` : `You owe ${otherName}`}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">
                        {ob.source === 'group_expense' ? 'Group Expense' : 'Direct Debt'} ·{' '}
                        {new Date(ob.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className={`text-amount text-sm ${
                        isCreditor ? 'text-[var(--color-owed)]' : 'text-[var(--color-owe)]'
                      }`}
                    >
                      {isCreditor ? '+' : '-'}₹{remaining.toLocaleString('en-IN')}
                    </span>
                    <Badge
                      direction={isCreditor ? 'owed' : 'owe'}
                      label={isCreditor ? 'owed' : 'owe'}
                      className="mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              No recent expenses yet. Add an expense or create a group to start tracking!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
