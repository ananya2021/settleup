import { useState, type FormEvent } from 'react';
import { useCreateWishlistItem } from '../hooks/useWishlist';
import { Button } from '@/ui/primitives/Button';

interface Props {
  groupId?: string;
  onSuccess?: () => void;
}

export function WishlistItemForm({ groupId, onSuccess }: Props) {
  const createItem = useCreateWishlistItem();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const amountNum = amount ? parseInt(amount, 10) : undefined;
    if (amount && (isNaN(amountNum!) || amountNum! <= 0)) {
      setError('Amount must be a positive integer');
      return;
    }

    try {
      await createItem.mutateAsync({
        title,
        description: description || undefined,
        amount: amountNum,
        groupId,
      });
      setTitle('');
      setDescription('');
      setAmount('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
          Item Name
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
          placeholder="Headphones, Board game, Gift..."
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
          placeholder="Add details, links, or notes..."
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
          Estimated Price (₹ INR, optional)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">₹</span>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-semibold outline-none focus:border-[var(--color-accent)] transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl text-xs font-semibold bg-[var(--color-owe-light)] text-[var(--color-owe)]">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        disabled={createItem.isPending || !title.trim()}
        loading={createItem.isPending}
      >
        Add to Wishlist
      </Button>
    </form>
  );
}
