import { useState, type FormEvent } from 'react';
import { useSettle } from '@/features/expenses/hooks/useExpenses';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AmountInput } from '@/ui/primitives/AmountInput';
import { Button } from '@/ui/primitives/Button';
import { SegmentedControl } from '@/ui/primitives/SegmentedControl';
import { SuccessCheck } from '@/ui/primitives/SuccessCheck';

interface Props {
  toUserId: string;
  toUserName?: string;
  maxAmount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'upi' | 'cash' | 'other';

export function SettleForm({
  toUserId,
  toUserName = 'Friend',
  maxAmount,
  onSuccess,
  onCancel,
}: Props) {
  const { user } = useAuth();
  const settle = useSettle();

  const [amount, setAmount] = useState(String(maxAmount));
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const amountNum = parseInt(amount, 10);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive whole number');
      return;
    }

    if (amountNum > maxAmount) {
      setError(`Maximum debt amount is ₹${maxAmount.toLocaleString('en-IN')}`);
      return;
    }

    try {
      await settle.mutateAsync({
        fromUserId: user.id,
        toUserId,
        amount: amountNum,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record settlement');
    }
  };

  if (success) {
    return (
      <SuccessCheck
        title="All Settled! 🎉"
        message={`Successfully marked ₹${amountNum.toLocaleString('en-IN')} paid to ${toUserName}.`}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount Input */}
      <div>
        <label className="block text-center text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
          Settlement Amount
        </label>
        <AmountInput
          value={amount}
          onChange={setAmount}
          placeholder={String(maxAmount)}
          autoFocus
        />
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={() => setAmount(String(maxAmount))}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] hover:underline pressable"
          >
            Pay Full Balance (₹{maxAmount.toLocaleString('en-IN')})
          </button>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
          Payment Method
        </label>
        <SegmentedControl<PaymentMethod>
          options={[
            {
              value: 'upi',
              label: 'UPI / GPay',
              icon: <span>⚡</span>,
            },
            {
              value: 'cash',
              label: 'Cash',
              icon: <span>💵</span>,
            },
            {
              value: 'other',
              label: 'Other',
              icon: <span>🏦</span>,
            },
          ]}
          value={method}
          onChange={(m) => setMethod(m)}
        />
        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1.5 text-center">
          Payment method recorded for your personal reference
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl text-xs font-semibold bg-[var(--color-owe-light)] text-[var(--color-owe)]">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="positive"
          fullWidth={!onCancel}
          className="flex-1"
          disabled={settle.isPending || isNaN(amountNum) || amountNum <= 0}
          loading={settle.isPending}
        >
          {settle.isPending
            ? 'Recording…'
            : `Mark Settled${amountNum > 0 ? ` (₹${amountNum.toLocaleString('en-IN')})` : ''}`}
        </Button>
      </div>
    </form>
  );
}
