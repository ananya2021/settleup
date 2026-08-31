import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGroups, useGroupMembers } from '../hooks/useGroups';
import { GroupMemberList } from './GroupMemberList';
import { AddMemberModal } from './AddMemberModal';
import { InviteMembersModal } from './InviteMembersModal';

/**
 * Group detail page showing members and admin actions.
 * Route: /groups/:groupId
 */
export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // Fetch groups to find this group's details
  const { data: groups } = useGroups(user?.id ?? '');
  const group = groups?.find((g) => g.id === groupId);

  // Fetch members to check admin status and get existing member IDs
  const { data: members } = useGroupMembers(groupId ?? '');

  // Determine if current user is an admin
  const isAdmin = useMemo(() => {
    if (!user || !members) return false;
    return members.some(
      (m: { user_id: string; role: string }) =>
        m.user_id === user.id && m.role === 'admin'
    );
  }, [user, members]);

  // Set of existing member IDs for filtering in AddMemberModal
  const existingMemberIds = useMemo(() => {
    if (!members) return new Set<string>();
    return new Set(
      members.map((m: { user_id: string }) => m.user_id)
    );
  }, [members]);

  // Get group initial for avatar
  const groupInitial = group?.name?.charAt(0).toUpperCase() || 'G';

  if (!groupId) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p className="empty-state-title">Invalid group</p>
          <button onClick={() => navigate('/groups')} className="btn-primary mt-4">
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="page-container">
        <div className="skeleton-card h-32 mb-4" />
        <div className="skeleton-card h-48" />
      </div>
    );
  }

  return (
    <div className="page-container pb-24">
      {/* Header with back button */}
      <button
        onClick={() => navigate('/groups')}
        className="flex items-center gap-2 text-text-secondary mb-6 transition-colors hover:text-text-primary"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="text-sm font-medium">Groups</span>
      </button>

      {/* Group Hero */}
      <div className="card mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
          <div className="w-20 h-20 rounded-[1.25rem] bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-sm">
            {groupInitial}
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {group.name}
          </h1>
          <p className="text-text-secondary text-sm">
            {members?.length ?? 0} {(members?.length ?? 0) === 1 ? 'member' : 'members'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-px bg-border/50">
          <button
            onClick={() => navigate(`/expenses/new?group=${groupId}`)}
            className="bg-white p-4 text-center transition-colors hover:bg-surface-active"
          >
            <div className="text-lg mb-1">💸</div>
            <span className="text-sm font-medium text-text-primary">Add Expense</span>
          </button>
          <button
            onClick={() => navigate('/settle')}
            className="bg-white p-4 text-center transition-colors hover:bg-surface-active"
          >
            <div className="text-lg mb-1">✨</div>
            <span className="text-sm font-medium text-text-primary">Settle Up</span>
          </button>
        </div>
      </div>

      {/* Members Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Members
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowAddMember(true)}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          )}
        </div>
        <GroupMemberList groupId={groupId} />
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="card overflow-hidden">
          <button
            onClick={() => setShowInvite(true)}
            className="w-full p-4 flex items-center gap-3 transition-colors hover:bg-surface-active"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-text-primary">Invite Friends</p>
              <p className="text-sm text-text-secondary">Share a link to join this group</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          groupId={groupId}
          existingMemberIds={existingMemberIds}
          onClose={() => setShowAddMember(false)}
        />
      )}
      {showInvite && (
        <InviteMembersModal
          groupId={groupId}
          groupName={group.name}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
