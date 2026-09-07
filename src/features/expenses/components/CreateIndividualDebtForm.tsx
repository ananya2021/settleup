import { useState, useCallback, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateIndividualDebt } from '../hooks/useIndividualDebts';
import { useUserSearch, type UserSearchResult } from '@/features/users/hooks/useUserSearch';
import { Card } from '@/ui/primitives/Card';
import { Button } from '@/ui/primitives/Button';
import { Avatar } from '@/ui/primitives/Avatar';
import { AmountInput } from '@/ui/primitives/AmountInput';
import { SuccessCheck } from '@/ui/primitives/SuccessCheck';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateIndividualDebtForm({ onSuccess, onCancel }: Props) {
  const navigate = useNavigate();
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleUserSelect = useCallback((u: UserSearchResult) => {
    setSelectedUser(u);
    setSearchQuery('');
    setShowDropdown(false);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedUser) {
      setError('Please select who owes you');
      return;
    }

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive whole number');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a reason or description');
      return;
    }

    try {
      await createDebt.mutateAsync({
        debtorId: selectedUser.id,
        description: description.trim(),
        amount: amountNum,
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/balances');
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record debt');
      setSuccess(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <SuccessCheck
          title="Debt Recorded! 🎉"
          message={`Recorded ₹${parseInt(amount, 10).toLocaleString('en-IN')} owed by ${selectedUser?.name}.`}
        />
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : navigate(-1))}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] pressable"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Cancel</span>
        </button>
        <h1 className="font-display font-bold text-lg text-[var(--color-text-primary)]">
          Record Direct Debt
        </h1>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <Card className="p-6">
          <label className="block text-center text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
            Amount Owed
          </label>
          <AmountInput
            value={amount}
            onChange={setAmount}
            placeholder="0"
            autoFocus
          />
        </Card>

        {/* User Search */}
        <Card className="p-5 space-y-3" ref={dropdownRef}>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Who owes you?
          </label>
          {!selectedUser ? (
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) setShowDropdown(true);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
                placeholder="Search friend by name or email..."
              />

              {showDropdown && searchQuery.length >= 2 && (
                <div className="absolute z-20 w-full mt-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-xl max-h-48 overflow-y-auto p-1 divide-y divide-[var(--color-border-light)]">
                  {searching ? (
                    <div className="p-4 text-center text-xs text-[var(--color-text-secondary)]">
                      Searching users…
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    searchResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleUserSelect(u)}
                        className="w-full text-left p-3 flex items-center gap-3 rounded-xl hover:bg-[var(--color-surface-sunken)] transition-colors"
                      >
                        <Avatar name={u.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] truncate">
                            {u.email}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[var(--color-text-secondary)]">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={selectedUser.name} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline ml-2"
              >
                Change
              </button>
            </div>
          )}
        </Card>

        {/* Description */}
        <Card className="p-5 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            What is it for?
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="e.g. Lunch split, Cab fare, Concert ticket..."
            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </Card>

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
          disabled={createDebt.isPending || !selectedUser || !amount}
          loading={createDebt.isPending}
        >
          Record Direct Debt
        </Button>
      </form>
    </div>
  );
}
