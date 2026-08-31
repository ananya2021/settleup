import { useIndividualDebts } from '../hooks/useIndividualDebts';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatMoney } from '@/domain/entities/Money';

export function IndividualDebtList() {
  const { user } = useAuth();
  const { data: debts, isLoading } = useIndividualDebts(user?.id ?? '');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card h-20" />
        ))}
      </div>
    );
  }

  if (!debts || debts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <p className="font-medium text-text-primary mb-1">No debts yet</p>
        <p className="text-sm text-text-secondary">Personal debts will appear here</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {debts.map((debt, index) => {
        const isCreditor = debt.creditorId === user?.id;
        return (
          <div
            key={debt.id}
            className={`flex items-center justify-between p-4 ${
              index < debts.length - 1 ? 'border-b border-border/50' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                isCreditor ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                {isCreditor ? '↑' : '↓'}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text-primary truncate">{debt.description}</p>
                <p className="text-sm text-text-secondary">
                  {isCreditor ? 'You lent' : 'You borrowed'} · {new Date(debt.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className={`font-semibold flex-shrink-0 ${isCreditor ? 'text-success' : 'text-error'}`}>
              {isCreditor ? '+' : '-'}{formatMoney(debt.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
