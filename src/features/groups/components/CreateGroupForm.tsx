import { useState, type FormEvent } from 'react';
import { useCreateGroup } from '../hooks/useGroups';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/ui/primitives/Button';
import { GroupAvatar } from '@/ui/primitives/GroupAvatar';

const POPULAR_EMOJIS = ['✈️', '🏠', '🍕', '🍻', '🚗', '🏖️', '☕', '🎉', '🍿', '🏕️'];

export function CreateGroupForm({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const createGroup = useCreateGroup();
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🍕');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setError('');

    try {
      // Prepend selected emoji to name for rich group identity
      const fullGroupName = selectedEmoji ? `${selectedEmoji} ${name.trim()}` : name.trim();
      await createGroup.mutateAsync({ name: fullGroupName });
      setName('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Preview Badge */}
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)]">
        <GroupAvatar
          name={name.trim() || 'New Group'}
          emoji={selectedEmoji}
          size="xl"
          className="shadow-md mb-2"
        />
        <p className="font-display text-base font-bold text-[var(--color-text-primary)]">
          {name.trim() ? `${selectedEmoji} ${name}` : 'Group Name'}
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Live Avatar Preview
        </p>
      </div>

      {/* Emoji Picker */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
          Choose an Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(emoji)}
              className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all pressable ${
                selectedEmoji === emoji
                  ? 'bg-[var(--color-surface-raised)] border-2 border-[var(--color-accent)] shadow-sm scale-105'
                  : 'bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Group Name Input */}
      <div>
        <label htmlFor="group-name" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
          Group Name
        </label>
        <input
          id="group-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] font-medium outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
          placeholder="e.g. Goa Vacation, Apartment 4B, Friday Dinners"
          autoFocus
        />
      </div>

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
        disabled={createGroup.isPending || !name.trim()}
        loading={createGroup.isPending}
      >
        Create Group
      </Button>
    </form>
  );
}
