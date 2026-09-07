import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroups } from '../hooks/useGroups';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GroupAvatar } from '@/ui/primitives/GroupAvatar';
import { Card } from '@/ui/primitives/Card';
import { Badge } from '@/ui/primitives/Badge';
import { EmptyState } from '@/ui/primitives/EmptyState';
import { Skeleton } from '@/ui/primitives/Skeleton';

export function GroupList({ onOpenCreate }: { onOpenCreate: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: groups, isLoading: groupsLoading } = useGroups(user?.id ?? '');
  const { data: balances } = useBalances(user?.id ?? '');

  const obligations = balances?.obligations ?? [];

  // Map each groupId to the current user's net balance within that group
  const groupBalances = useMemo(() => {
    const map: Record<string, number> = {};
    if (!user) return map;

    for (const ob of obligations) {
      if (!ob.groupId) continue;
      const remaining = ob.originalAmount - ob.settledAmount;
      if (remaining <= 0) continue;

      if (!map[ob.groupId]) map[ob.groupId] = 0;
      if (ob.creditorId === user.id) {
        map[ob.groupId] += remaining;
      } else if (ob.debtorId === user.id) {
        map[ob.groupId] -= remaining;
      }
    }
    return map;
  }, [obligations, user]);

  if (groupsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex items-center gap-4">
            <Skeleton variant="rounded" width={52} height={52} />
            <div className="flex-1 space-y-2">
              <Skeleton width="50%" height={16} />
              <Skeleton width="30%" height={12} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <EmptyState
        emoji="👥"
        title="Your first group is waiting ✨"
        description="Create a group for trips, roommates, dinners, or anything you share."
        actionLabel="Create Group"
        onAction={onOpenCreate}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {groups.map((group) => {
        const netGroupBalance = groupBalances[group.id] ?? 0;

        return (
          <Card
            key={group.id}
            interactive
            onClick={() => navigate(`/groups/${group.id}`)}
            className="flex items-center justify-between p-4 sm:p-5"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <GroupAvatar name={group.name} size="lg" />
              <div className="min-w-0">
                <h3 className="font-display font-bold text-base text-[var(--color-text-primary)] truncate">
                  {group.name}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
                  Created {new Date(group.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <div className="mt-2">
                  {netGroupBalance > 0 ? (
                    <Badge
                      direction="owed"
                      amount={`₹${netGroupBalance.toLocaleString('en-IN')}`}
                    />
                  ) : netGroupBalance < 0 ? (
                    <Badge
                      direction="owe"
                      amount={`₹${Math.abs(netGroupBalance).toLocaleString('en-IN')}`}
                    />
                  ) : (
                    <Badge direction="settled" label="Settled" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 pl-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
