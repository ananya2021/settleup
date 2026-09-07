import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvitationDetails, useAcceptGroupInvitation } from '../hooks/useInvitations';
import { GroupAvatar } from '@/ui/primitives/GroupAvatar';
import { Card } from '@/ui/primitives/Card';
import { Button } from '@/ui/primitives/Button';
import { Skeleton } from '@/ui/primitives/Skeleton';

export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: details, isLoading, error: fetchError } = useInvitationDetails(token ?? '');
  const acceptInvitation = useAcceptGroupInvitation();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)]">
        <Card className="max-w-sm w-full text-center p-8 space-y-4">
          <div className="text-3xl">⚠️</div>
          <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)]">
            Invalid Link
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            This invitation link is missing or malformed.
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)]">
        <Card className="max-w-sm w-full text-center p-8 space-y-4">
          <Skeleton variant="circular" width={64} height={64} className="mx-auto" />
          <Skeleton width="70%" height={20} className="mx-auto" />
          <Skeleton width="90%" height={14} className="mx-auto" />
        </Card>
      </div>
    );
  }

  if (fetchError || !details || !details.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)]">
        <Card className="max-w-sm w-full text-center p-8 space-y-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-xl bg-[var(--color-owe-light)] text-[var(--color-owe)]">
            ✕
          </div>
          <h2 className="font-display font-bold text-xl text-[var(--color-text-primary)]">
            Invitation Expired or Invalid
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {details?.error ?? 'This invitation link is no longer valid or has already expired.'}
          </p>
          <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  const groupName = details.group_name || 'Group';

  // State 1: User is not signed in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)]">
        <Card className="max-w-sm w-full text-center p-8 space-y-5 shadow-xl">
          <GroupAvatar name={groupName} size="xl" className="mx-auto shadow-md" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
              Group Invitation
            </span>
            <h2 className="font-display font-bold text-2xl text-[var(--color-text-primary)] mt-1">
              Join {groupName}
            </h2>
            {details.inviter_name && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Invited by <strong className="text-[var(--color-text-primary)]">{details.inviter_name}</strong>
              </p>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Sign in or create an account to start splitting expenses with this group.
          </p>
          <div className="space-y-2 pt-2">
            <Link to={`/login?redirect=/invite/${token}`} className="block">
              <Button variant="primary" fullWidth size="lg">
                Sign In to Join
              </Button>
            </Link>
            <Link to={`/signup`} className="block">
              <Button variant="ghost" fullWidth size="sm">
                Create an Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // State 2: User is already a member
  if (details.is_member) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)]">
        <Card className="max-w-sm w-full text-center p-8 space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-xl bg-[var(--color-owed-light)] text-[var(--color-owed)]">
            ✓
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-[var(--color-text-primary)]">
              Already a Member
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
              You are already part of <strong className="text-[var(--color-text-primary)]">{groupName}</strong>.
            </p>
          </div>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => navigate(`/groups/${details.group_id}`)}
          >
            Open Group
          </Button>
        </Card>
      </div>
    );
  }

  // State 3: User is signed in and can accept
  const handleAccept = async () => {
    try {
      const result = await acceptInvitation.mutateAsync({ token });
      if (result.success) {
        navigate(`/groups/${result.group_id}`);
      }
    } catch {
      // Handled by acceptInvitation.error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-surface)]">
      <Card className="max-w-sm w-full text-center p-8 space-y-6 shadow-xl">
        <GroupAvatar name={groupName} size="xl" className="mx-auto shadow-md" />
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
            You've Been Invited!
          </span>
          <h2 className="font-display font-bold text-2xl text-[var(--color-text-primary)] mt-1">
            {groupName}
          </h2>
          {details.inviter_name && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Invited by <strong className="text-[var(--color-text-primary)]">{details.inviter_name}</strong>
            </p>
          )}
        </div>

        {acceptInvitation.error && (
          <div className="p-3 rounded-2xl text-xs font-semibold bg-[var(--color-owe-light)] text-[var(--color-owe)]">
            {(acceptInvitation.error as Error).message ?? 'Failed to accept invitation'}
          </div>
        )}

        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleAccept}
          disabled={acceptInvitation.isPending}
          loading={acceptInvitation.isPending}
        >
          Accept & Join Group
        </Button>
      </Card>
    </div>
  );
}
