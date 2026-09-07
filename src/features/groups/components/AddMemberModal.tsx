import { useState } from 'react';
import { useUserSearch } from '@/features/users/hooks/useUserSearch';
import { useAddGroupMember } from '../hooks/useAddGroupMember';
import { Sheet } from '@/ui/primitives/Sheet';
import { Button } from '@/ui/primitives/Button';
import { Avatar } from '@/ui/primitives/Avatar';
import { SuccessCheck } from '@/ui/primitives/SuccessCheck';

interface AddMemberModalProps {
  groupId: string;
  existingMemberIds: Set<string>;
  onClose: () => void;
}

export function AddMemberModal({ groupId, existingMemberIds, onClose }: AddMemberModalProps) {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data: searchResults, isLoading: searching } = useUserSearch(query);
  const addMember = useAddGroupMember(groupId);

  const filteredResults = (searchResults ?? []).filter((u) => !existingMemberIds.has(u.id));

  const handleSubmit = async () => {
    if (!selectedUser) return;
    setError('');
    try {
      await addMember.mutateAsync({ userId: selectedUser.id });
      setSuccess(true);
      setTimeout(() => onClose(), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="Add Member"
      subtitle="Search SplitPay users to add them directly"
    >
      {success ? (
        <SuccessCheck
          title="Member Added!"
          message={`${selectedUser?.name} is now part of this group.`}
        />
      ) : (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedUser(null);
              }}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] text-sm font-medium outline-none focus:border-[var(--color-accent)] transition-colors"
              autoFocus
            />
          </div>

          {/* Search Results List */}
          {query.trim().length >= 2 && (
            <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-2xl border border-[var(--color-border)] p-1 bg-[var(--color-surface-raised)] shadow-sm">
              {searching ? (
                <div className="p-4 text-center text-xs text-[var(--color-text-secondary)] flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Searching users…
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--color-text-secondary)]">
                  No users found matching "{query}"
                </div>
              ) : (
                filteredResults.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all pressable ${
                        isSelected
                          ? 'bg-[var(--color-accent-light)] border border-[var(--color-accent)]'
                          : 'hover:bg-[var(--color-surface-sunken)] border border-transparent'
                      }`}
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
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Selected User Preview */}
          {selectedUser && (
            <div className="p-3.5 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)] flex items-center gap-3">
              <Avatar name={selectedUser.name} size="md" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-accent)]">
                  Ready to add
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                  {selectedUser.name}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-2xl text-xs font-semibold bg-[var(--color-owe-light)] text-[var(--color-owe)]">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!selectedUser || addMember.isPending}
              loading={addMember.isPending}
              className="flex-1"
            >
              Add Member
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
