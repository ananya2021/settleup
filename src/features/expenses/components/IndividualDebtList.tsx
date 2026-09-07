import { useIndividualDebts } from '../hooks/useIndividualDebts';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatMoney } from '@/domain/entities/Money';
import { Card } from '@/ui/primitives/Card';
import { Badge } from '@/ui/primitives/Badge';
import { EmptyState } from '@/ui/primitives/EmptyState';
import { Skeleton } from '@/ui/primitives/Skeleton';

export function IndividualDebtList() {
  const { user } = useAuth();
  const { data: debts, isLoading } = useIndividualDebts(user?.id ?? '');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={64} />
        ))}
      </div>
    );
  }

  if (!debts || debts.length === 0) {
    return (
      <EmptyState
        emoji="🤝"
        title="No direct debts"
        description="Debts recorded directly between you and friends without a group appear here."
      />
    );
  }

  return (
    <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
      {debts.map((debt) => {
        const isCreditor = debt.creditorId === user?.id;
        return (
          <div
            key={debt.id}
            className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-sunken)] transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold shadow-sm flex-shrink-0"
                style={{
                  backgroundColor: isCreditor ? 'var(--color-owed-light)' : 'var(--color-owe-light)',
                  color: isCreditor ? 'var(--color-owed)' : 'var(--color-owe)',
                }}
              >
                {isCreditor ? '↑' : '↓'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                  {debt.description}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                  {isCreditor ? 'You lent' : 'You borrowed'} · {new Date(debt.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
              <span
                className={`text-amount text-sm font-bold ${
                  isCreditor ? 'text-[var(--color-owed)]' : 'text-[var(--color-owe)]'
                }`}
              >
                {isCreditor ? '+' : '-'}₹{formatMoney(debt.amount).replace('₹', '')}
              </span>
              <Badge
                direction={isCreditor ? 'owed' : 'owe'}
                label={isCreditor ? 'lent' : 'borrowed'}
                className="mt-0.5"
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
