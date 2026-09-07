import { useState, useMemo, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGroups, useGroupMembers } from '@/features/groups/hooks/useGroups';
import { useCreateExpense } from '../hooks/useExpenses';
import { SplitEngine } from '@/domain/services/SplitEngine';
import { createMoney } from '@/domain/entities/Money';
import { AmountInput } from '@/ui/primitives/AmountInput';
import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { Avatar } from '@/ui/primitives/Avatar';
import { SegmentedControl } from '@/ui/primitives/SegmentedControl';
import { SuccessCheck } from '@/ui/primitives/SuccessCheck';
import { Skeleton } from '@/ui/primitives/Skeleton';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type SplitTabType = 'equal' | 'exact' | 'percentage' | 'shares';

const EXPENSE_CATEGORIES = [
  { emoji: '🍕', label: 'Food' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🍻', label: 'Drinks' },
  { emoji: '🛒', label: 'Groceries' },
  { emoji: '🚕', label: 'Transport' },
  { emoji: '✈️', label: 'Flight' },
  { emoji: '🏨', label: 'Hotel' },
  { emoji: '🎬', label: 'Entertainment' },
  { emoji: '💡', label: 'Utilities' },
  { emoji: '🛍️', label: 'Shopping' },
];

export function CreateExpenseForm({ onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createExpense = useCreateExpense();

  // Selected Group
  const paramGroupId = searchParams.get('group') || '';
  const [groupId, setGroupId] = useState(paramGroupId);

  // Form inputs
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [categoryEmoji, setCategoryEmoji] = useState('🍕');
  const [payerId, setPayerId] = useState(user?.id ?? '');
  const [splitType, setSplitType] = useState<SplitTabType>('equal');

  // Custom split inputs
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, number>>({});
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Groups and members
  const { data: groups, isLoading: groupsLoading } = useGroups(user?.id ?? '');
  const { data: rawMembers } = useGroupMembers(groupId);

  const memberList = useMemo(() => {
    if (!rawMembers) return [];
    return rawMembers.map((m: { user_id: string; profiles: { name: string; email: string } }) => ({
      userId: m.user_id,
      name: m.user_id === user?.id ? 'You' : m.profiles?.name || m.profiles?.email?.split('@')[0] || 'Member',
      email: m.profiles?.email ?? '',
    }));
  }, [rawMembers, user]);

  // Set default groupId if not set
  useEffect(() => {
    if (!groupId && groups && groups.length > 0) {
      if (paramGroupId && groups.some((g) => g.id === paramGroupId)) {
        setGroupId(paramGroupId);
      } else {
        setGroupId(groups[0].id);
      }
    }
  }, [groups, groupId, paramGroupId]);

  // When members load, default to ALL group members selected and payer as current user
  useEffect(() => {
    if (memberList.length > 0) {
      setSelectedMembers(new Set(memberList.map((m) => m.userId)));
      if (!payerId && user) {
        setPayerId(user.id);
      }
      // Initialize equal shares
      const initialShares: Record<string, number> = {};
      memberList.forEach((m) => {
        initialShares[m.userId] = 1;
      });
      setShares(initialShares);
    }
  }, [memberList, payerId, user]);

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        if (next.size <= 2) {
          setError('At least 2 participants are required');
          return prev;
        }
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const selectAllMembers = () => {
    setSelectedMembers(new Set(memberList.map((m) => m.userId)));
  };

  // Compute live split preview
  const previewSplits = useMemo(() => {
    const totalAmount = parseInt(amountStr, 10);
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
      }

      if (splitType === 'exact') {
        const amounts = participantIds
          .filter((id) => exactAmounts[id])
          .map((id) => ({
            userId: id,
            amount: createMoney(parseInt(exactAmounts[id], 10)),
          }));
        if (amounts.length !== participantIds.length) return null;
        const splits = SplitEngine.splitByExact(createMoney(totalAmount), amounts);
        return splits.map((s) => ({ ...s, isPayer: s.userId === payerId }));
      }

      if (splitType === 'percentage') {
        const pcts = participantIds.map((id) => ({
          userId: id,
          percentage: parseInt(percentages[id] || '0', 10),
          isPayer: id === payerId,
        }));
        return SplitEngine.splitByPercentage(createMoney(totalAmount), pcts);
      }

      if (splitType === 'shares') {
        const totalShares = participantIds.reduce(
          (acc, id) => acc + (shares[id] || 1),
          0
        );
        if (totalShares <= 0) return null;

        let allocated = 0;
        const splits = participantIds.map((id) => {
          const userShare = shares[id] || 1;
          const shareAmount = Math.floor((totalAmount * userShare) / totalShares);
          allocated += shareAmount;
          return {
            userId: id,
            amount: createMoney(shareAmount),
            isPayer: id === payerId,
          };
        });

        // Remainder given to payer
        const remainder = totalAmount - allocated;
        const payerSplit = splits.find((s) => s.isPayer) || splits[0];
        if (payerSplit) {
          payerSplit.amount = createMoney(payerSplit.amount + remainder);
        }

        return splits;
      }

      return null;
    } catch {
      return null;
    }
  }, [amountStr, payerId, selectedMembers, splitType, exactAmounts, percentages, shares]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !groupId) return;
    setError('');

    const totalAmount = parseInt(amountStr, 10);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('Please enter a positive whole number amount');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }
    if (selectedMembers.size < 2) {
      setError('At least 2 participants are required');
      return;
    }
    if (!selectedMembers.has(payerId)) {
      setError('Payer must be one of the participants');
      return;
    }
    if (!previewSplits) {
      setError('Invalid split configuration. Check that the splits equal the total amount.');
      return;
    }

    try {
      SplitEngine.validateSplits(createMoney(totalAmount), previewSplits);

      // Backend expects split_type in ('equal', 'exact', 'percentage')
      const backendSplitType =
        splitType === 'shares' ? 'exact' : (splitType as 'equal' | 'exact' | 'percentage');

      const fullDescription = `${categoryEmoji} ${description.trim()}`;

      await createExpense.mutateAsync({
        groupId,
        description: fullDescription,
        totalAmount,
        splitType: backendSplitType,
        splits: previewSplits.map((s) => ({ user_id: s.userId, amount: s.amount })),
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/groups/${groupId}`);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
    }
  };

  if (success) {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <SuccessCheck
          title="Expense Added! 🎉"
          message={`"₹${parseInt(amountStr, 10).toLocaleString('en-IN')} for ${description}" has been split and balances updated.`}
        />
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Top Bar / Header */}
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
          Add Expense
        </h1>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Large Amount Input */}
        <Card className="p-6">
          <label className="block text-center text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
            Amount
          </label>
          <AmountInput
            value={amountStr}
            onChange={setAmountStr}
            placeholder="0"
            autoFocus
          />
        </Card>

        {/* 2. Group Selector */}
        <Card className="p-5 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            In Which Group?
          </label>
          {groupsLoading ? (
            <Skeleton height={44} />
          ) : (
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-semibold outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <option value="">Select a group</option>
              {groups?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </Card>

        {/* 3. Description & Category Picker */}
        <Card className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
              What was this for?
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl p-2 rounded-xl bg-[var(--color-surface-sunken)] select-none">
                {categoryEmoji}
              </span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Dinner, Taxi, Movie tickets, Groceries..."
                className="flex-1 px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setCategoryEmoji(cat.emoji)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all pressable ${
                  categoryEmoji === cat.emoji
                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] border border-[var(--color-accent)]'
                    : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* 4. Paid By Selector (Avatar Row) */}
        {groupId && memberList.length > 0 && (
          <Card className="p-5 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Paid By
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {memberList.map((member) => {
                const isPayer = payerId === member.userId;
                return (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => setPayerId(member.userId)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all pressable flex-shrink-0 min-w-[76px] ${
                      isPayer
                        ? 'bg-[var(--color-accent-light)] border-2 border-[var(--color-accent)] shadow-sm'
                        : 'bg-[var(--color-surface-sunken)] border border-transparent'
                    }`}
                  >
                    <Avatar name={member.name} size="md" />
                    <span className={`text-xs truncate max-w-[70px] ${
                      isPayer ? 'font-bold text-[var(--color-accent)]' : 'font-medium text-[var(--color-text-secondary)]'
                    }`}>
                      {member.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* 5. Split Between & Split Type */}
        {groupId && memberList.length > 0 && (
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Split Between ({selectedMembers.size}/{memberList.length})
              </label>
              {selectedMembers.size < memberList.length && (
                <button
                  type="button"
                  onClick={selectAllMembers}
                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline pressable"
                >
                  Select All
                </button>
              )}
            </div>

            {/* Participants Multi-Select Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {memberList.map((member) => {
                const isSelected = selectedMembers.has(member.userId);
                return (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => toggleMember(member.userId)}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all pressable flex-shrink-0 min-w-[76px] ${
                      isSelected
                        ? 'bg-[var(--color-surface-raised)] border-2 border-[var(--color-accent)] shadow-sm'
                        : 'bg-[var(--color-surface-sunken)] border border-transparent opacity-40'
                    }`}
                  >
                    <Avatar name={member.name} size="md" />
                    <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate max-w-[70px]">
                      {member.name}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-[10px] shadow-sm">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Split Type Selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
                Split Method
              </label>
              <SegmentedControl<SplitTabType>
                options={[
                  { value: 'equal', label: 'Equal' },
                  { value: 'exact', label: 'Exact' },
                  { value: 'percentage', label: '%' },
                  { value: 'shares', label: 'Shares' },
                ]}
                value={splitType}
                onChange={(st) => setSplitType(st)}
              />
            </div>

            {/* Inputs for Exact amounts */}
            {splitType === 'exact' && (
              <div className="space-y-2 pt-2 border-t border-[var(--color-border-light)]">
                {Array.from(selectedMembers).map((userId) => {
                  const m = memberList.find((mem) => mem.userId === userId);
                  return (
                    <div key={userId} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {m?.name}
                      </span>
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]">₹</span>
                        <input
                          type="number"
                          value={exactAmounts[userId] ?? ''}
                          onChange={(e) =>
                            setExactAmounts((prev) => ({ ...prev, [userId]: e.target.value }))
                          }
                          placeholder="0"
                          className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-sm font-semibold text-right outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inputs for Percentages */}
            {splitType === 'percentage' && (
              <div className="space-y-2 pt-2 border-t border-[var(--color-border-light)]">
                {Array.from(selectedMembers).map((userId) => {
                  const m = memberList.find((mem) => mem.userId === userId);
                  return (
                    <div key={userId} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {m?.name}
                      </span>
                      <div className="relative w-28">
                        <input
                          type="number"
                          value={percentages[userId] ?? ''}
                          onChange={(e) =>
                            setPercentages((prev) => ({ ...prev, [userId]: e.target.value }))
                          }
                          placeholder="0"
                          className="w-full pr-7 pl-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-sm font-semibold text-right outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)]">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inputs for Shares */}
            {splitType === 'shares' && (
              <div className="space-y-2 pt-2 border-t border-[var(--color-border-light)]">
                {Array.from(selectedMembers).map((userId) => {
                  const m = memberList.find((mem) => mem.userId === userId);
                  const currentShare = shares[userId] ?? 1;
                  return (
                    <div key={userId} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {m?.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setShares((prev) => ({
                              ...prev,
                              [userId]: Math.max(1, currentShare - 1),
                            }))
                          }
                          className="w-7 h-7 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold">
                          {currentShare}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setShares((prev) => ({
                              ...prev,
                              [userId]: currentShare + 1,
                            }))
                          }
                          className="w-7 h-7 rounded-lg bg-[var(--color-surface-sunken)] border border-[var(--color-border)] font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Split Preview breakdown */}
            {previewSplits && (
              <div className="p-4 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)] space-y-2 mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  Live Split Breakdown
                </span>
                <div className="divide-y divide-[var(--color-border-light)]">
                  {previewSplits.map((s) => {
                    const m = memberList.find((mem) => mem.userId === s.userId);
                    return (
                      <div key={s.userId} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--color-text-primary)]">
                            {m?.name}
                          </span>
                          {s.isPayer && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                              paid
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-amount text-[var(--color-text-primary)]">
                          ₹{s.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl text-xs font-semibold bg-[var(--color-owe-light)] text-[var(--color-owe)] border border-[var(--color-owe-border)]">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          disabled={createExpense.isPending || !amountStr || !description.trim() || !previewSplits}
          loading={createExpense.isPending}
        >
          Add Expense
        </Button>
      </form>
    </div>
  );
}
