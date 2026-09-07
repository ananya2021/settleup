import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBalances } from '../hooks/useBalances';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserNames } from '@/features/users/hooks/useUserNames';
import { Card } from '@/ui/primitives/Card';
import { Badge } from '@/ui/primitives/Badge';
import { Button } from '@/ui/primitives/Button';
import { Avatar } from '@/ui/primitives/Avatar';
import { EmptyState } from '@/ui/primitives/EmptyState';
import { Skeleton } from '@/ui/primitives/Skeleton';

export function BalanceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useBalances(user?.id ?? '');

  const pairwise = data?.pairwise ?? {};
  const simplified = data?.simplified ?? [];
  const netBalance = data?.netBalance ?? 0;

  // Resolve all unique user IDs involved
  const userIds = useMemo(() => {
    const set = new Set<string>();
    Object.keys(pairwise).forEach((id) => set.add(id));
    simplified.forEach((d) => {
      set.add(d.from);
      set.add(d.to);
    });
    return Array.from(set);
  }, [pairwise, simplified]);

  const { data: userProfiles } = useUserNames(userIds);

  // Totals
  const { totalOwedToUser, totalUserOwes } = useMemo(() => {
    let owed = 0;
    let owe = 0;
    Object.values(pairwise).forEach((val) => {
      if (val > 0) owed += val;
      if (val < 0) owe += Math.abs(val);
    });
    return { totalOwedToUser: owed, totalUserOwes: owe };
  }, [pairwise]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={80} />
          ))}
        </div>
        <Skeleton height={200} />
      </div>
    );
  }

  const pairwiseEntries = Object.entries(pairwise);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Balances
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
            Your combined debts across all groups and friends
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/settle')}>
          Settle Up
        </Button>
      </div>

      {/* Top 3-Card Summary Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* 1. You're Owed */}
        <Card className="p-3.5 sm:p-5 flex flex-col justify-between text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-owed)]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
            <span className="truncate">Owed to you</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-amount text-[var(--color-owed)] mt-2">
            ₹{totalOwedToUser.toLocaleString('en-IN')}
          </p>
        </Card>

        {/* 2. You Owe */}
        <Card className="p-3.5 sm:p-5 flex flex-col justify-between text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-owe)]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
            </svg>
            <span className="truncate">You owe</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-amount text-[var(--color-owe)] mt-2">
            ₹{totalUserOwes.toLocaleString('en-IN')}
          </p>
        </Card>

        {/* 3. Net Balance */}
        <Card className="p-3.5 sm:p-5 flex flex-col justify-between text-left">
          <div className="text-xs font-semibold text-[var(--color-text-secondary)]">
            <span>Net total</span>
          </div>
          <p
            className={`text-lg sm:text-2xl font-bold text-amount mt-2 ${
              netBalance > 0
                ? 'text-[var(--color-owed)]'
                : netBalance < 0
                ? 'text-[var(--color-owe)]'
                : 'text-[var(--color-text-primary)]'
            }`}
          >
            {netBalance < 0 ? '-' : netBalance > 0 ? '+' : ''}₹{Math.abs(netBalance).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* Per-Person Balances List */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3 px-1">
          By Friend ({pairwiseEntries.length})
        </h2>

        {pairwiseEntries.length > 0 ? (
          <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
            {pairwiseEntries.map(([otherId, amount]) => {
              const otherName = userProfiles?.[otherId]?.name || 'Friend';
              const isOwed = amount > 0;
              const isOwe = amount < 0;

              return (
                <div
                  key={otherId}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-[var(--color-surface-sunken)] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar name={otherName} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                        {otherName}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                        {isOwed ? 'Owes you money' : isOwe ? 'You owe money' : 'Settled up'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span
                        className={`font-bold text-sm text-amount ${
                          isOwed ? 'text-[var(--color-owed)]' : 'text-[var(--color-owe)]'
                        }`}
                      >
                        {isOwed ? '+' : '-'}₹{Math.abs(amount).toLocaleString('en-IN')}
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          direction={isOwed ? 'owed' : 'owe'}
                          label={isOwed ? 'owes you' : 'you owe'}
                        />
                      </div>
                    </div>

                    {isOwe && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/settle`)}
                        className="text-xs ml-1"
                      >
                        Settle
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        ) : (
          <EmptyState
            emoji="🎉"
            title="All clear! No balances"
            description="You and your friends are completely squared away. Nothing to collect or pay."
          />
        )}
      </div>

      {/* Suggested Settlements / Simplified Debts */}
      {simplified.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Smart Settle Plan
            </h2>
            <span className="text-xs text-[var(--color-text-secondary)]">
              Minimal transaction route
            </span>
          </div>

          <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
            {simplified.map((debt, index) => {
              const fromName = debt.from === user?.id ? 'You' : userProfiles?.[debt.from]?.name || 'Member';
              const toName = debt.to === user?.id ? 'You' : userProfiles?.[debt.to]?.name || 'Member';
              const isUserDebtor = debt.from === user?.id;

              return (
                <div key={index} className="p-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-[var(--color-text-primary)] truncate">
                      {fromName}
                    </span>
                    <span className="text-[var(--color-text-tertiary)] font-bold">→</span>
                    <span className="font-semibold text-[var(--color-text-primary)] truncate">
                      {toName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-bold text-amount text-[var(--color-accent)]">
                      ₹{debt.amount.toLocaleString('en-IN')}
                    </span>
                    {isUserDebtor && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/settle')}
                      >
                        Pay
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
