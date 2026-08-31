import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { SettleForm } from './SettleForm';
import { formatMoney, createMoneyOrZero } from '@/domain/entities/Money';

interface SettlingDebt {
  from: string; // debtor (current user pays)
  to: string;   // creditor
  amount: number;
}

export function SettlePage() {
  const { user } = useAuth();
  const { data: balances, isLoading } = useBalances(user?.id ?? '');
  const [settlingDebt, setSettlingDebt] = useState<SettlingDebt | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton-card h-24 mb-4" />
        <div className="skeleton-card h-32 mb-4" />
        <div className="skeleton-card h-32" />
      </div>
    );
  }

  if (!balances) return null;

  // Find debts where current user is the debtor (they owe money)
  const userDebts = balances.simplified.filter(
    (d) => d.from === user?.id
  );

  // Also show debts where current user is the creditor (others owe them)
  const debtsOwedToUser = balances.simplified.filter(
    (d) => d.to === user?.id
  );

  const handleSettleSuccess = () => {
    setSettlingDebt(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="page-container pb-24">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settle Up</h1>

      {/* Success Feedback */}
      {showSuccess && (
        <div className="card p-4 mb-6 flex items-center gap-3 bg-success/5">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-medium text-success">Settlement recorded!</p>
        </div>
      )}

      {/* Settlement Form (inline) */}
      {settlingDebt && (
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              {settlingDebt.to.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-text-primary">Settling debt</p>
              <p className="text-sm text-text-secondary">Max ₹{settlingDebt.amount}</p>
            </div>
          </div>
          <SettleForm
            toUserId={settlingDebt.to}
            maxAmount={settlingDebt.amount}
            onSuccess={handleSettleSuccess}
            onCancel={() => setSettlingDebt(null)}
          />
        </div>
      )}

      {/* Debts You Owe */}
      {userDebts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-1">
            You Owe
          </h2>
          <div className="card overflow-hidden">
            {userDebts.map((debt, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 ${
                  i < userDebts.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {debt.to.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {debt.to.slice(0, 12)}…
                    </p>
                    <p className="text-sm text-text-secondary">Outstanding</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-semibold text-error">
                    {formatMoney(createMoneyOrZero(debt.amount))}
                  </span>
                  <button
                    onClick={() => setSettlingDebt(debt)}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Settle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debts Owed to You */}
      {debtsOwedToUser.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-1">
            Owed to You
          </h2>
          <div className="card overflow-hidden">
            {debtsOwedToUser.map((debt, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 ${
                  i < debtsOwedToUser.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {debt.from.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {debt.from.slice(0, 12)}…
                    </p>
                    <p className="text-sm text-text-secondary">Outstanding</p>
                  </div>
                </div>
                <span className="font-semibold text-success flex-shrink-0">
                  {formatMoney(createMoneyOrZero(debt.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No debts — empty state */}
      {userDebts.length === 0 && debtsOwedToUser.length === 0 && (
        <div className="card p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-text-primary mb-1">All settled up!</p>
          <p className="text-sm text-text-secondary">No outstanding debts</p>
        </div>
      )}
    </div>
  );
}
