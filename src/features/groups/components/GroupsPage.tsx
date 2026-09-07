import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GroupList } from './GroupList';
import { CreateGroupForm } from './CreateGroupForm';
import { Button } from '@/ui/primitives/Button';
import { Sheet } from '@/ui/primitives/Sheet';

export function GroupsPage() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Groups
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
            Organize trips, roommates, and shared expenses
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateForm(true)}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          New Group
        </Button>
      </div>

      {/* Create Group Sheet / Modal */}
      <Sheet
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="New Group"
        subtitle="Name your group to start sharing expenses"
      >
        <CreateGroupForm onCreated={() => setShowCreateForm(false)} />
      </Sheet>

      {/* Group List */}
      <GroupList onOpenCreate={() => setShowCreateForm(true)} />
    </div>
  );
}
