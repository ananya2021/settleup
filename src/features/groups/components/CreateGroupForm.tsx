import { useState, type FormEvent } from 'react';
import { useCreateGroup } from '../hooks/useGroups';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function CreateGroupForm({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const createGroup = useCreateGroup();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    try {
      await createGroup.mutateAsync({ name });
      setName('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="group-name" className="label">
          Group Name
        </label>
        <input
          id="group-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input"
          placeholder="e.g., Goa Trip, Flat Expenses"
          autoFocus
        />
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: 'var(--color-negative-light)', color: 'var(--color-negative)' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={createGroup.isPending || !name.trim()}
        className="btn btn-primary w-full"
      >
        {createGroup.isPending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Creating…
          </span>
        ) : 'Create Group'}
      </button>
    </form>
  );
}
