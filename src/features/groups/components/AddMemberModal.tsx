import { useState } from 'react';
import { useUserSearch } from '@/features/users/hooks/useUserSearch';
import { useAddGroupMember } from '../hooks/useAddGroupMember';

interface AddMemberModalProps {
  groupId: string;
  existingMemberIds: Set<string>;
  onClose: () => void;
}

/**
 * Modal for searching and adding a user to a group.
 * Only visible to admins.
 */
export function AddMemberModal({
  groupId,
  existingMemberIds,
  onClose,
}: AddMemberModalProps) {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data: searchResults, isLoading: searching } =
    useUserSearch(query);
  const addMember = useAddGroupMember(groupId);

  // Filter out users already in the group
  const filteredResults = (searchResults ?? []).filter(
    (user) => !existingMemberIds.has(user.id)
  );

  const handleSubmit = async () => {
    if (!selectedUser) return;
    setError('');

    try {
      await addMember.mutateAsync({ userId: selectedUser.id });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add member'
      );
    }
  };

  if (success) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-text-primary mb-1">
            Member Added
          </p>
          <p className="text-sm text-text-secondary">
            {selectedUser?.name} has been added to the group
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-text-primary">
            Add Member
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedUser(null);
            }}
            placeholder="Search by name or email..."
            className="input-field pl-10"
            autoFocus
          />
        </div>

        {/* Search results */}
        {query.trim().length >= 2 && (
          <div className="mb-4 max-h-48 overflow-y-auto -mx-1">
            {searching && (
              <div className="px-3 py-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Searching...
                </div>
              </div>
            )}
            {!searching && filteredResults.length === 0 && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-text-secondary">
                  No users found
                </p>
              </div>
            )}
            {filteredResults.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full text-left px-3 py-3 rounded-xl mb-1 flex items-center gap-3 transition-all ${
                  selectedUser?.id === user.id
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'hover:bg-surface-active'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-text-secondary truncate">
                    {user.email}
                  </p>
                </div>
                {selectedUser?.id === user.id && (
                  <div className="ml-auto flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Selected user preview */}
        {selectedUser && (
          <div className="mb-4 p-3 bg-primary/5 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm">
              {selectedUser.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-secondary mb-0.5">Adding</p>
              <p className="font-medium text-text-primary truncate">
                {selectedUser.name}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedUser || addMember.isPending}
            className="btn-primary flex-1"
          >
            {addMember.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              'Add Member'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
