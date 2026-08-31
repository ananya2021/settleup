import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { formatMoney, createMoneyOrZero } from '@/domain/entities/Money';

const quickActions = [
  { label: 'Add Expense', icon: 'plus', path: '/expenses/new', color: 'var(--color-accent)', bg: 'var(--color-accent-light)' },
  { label: 'Settle Up', icon: 'check', path: '/settle', color: 'var(--color-positive)', bg: 'var(--color-positive-light)' },
  { label: 'New Group', icon: 'users', path: '/groups', color: '#8B5CF6', bg: '#EDE9FE' },
  { label: 'Add Debt', icon: 'arrow-up', path: '/debts/new', color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
];

function QuickActionIcon({ name, color }: { name: string; color: string }) {
  if (name === 'plus') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }
  if (name === 'check') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (name === 'users') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === 'arrow-up') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
      </svg>
    );
  }
  return null;
}

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

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: balances, isLoading: balancesLoading } = useBalances(user?.id ?? '');
  const { data: groups, isLoading: groupsLoading } = useGroups(user?.id ?? '');

  const netBalance = balances?.netBalance ?? 0;
  const hasDebts = balances && balances.simplified.length > 0;

  return (
    <div className="page">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Good {getTimeOfDay()}</p>
        <h1 className="font-display text-2xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
          {user?.email?.split('@')[0] ?? 'Welcome'}
        </h1>
      </div>

      {/* Balance Hero Card */}
      <div className="card p-6 mb-6" style={{ background: 'var(--color-surface-raised)' }}>
        {balancesLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-10 w-40" />
            <div className="skeleton h-4 w-32" />
          </div>
        ) : (
          <>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Your Balance</p>
            <p
              className="text-amount-lg mt-1"
              style={{ color: netBalance > 0 ? 'var(--color-positive)' : netBalance < 0 ? 'var(--color-negative)' : 'var(--color-text-primary)' }}
            >
              {netBalance > 0 ? '+' : ''}{formatMoney(createMoneyOrZero(Math.abs(netBalance)))}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {netBalance > 0
                ? 'Others owe you'
                : netBalance < 0
                ? 'You owe others'
                : 'All settled up'}
            </p>
            {hasDebts && (
              <button
                onClick={() => navigate('/settle')}
                className="btn btn-primary btn-sm mt-4"
              >
                Settle Up
              </button>
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <p className="section-header">Quick Actions</p>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-2xl pressable"
              style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border-light)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: action.bg }}
              >
                <QuickActionIcon name={action.icon} color={action.color} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Groups Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-header" style={{ paddingBottom: 0 }}>Your Groups</p>
          {groups && groups.length > 0 && (
            <button
              onClick={() => navigate('/groups')}
              className="text-xs font-semibold"
              style={{ color: 'var(--color-accent)' }}
            >
              See All
            </button>
          )}
        </div>
        {groupsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-28" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="space-y-2">
            {groups.slice(0, 4).map((group) => {
              const colors = groupColor(group.name);
              return (
                <button
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="w-full card-interactive p-4 flex items-center gap-3 text-left"
                >
                  <div
                    className="avatar avatar-md"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {getInitials(group.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {group.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      {new Date(group.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-title">No groups yet</p>
            <p className="empty-state-desc">
              Create a group to start splitting expenses with friends
            </p>
            <button
              onClick={() => navigate('/groups')}
              className="btn btn-primary btn-sm mt-4"
            >
              Create Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
