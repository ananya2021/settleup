import { useState, type FormEvent } from 'react';
import { useSettle } from '@/features/expenses/hooks/useExpenses';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface Props {
  toUserId: string;
  toUserName?: string;
  maxAmount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SettleForm({ toUserId, maxAmount, onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const settle = useSettle();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const amountNum = parseInt(amount, 10);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive integer');
      return;
    }

    if (amountNum > maxAmount) {
      setError(`Maximum amount is ₹${maxAmount}`);
      return;
    }

    try {
      await settle.mutateAsync({
        fromUserId: user.id,
        toUserId,
        amount: amountNum,
      });
      setAmount('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to settle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Amount to settle</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₹</span>
          <input
            type="number"
            min="1"
            max={maxAmount}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="input-field pl-8 text-lg font-semibold"
            placeholder="0"
          />
        </div>
        <p className="text-xs text-text-tertiary mt-1">Max ₹{maxAmount}</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={settle.isPending || isNaN(amountNum) || amountNum <= 0}
          className="btn-primary flex-1 bg-success hover:bg-success/90"
        >
          {settle.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Settling...
            </span>
          ) : (
            `Settle${amountNum > 0 ? ` ₹${amount}` : ''}`
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
