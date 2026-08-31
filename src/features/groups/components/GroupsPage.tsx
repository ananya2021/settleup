import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GroupList } from './GroupList';
import { CreateGroupForm } from './CreateGroupForm';

export function GroupsPage() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!user) return null;

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Groups
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Split expenses with friends
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary btn-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Group
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              New Group
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
              Name your group to get started
            </p>
            <CreateGroupForm onCreated={() => setShowCreateForm(false)} />
            <button
              onClick={() => setShowCreateForm(false)}
              className="btn btn-ghost w-full mt-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Group List */}
      <GroupList />
    </div>
  );
}
