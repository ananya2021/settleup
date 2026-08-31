import { useState } from 'react';
import { useCancelObligation } from '@/features/expenses/hooks/useExpenses';

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
      // Error handled by mutation
    }
  };

  if (showConfirm) {
    return (
      <div className="p-3 bg-surface rounded-xl space-y-2">
        <p className="text-sm text-text-secondary">
          {settledAmount > 0
            ? `Cancel this obligation? ₹${settledAmount} already settled will become a new debt owed back to you.`
            : 'Cancel this obligation? This cannot be undone.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={cancel.isPending}
            className="px-4 py-2 bg-error text-white rounded-lg text-sm font-medium hover:bg-error/90 disabled:opacity-50 transition-colors"
          >
            {cancel.isPending ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cancelling...
              </span>
            ) : (
              'Confirm Cancel'
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 text-text-secondary rounded-lg text-sm font-medium hover:bg-border/50 transition-colors"
          >
            Keep
          </button>
        </div>
        {cancel.isError && (
          <p className="text-xs text-error">{cancel.error.message}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm font-medium text-error hover:text-error/80 transition-colors"
    >
      Cancel
    </button>
  );
}
