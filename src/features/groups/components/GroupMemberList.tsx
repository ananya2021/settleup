import { useGroupMembers } from '../hooks/useGroups';

interface GroupMemberListProps {
  groupId: string;
}

/**
 * Displays the list of members in a group.
 * Shows avatar, name, email, and role.
 */
export function GroupMemberList({ groupId }: GroupMemberListProps) {
  const { data: members, isLoading, error } = useGroupMembers(groupId);

  if (isLoading) {
    return (
      <div className="card overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex items-center gap-3 p-4 ${i < 3 ? 'border-b border-border/50' : ''}`}>
            <div className="w-11 h-11 rounded-full bg-surface animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-surface rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-surface rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-xl bg-error/10 text-error text-sm">
        Failed to load members
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-text-secondary text-sm">No members yet</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {members.map(
        (member: {
          user_id: string;
          role: string;
          joined_at: string;
          profiles: { name: string; email: string } | null;
        }, index: number) => (
          <div
            key={member.user_id}
            className={`flex items-center gap-3 p-4 transition-colors ${
              index < members.length - 1 ? 'border-b border-border/50' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
              member.role === 'admin'
                ? 'bg-primary/10 text-primary'
                : 'bg-surface text-text-secondary'
            }`}>
              {member.profiles?.name?.charAt(0).toUpperCase() || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">
                {member.profiles?.name ?? 'Unknown'}
              </p>
              <p className="text-sm text-text-secondary truncate">
                {member.profiles?.email ?? ''}
              </p>
            </div>

            {/* Role badge */}
            {member.role === 'admin' && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary flex-shrink-0">
                Admin
              </span>
            )}
          </div>
        )
      )}
    </div>
  );
}
