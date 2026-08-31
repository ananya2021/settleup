import { useState, useCallback, useRef, useEffect, type FormEvent } from 'react';
import { useCreateIndividualDebt } from '../hooks/useIndividualDebts';
import { useUserSearch, type UserSearchResult } from '@/features/users/hooks/useUserSearch';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateIndividualDebtForm({ onSuccess, onCancel }: Props) {
  const createDebt = useCreateIndividualDebt();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: searchResults, isLoading: searching } = useUserSearch(searchQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleUserSelect = useCallback((user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchQuery('');
    setShowDropdown(false);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedUser) {
      setError('Please select a user from the list');
      return;
    }

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive integer');
      return;
    }

    try {
      await createDebt.mutateAsync({
        debtorId: selectedUser.id,
        description,
        amount: amountNum,
      });
      setSuccess(true);
      setSelectedUser(null);
      setSearchQuery('');
      setDescription('');
      setAmount('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create debt');
      setSuccess(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-text-primary mb-1">Debt Recorded</p>
        <p className="text-sm text-text-secondary">The other person will be notified</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* User Search */}
      <div className="relative" ref={dropdownRef}>
        <label className="form-label">Who owes you?</label>
        {!selectedUser ? (
          <>
            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedUser(null);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2 && !selectedUser) {
                    setShowDropdown(true);
                  }
                }}
                required
                className="input-field pl-10"
                placeholder="Search by name or email..."
              />
            </div>
            {showDropdown && searchQuery.length >= 2 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {searching ? (
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Searching...
                    </div>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleUserSelect(u)}
                      className="w-full text-left p-3 hover:bg-surface-active flex items-center gap-3 border-b border-border/50 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{u.name}</p>
                        <p className="text-xs text-text-secondary truncate">{u.email}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-text-secondary">No users found</div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm">
              {selectedUser.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">{selectedUser.name}</p>
              <p className="text-sm text-text-secondary truncate">{selectedUser.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setSearchQuery('');
              }}
              className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="form-label">What was it for?</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="input-field"
          placeholder="Lunch, Taxi fare, Grocery share..."
        />
      </div>

      {/* Amount */}
      <div>
        <label className="form-label">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₹</span>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="input-field pl-8 text-lg font-semibold"
            placeholder="0"
          />
        </div>
        <p className="text-xs text-text-tertiary mt-1">Whole rupees only — no decimals</p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={createDebt.isPending || !selectedUser}
          className="btn-primary flex-1"
        >
          {createDebt.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            'Record Debt'
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
