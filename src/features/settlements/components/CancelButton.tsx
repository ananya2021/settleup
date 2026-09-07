import { useState } from 'react';
import { useCancelObligation } from '@/features/expenses/hooks/useExpenses';
import { Button } from '@/ui/primitives/Button';

interface Props {
  obligationId: string;
  isCreditor: boolean;
  settledAmount: number;
  onSuccess?: () => void;
}

export function CancelButton({ obligationId, isCreditor, settledAmount, onSuccess }: Props) {
  const cancel = useCancelObligation();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isCreditor) return null;

  const handleCancel = async () => {
    try {
      await cancel.mutateAsync({ obligationId });
      setShowConfirm(false);
      onSuccess?.();
    } catch {
      // Handled by mutation
    }
  };

  if (showConfirm) {
    return (
      <div className="p-3.5 rounded-2xl space-y-2 bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)]">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          {settledAmount > 0
            ? `Cancel this debt? ₹${settledAmount} already settled will become a new debt owed back to you.`
            : 'Cancel this debt? This cannot be undone.'}
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={cancel.isPending}
            loading={cancel.isPending}
          >
            Confirm Cancel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirm(false)}
          >
            Keep
          </Button>
        </div>
        {cancel.isError && (
          <p className="text-xs text-[var(--color-owe)]">{cancel.error.message}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-xs font-semibold text-[var(--color-owe)] hover:underline pressable"
    >
      Cancel
    </button>
  );
}
