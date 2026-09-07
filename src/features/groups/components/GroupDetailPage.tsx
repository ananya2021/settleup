import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGroups, useGroupMembers } from '../hooks/useGroups';
import { useGroupExpenses } from '@/features/expenses/hooks/useExpenses';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useUserNames } from '@/features/users/hooks/useUserNames';
import { GroupMemberList } from './GroupMemberList';
import { AddMemberModal } from './AddMemberModal';
import { InviteMembersModal } from './InviteMembersModal';
import { GroupAvatar } from '@/ui/primitives/GroupAvatar';
import { Card } from '@/ui/primitives/Card';
import { Badge } from '@/ui/primitives/Badge';
import { Button } from '@/ui/primitives/Button';
import { Skeleton } from '@/ui/primitives/Skeleton';

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showAddMember, setShowAddMember] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // Group info
  const { data: groups, isLoading: groupsLoading } = useGroups(user?.id ?? '');
  const group = groups?.find((g) => g.id === groupId);

  // Members
  const { data: members } = useGroupMembers(groupId ?? '');

  // Expenses in this group
  const { data: expenses, isLoading: expensesLoading } = useGroupExpenses(groupId ?? '');

  // User balances
  const { data: balances } = useBalances(user?.id ?? '');
  const obligations = balances?.obligations ?? [];

  // Determine if current user is an admin
  const isAdmin = useMemo(() => {
    if (!user || !members) return false;
    return members.some(
      (m: { user_id: string; role: string }) =>
        m.user_id === user.id && m.role === 'admin'
    );
  }, [user, members]);

  // Existing member IDs
  const existingMemberIds = useMemo(() => {
    if (!members) return new Set<string>();
    return new Set(members.map((m: { user_id: string }) => m.user_id));
  }, [members]);

  // Payer IDs for name resolution
  const payerIds = useMemo(() => {
    return Array.from(new Set((expenses ?? []).map((e) => e.paidBy)));
  }, [expenses]);
  const { data: payerNames } = useUserNames(payerIds);

  // Net balance for current user in this group
  const netGroupBalance = useMemo(() => {
    if (!user || !groupId) return 0;
    let sum = 0;
    for (const ob of obligations) {
      if (ob.groupId !== groupId) continue;
      const remaining = ob.originalAmount - ob.settledAmount;
      if (remaining <= 0) continue;

      if (ob.creditorId === user.id) {
        sum += remaining;
      } else if (ob.debtorId === user.id) {
        sum -= remaining;
      }
    }
    return sum;
  }, [obligations, groupId, user]);

  if (!groupId) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Group not found</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/groups')} className="mt-4">
          Back to Groups
        </Button>
      </div>
    );
  }

  if (groupsLoading || !group) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Skeleton variant="rounded" height={160} />
        <Skeleton variant="rounded" height={220} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 relative">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/groups')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors pressable"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>All Groups</span>
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddMember(true)}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add Member
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInvite(true)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            }
          >
            Invite
          </Button>
        </div>
      </div>

      {/* Group Hero Card */}
      <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left overflow-hidden relative">
        <GroupAvatar name={group.name} size="xl" className="shadow-md flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] truncate">
                {group.name}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
                {members?.length ?? 0} {members?.length === 1 ? 'member' : 'members'} · Created{' '}
                {new Date(group.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex justify-center sm:justify-end">
              {netGroupBalance > 0 ? (
                <Badge
                  direction="owed"
                  label="You are owed"
                  amount={`₹${netGroupBalance.toLocaleString('en-IN')}`}
                />
              ) : netGroupBalance < 0 ? (
                <Badge
                  direction="owe"
                  label="You owe"
                  amount={`₹${Math.abs(netGroupBalance).toLocaleString('en-IN')}`}
                />
              ) : (
                <Badge direction="settled" label="Group Settled" />
              )}
            </div>
          </div>

          {/* Quick Actions inside Hero */}
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-4 pt-3 border-t border-[var(--color-border-light)]">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/expenses/new?group=${groupId}`)}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add Expense
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/settle')}
            >
              Settle Debts
            </Button>
          </div>
        </div>
      </Card>

      {/* Members Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Group Members ({members?.length ?? 0})
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowAddMember(true)}
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline pressable"
            >
              + Add Member
            </button>
          )}
        </div>
        <GroupMemberList groupId={groupId} />
      </div>

      {/* Expenses Feed Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Group Expenses
          </h2>
          <button
            onClick={() => navigate(`/expenses/new?group=${groupId}`)}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline pressable"
          >
            + Add Expense
          </button>
        </div>

        {expensesLoading ? (
          <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="rounded" width={38} height={38} />
                  <div className="space-y-1.5">
                    <Skeleton width={140} height={14} />
                    <Skeleton width={90} height={12} />
                  </div>
                </div>
                <Skeleton width={50} height={16} />
              </div>
            ))}
          </Card>
        ) : expenses && expenses.length > 0 ? (
          <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
            {expenses.map((expense) => {
              const isUserPayer = expense.paidBy === user?.id;
              const payerName = isUserPayer ? 'You' : payerNames?.[expense.paidBy]?.name || 'Member';
              const splitCount = expense.splits?.length || members?.length || 2;

              return (
                <div
                  key={expense.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--color-surface-sunken)] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                      style={{ background: 'var(--color-surface-sunken)' }}
                    >
                      💳
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                        <strong className="text-[var(--color-text-primary)] font-medium">{payerName}</strong> paid ₹{expense.totalAmount.toLocaleString('en-IN')} · Split across {splitCount} people
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-bold text-sm text-amount text-[var(--color-text-primary)]">
                      ₹{expense.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                      {new Date(expense.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-3xl mb-2">🍕</div>
            <h3 className="font-display text-sm font-bold text-[var(--color-text-primary)] mb-1">
              Nothing to split yet
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Add your first shared expense for dinner, tickets, or groceries.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/expenses/new?group=${groupId}`)}
            >
              Add Expense
            </Button>
          </Card>
        )}
      </div>

      {/* Floating Action Button (FAB) for Add Expense */}
      <button
        onClick={() => navigate(`/expenses/new?group=${groupId}`)}
        className="fixed bottom-20 md:bottom-8 right-5 md:right-8 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl pressable"
        style={{ background: 'var(--gradient-primary)' }}
        aria-label="Add expense"
        title="Add Expense"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          groupId={groupId}
          existingMemberIds={existingMemberIds}
          onClose={() => setShowAddMember(false)}
        />
      )}

      {showInvite && (
        <InviteMembersModal
          groupId={groupId}
          groupName={group.name}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
