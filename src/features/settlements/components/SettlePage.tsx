import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useUserNames } from '@/features/users/hooks/useUserNames';
import { SettleForm } from './SettleForm';
import { Card } from '@/ui/primitives/Card';
import { Button } from '@/ui/primitives/Button';
import { Avatar } from '@/ui/primitives/Avatar';
import { Badge } from '@/ui/primitives/Badge';
import { Sheet } from '@/ui/primitives/Sheet';
import { EmptyState } from '@/ui/primitives/EmptyState';
import { Skeleton } from '@/ui/primitives/Skeleton';

interface SettlingDebt {
  from: string;
  to: string;
  amount: number;
  toName: string;
}

export function SettlePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: balances, isLoading } = useBalances(user?.id ?? '');
  const [settlingDebt, setSettlingDebt] = useState<SettlingDebt | null>(null);

  const simplified = balances?.simplified ?? [];

  // Debts user owes
  const userDebts = useMemo(() => {
    return simplified.filter((d) => d.from === user?.id);
  }, [simplified, user]);

  // Debts owed to user
  const debtsOwedToUser = useMemo(() => {
    return simplified.filter((d) => d.to === user?.id);
  }, [simplified, user]);

  // Unique user IDs for name resolution
  const userIds = useMemo(() => {
    const ids = new Set<string>();
    simplified.forEach((d) => {
      ids.add(d.from);
      ids.add(d.to);
    });
    return Array.from(ids);
  }, [simplified]);

  const { data: userProfiles } = useUserNames(userIds);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-xl mx-auto pb-12">
        <Skeleton height={32} width={160} />
        <Skeleton height={140} />
      </div>
    );
  }

  const isAllSettled = userDebts.length === 0 && debtsOwedToUser.length === 0;

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-1 pressable"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Settle Up
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
            Clear balances with your friends in one tap
          </p>
        </div>
      </div>

      {/* Settle Flow Sheet / Modal */}
      {settlingDebt && (
        <Sheet
          isOpen={true}
          onClose={() => setSettlingDebt(null)}
          title={`Settle with ${settlingDebt.toName}`}
          subtitle={`Pay outstanding balance of ₹${settlingDebt.amount.toLocaleString('en-IN')}`}
        >
          <SettleForm
            toUserId={settlingDebt.to}
            toUserName={settlingDebt.toName}
            maxAmount={settlingDebt.amount}
            onSuccess={() => setSettlingDebt(null)}
            onCancel={() => setSettlingDebt(null)}
          />
        </Sheet>
      )}

      {/* Section 1: Debts You Owe */}
      {userDebts.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-owe)] mb-3 px-1 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
            </svg>
            <span>You Owe ({userDebts.length})</span>
          </h2>

          <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
            {userDebts.map((debt, i) => {
              const toName = userProfiles?.[debt.to]?.name || 'Friend';

              return (
                <div
                  key={i}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-[var(--color-surface-sunken)] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar name={toName} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                        {toName}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Outstanding balance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-sm text-amount text-[var(--color-owe)]">
                        ₹{debt.amount.toLocaleString('en-IN')}
                      </span>
                      <div className="mt-0.5">
                        <Badge direction="owe" label="you owe" />
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setSettlingDebt({
                          from: debt.from,
                          to: debt.to,
                          amount: debt.amount,
                          toName,
                        })
                      }
                    >
                      Settle
                    </Button>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Section 2: Debts Owed To You */}
      {debtsOwedToUser.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-owed)] mb-3 px-1 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
            <span>Owed to You ({debtsOwedToUser.length})</span>
          </h2>

          <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
            {debtsOwedToUser.map((debt, i) => {
              const fromName = userProfiles?.[debt.from]?.name || 'Friend';

              return (
                <div
                  key={i}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-[var(--color-surface-sunken)] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar name={fromName} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                        {fromName}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Will settle with you
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-sm text-amount text-[var(--color-owed)]">
                      ₹{debt.amount.toLocaleString('en-IN')}
                    </span>
                    <div className="mt-0.5">
                      <Badge direction="owed" label="owes you" />
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* All settled empty state */}
      {isAllSettled && (
        <EmptyState
          emoji="🎉"
          title="You're all settled up!"
          description="Zero pending debts. You don't owe anyone and nobody owes you."
          actionLabel="Go to Home"
          onAction={() => navigate('/')}
        />
      )}
    </div>
  );
}
