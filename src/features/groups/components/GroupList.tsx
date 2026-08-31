import { useNavigate } from 'react-router-dom';
import { useGroups } from '../hooks/useGroups';
import { useAuth } from '@/features/auth/hooks/useAuth';

/** Generate a consistent pastel color from a string */
function groupColor(name: string) {
  const colors = [
    { bg: '#EDE9FE', text: '#7C3AED' },
    { bg: '#DBEAFE', text: '#2563EB' },
    { bg: '#D1FAE5', text: '#059669' },
    { bg: '#FEF3C7', text: '#D97706' },
    { bg: '#FCE7F3', text: '#DB2777' },
    { bg: '#E0E7FF', text: '#4F46E5' },
    { bg: '#CCFBF1', text: '#0D9488' },
    { bg: '#FEE2E2', text: '#DC2626' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function GroupList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: groups, isLoading } = useGroups(user?.id ?? '');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👥</div>
        <p className="empty-state-title">No groups yet</p>
        <p className="empty-state-desc">
          Create your first group and start splitting expenses with friends
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const colors = groupColor(group.name);
        return (
          <button
            key={group.id}
            onClick={() => navigate(`/groups/${group.id}`)}
            className="w-full card-interactive p-4 flex items-center gap-4 text-left"
          >
            {/* Group avatar */}
            <div
              className="avatar avatar-lg"
              style={{ background: colors.bg, color: colors.text }}
            >
              {getInitials(group.name)}
            </div>
            {/* Group info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {group.name}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Created {new Date(group.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {/* Chevron */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
