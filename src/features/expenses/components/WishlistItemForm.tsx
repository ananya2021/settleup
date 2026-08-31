import { useState, type FormEvent } from 'react';
import { useCreateWishlistItem } from '../hooks/useWishlist';

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
        <label className="form-label">Item Name</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-field"
          placeholder="Wireless Headphones, Book, Gift..."
        />
      </div>

      <div>
        <label className="form-label">Description <span className="text-text-tertiary font-normal">(optional)</span></label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="Any details..."
        />
      </div>

      <div>
        <label className="form-label">Estimated Amount <span className="text-text-tertiary font-normal">(optional)</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₹</span>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field pl-8"
            placeholder="0"
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={createItem.isPending}
        className="btn-primary w-full"
      >
        {createItem.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Adding...
          </span>
        ) : (
          'Add to Wishlist'
        )}
      </button>
    </form>
  );
}
