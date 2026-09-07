import { useMemo } from 'react';
import { useGroupMembers } from '../hooks/useGroups';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { Avatar } from '@/ui/primitives/Avatar';
import { Badge } from '@/ui/primitives/Badge';
import { Card } from '@/ui/primitives/Card';
import { Skeleton } from '@/ui/primitives/Skeleton';

interface GroupMemberListProps {
  groupId: string;
}

export function GroupMemberList({ groupId }: GroupMemberListProps) {
  const { user } = useAuth();
  const { data: members, isLoading, error } = useGroupMembers(groupId);
  const { data: balances } = useBalances(user?.id ?? '');

  const obligations = balances?.obligations ?? [];

  // Pairwise balance for each member in this specific group
  const memberBalances = useMemo(() => {
    const map: Record<string, number> = {};
    if (!user) return map;

    for (const ob of obligations) {
      if (ob.groupId !== groupId) continue;
      const remaining = ob.originalAmount - ob.settledAmount;
      if (remaining <= 0) continue;

      if (ob.creditorId === user.id) {
        // Debtor owes current user
        map[ob.debtorId] = (map[ob.debtorId] ?? 0) + remaining;
      } else if (ob.debtorId === user.id) {
        // Current user owes creditor
        map[ob.creditorId] = (map[ob.creditorId] ?? 0) - remaining;
      }
    }
    return map;
  }, [obligations, groupId, user]);

  if (isLoading) {
    return (
      <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="space-y-1.5">
                <Skeleton width={120} height={14} />
                <Skeleton width={80} height={12} />
              </div>
            </div>
            <Skeleton width={60} height={20} />
          </div>
        ))}
      </Card>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-[var(--color-owe-light)] text-[var(--color-owe)] text-xs font-semibold">
        Failed to load group members
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-xs text-[var(--color-text-secondary)]">No members in this group yet.</p>
      </Card>
    );
  }

  return (
    <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
      {members.map(
        (member: {
          user_id: string;
          role: string;
          joined_at: string;
          profiles: { name: string; email: string } | null;
        }) => {
          const isCurrentUser = member.user_id === user?.id;
          const memberName = isCurrentUser
            ? 'You'
            : member.profiles?.name || member.profiles?.email?.split('@')[0] || 'Member';
          const memberEmail = member.profiles?.email || '';
          const memberBalance = memberBalances[member.user_id] ?? 0;

          return (
            <div
              key={member.user_id}
              className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--color-surface-sunken)] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar name={memberName} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                      {memberName}
                    </p>
                    {isCurrentUser && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                        You
                      </span>
                    )}
                    {member.role === 'admin' && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[var(--color-surface-sunken)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                    {memberEmail}
                  </p>
                </div>
              </div>

              {!isCurrentUser && (
                <div className="flex-shrink-0">
                  {memberBalance > 0 ? (
                    <Badge
                      direction="owed"
                      label="owes you"
                      amount={`₹${memberBalance.toLocaleString('en-IN')}`}
                    />
                  ) : memberBalance < 0 ? (
                    <Badge
                      direction="owe"
                      label="you owe"
                      amount={`₹${Math.abs(memberBalance).toLocaleString('en-IN')}`}
                    />
                  ) : (
                    <Badge direction="settled" label="Settled" />
                  )}
                </div>
              )}
            </div>
          );
        }
      )}
    </Card>
  );
}
