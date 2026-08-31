import { useBalances } from '../hooks/useBalances';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatMoney, createMoneyOrZero } from '@/domain/entities/Money';

export function BalanceDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useBalances(user?.id ?? '');

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton-card h-36 mb-4" />
        <div className="skeleton-card h-48" />
      </div>
    );
  }

  if (!data) return null;

  const { netBalance, pairwise, simplified } = data;

  return (
    <div className="page-container pb-24">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Balances</h1>

      {/* Net Balance Hero Card */}
      <div className="card mb-6 overflow-hidden">
        <div className={`p-6 text-center ${netBalance >= 0 ? 'bg-gradient-to-br from-success/5 to-success/10' : 'bg-gradient-to-br from-error/5 to-error/10'}`}>
          <p className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-2">
            Your Balance
          </p>
          <p className={`text-4xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-error'}`}>
            {netBalance >= 0 ? '+' : ''}{formatMoney(createMoneyOrZero(Math.abs(netBalance)))}
          </p>
          <p className="text-sm text-text-secondary mt-2">
            {netBalance > 0 ? 'You are owed money' : netBalance < 0 ? 'You owe money' : 'All settled up'}
          </p>
        </div>
      </div>

      {/* Pairwise Balances */}
      {Object.keys(pairwise).length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-1">
            With Others
          </h2>
          <div className="card overflow-hidden">
            {Object.entries(pairwise).map(([userId, balance], i, arr) => (
              <div
                key={userId}
                className={`flex items-center justify-between p-4 ${
                  i < arr.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                    balance >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {userId.slice(0, 1).toUpperCase()}
                  </div>
                  <p className="font-medium text-text-primary truncate">
                    {userId.slice(0, 12)}…
                  </p>
                </div>
                <span className={`font-semibold flex-shrink-0 ${balance >= 0 ? 'text-success' : 'text-error'}`}>
                  {balance >= 0 ? '+' : ''}{formatMoney(createMoneyOrZero(Math.abs(balance)))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simplified Debts */}
      {simplified.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-1">
            Settle Up
          </h2>
          <div className="card overflow-hidden">
            {simplified.map((debt, i, arr) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 ${
                  i < arr.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    <span className="truncate">{debt.from.slice(0, 10)}…</span>
                    <span className="text-text-tertiary mx-1.5">→</span>
                    <span className="truncate">{debt.to.slice(0, 10)}…</span>
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary flex-shrink-0">
                  {formatMoney(debt.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {simplified.length === 0 && netBalance === 0 && (
        <div className="card p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-text-primary mb-1">All settled up!</p>
          <p className="text-sm text-text-secondary">Nothing to pay. Beautiful.</p>
        </div>
      )}
    </div>
  );
}
