import { useState, useMemo, type FormEvent } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGroups, useGroupMembers } from '@/features/groups/hooks/useGroups';
import { useCreateExpense } from '../hooks/useExpenses';
import { SplitEngine } from '@/domain/services/SplitEngine';
import { createMoney } from '@/domain/entities/Money';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateExpenseForm({ onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const createExpense = useCreateExpense();

  const [groupId, setGroupId] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [payerId, setPayerId] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'exact'>('equal');
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch groups
  const { data: groups, isLoading: groupsLoading } = useGroups(user?.id ?? '');

  // Fetch members of selected group
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId);

  // Initialize payer and selected members when group changes
  const memberList = useMemo(() => {
    if (!members) return [];
    return members.map((m: { user_id: string; profiles: { name: string; email: string } }) => ({
      userId: m.user_id,
      name: m.profiles?.name ?? 'Unknown',
      email: m.profiles?.email ?? '',
    }));
  }, [members]);

  // Auto-set payer to current user when group is selected
  const handleGroupChange = (newGroupId: string) => {
    setGroupId(newGroupId);
    setPayerId(user?.id ?? '');
    setSelectedMembers(new Set());
    setExactAmounts({});
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
        setExactAmounts((prev) => {
          const next2 = { ...prev };
          delete next2[userId];
          return next2;
        });
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const selectAllMembers = () => {
    setSelectedMembers(new Set(memberList.map((m) => m.userId)));
  };

  // Preview splits using SplitEngine
  const previewSplits = useMemo(() => {
    const totalAmount = parseInt(totalAmountStr, 10);
    if (isNaN(totalAmount) || totalAmount <= 0) return null;
    if (!payerId) return null;
    if (selectedMembers.size < 2) return null;

    const participantIds = Array.from(selectedMembers);

    try {
      if (splitType === 'equal') {
        return SplitEngine.splitEqually({
          totalAmount: createMoney(totalAmount),
          participantIds,
          payerId,
        });
      } else {
        // Exact split
        const amounts = participantIds
          .filter((id) => exactAmounts[id])
          .map((id) => ({
            userId: id,
            amount: createMoney(parseInt(exactAmounts[id], 10)),
          }));

        if (amounts.length !== participantIds.length) return null;

        const splits = SplitEngine.splitByExact(createMoney(totalAmount), amounts);
        // Mark payer
        return splits.map((s) => ({
          ...s,
          isPayer: s.userId === payerId,
        }));
      }
    } catch {
      return null;
    }
  }, [totalAmountStr, payerId, selectedMembers, splitType, exactAmounts]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !groupId) return;
    setError('');
    setSuccess(false);

    const totalAmount = parseInt(totalAmountStr, 10);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('Amount must be a positive integer (no decimals)');
      return;
    }

    if (selectedMembers.size < 2) {
      setError('At least 2 participants are required');
      return;
    }

    if (!payerId) {
      setError('Please select who paid');
      return;
    }

    if (!selectedMembers.has(payerId)) {
      setError('Payer must be one of the participants');
      return;
    }

    if (!previewSplits) {
      setError('Invalid split configuration');
      return;
    }

    try {
      // Validate splits
      SplitEngine.validateSplits(createMoney(totalAmount), previewSplits);

      await createExpense.mutateAsync({
        groupId,
        description,
        totalAmount,
        splitType,
        splits: previewSplits.map((s) => ({
          user_id: s.userId,
          amount: s.amount,
        })),
      });

      setSuccess(true);
      // Reset form
      setGroupId('');
      setDescription('');
      setTotalAmountStr('');
      setPayerId('');
      setSelectedMembers(new Set());
      setExactAmounts({});
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
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
        <p className="text-lg font-semibold text-text-primary mb-1">Expense Created</p>
        <p className="text-sm text-text-secondary">Everyone has been notified</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Group Selection */}
      <div>
        <label className="form-label">Group</label>
        <select
          value={groupId}
          onChange={(e) => handleGroupChange(e.target.value)}
          required
          className="input-field"
        >
          <option value="">
            {groupsLoading ? 'Loading groups...' : 'Select a group'}
          </option>
          {groups?.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        {groups && groups.length === 0 && (
          <p className="text-sm text-warning mt-1.5">
            Create a group first before adding expenses
          </p>
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
          placeholder="Dinner, Groceries, Movie tickets..."
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
            value={totalAmountStr}
            onChange={(e) => setTotalAmountStr(e.target.value)}
            required
            className="input-field pl-8 text-lg font-semibold"
            placeholder="0"
          />
        </div>
        <p className="text-xs text-text-tertiary mt-1">Whole rupees only — no decimals</p>
      </div>

      {/* Payer Selection */}
      {groupId && (
        <div>
          <label className="form-label">Who paid?</label>
          {membersLoading ? (
            <div className="skeleton-card h-12" />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {memberList.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setPayerId(m.userId)}
                  className={`p-3 rounded-xl text-left transition-all border-2 ${
                    payerId === m.userId
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      payerId === m.userId ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
                    }`}>
                      {m.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{m.name}</p>
                      <p className="text-xs text-text-secondary truncate">{m.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Participant Selection */}
      {groupId && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">
              Participants ({selectedMembers.size}/{memberList.length})
            </label>
            <button
              type="button"
              onClick={selectAllMembers}
              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Select All
            </button>
          </div>
          {membersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card h-14" />
              ))}
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {memberList.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => toggleMember(m.userId)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedMembers.has(m.userId)
                      ? 'bg-primary/5 ring-2 ring-primary'
                      : 'hover:bg-surface-active'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedMembers.has(m.userId) ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
                  }`}>
                    {selectedMembers.has(m.userId) ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      m.name?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{m.name}</p>
                    <p className="text-xs text-text-secondary truncate">{m.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Split Type */}
      {selectedMembers.size >= 2 && (
        <div>
          <label className="form-label">How to split</label>
          <div className="flex gap-2 p-1 bg-surface rounded-xl">
            <button
              type="button"
              onClick={() => setSplitType('equal')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                splitType === 'equal'
                  ? 'bg-white shadow-sm text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Equal Split
            </button>
            <button
              type="button"
              onClick={() => setSplitType('exact')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                splitType === 'exact'
                  ? 'bg-white shadow-sm text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Exact Amounts
            </button>
          </div>
        </div>
      )}

      {/* Exact Amount Inputs */}
      {splitType === 'exact' && selectedMembers.size >= 2 && (
        <div className="space-y-2">
          <label className="form-label">Amount per person</label>
          {Array.from(selectedMembers).map((userId) => {
            const member = memberList.find((m) => m.userId === userId);
            return (
              <div key={userId} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary flex-1 truncate">
                  {member?.name ?? userId.slice(0, 8)}…
                </span>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={exactAmounts[userId] ?? ''}
                    onChange={(e) =>
                      setExactAmounts((prev) => ({ ...prev, [userId]: e.target.value }))
                    }
                    className="input-field pl-7 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Split Preview */}
      {previewSplits && (
        <div className="p-4 bg-surface rounded-xl">
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">Split Preview</p>
          <div className="space-y-2">
            {previewSplits.map((s) => {
              const member = memberList.find((m) => m.userId === s.userId);
              return (
                <div key={s.userId} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-primary">
                      {member?.name ?? s.userId.slice(0, 8)}…
                    </span>
                    {s.isPayer && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        paid
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-text-primary">₹{s.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          disabled={createExpense.isPending || !groupId || selectedMembers.size < 2}
          className="btn-primary flex-1"
        >
          {createExpense.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            'Create Expense'
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
