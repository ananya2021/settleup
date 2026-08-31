import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  useInvitationDetails,
  useAcceptGroupInvitation,
} from '../hooks/useInvitations';

/**
 * Invitation acceptance page.
 * Route: /invite/:token
 *
 * Shows invitation details and allows the user to accept.
 * Handles unauthenticated users by prompting sign-in.
 */
export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: details, isLoading, error: fetchError } =
    useInvitationDetails(token ?? '');

  const acceptInvitation = useAcceptGroupInvitation();

  // Get group initial
  const groupInitial = details?.group_name?.charAt(0).toUpperCase() || 'G';

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-sm text-center">
          <p className="text-text-primary font-medium">Invalid invitation link</p>
          <Link to="/login" className="btn-primary inline-block mt-4">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !details || !details.valid) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Invitation Invalid
          </h2>
          <p className="text-text-secondary mb-6 text-sm">
            {details?.error ?? 'This invitation link is no longer valid.'}
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // User is not authenticated — show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 text-3xl font-bold">
            {groupInitial}
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            You've been invited!
          </h2>
          <p className="text-text-secondary mb-1">
            Join the group{' '}
            <strong className="text-text-primary">{details.group_name}</strong>
          </p>
          {details.inviter_name && (
            <p className="text-sm text-text-tertiary mb-6">
              Invited by {details.inviter_name}
            </p>
          )}
          {!details.inviter_name && <div className="mb-6" />}
          <p className="text-sm text-text-secondary mb-4">
            Sign in to accept this invitation
          </p>
          <Link
            to={`/login?redirect=/invite/${token}`}
            className="btn-primary block text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // User is authenticated and already a member
  if (details.is_member) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Already a member
          </h2>
          <p className="text-text-secondary mb-6 text-sm">
            You're already a member of{' '}
            <strong className="text-text-primary">{details.group_name}</strong>.
          </p>
          <button
            onClick={() => navigate(`/groups/${details.group_id}`)}
            className="btn-primary w-full"
          >
            Go to Group
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated, not a member — show accept button
  const handleAccept = async () => {
    try {
      const result = await acceptInvitation.mutateAsync({ token });
      if (result.success) {
        navigate(`/groups/${result.group_id}`);
      }
    } catch {
      // Error is in acceptInvitation.error
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-sm text-center">
        <div className="w-20 h-20 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 text-3xl font-bold">
          {groupInitial}
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          You've been invited!
        </h2>
        <p className="text-text-secondary mb-1">
          Join <strong className="text-text-primary">{details.group_name}</strong>
        </p>
        {details.inviter_name && (
          <p className="text-sm text-text-tertiary mb-6">
            Invited by {details.inviter_name}
          </p>
        )}
        {!details.inviter_name && <div className="mb-6" />}

        {acceptInvitation.error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error/10 text-error text-sm">
            {(acceptInvitation.error as Error).message ??
              'Failed to accept invitation'}
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={acceptInvitation.isPending}
          className="btn-primary w-full"
        >
          {acceptInvitation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Joining...
            </span>
          ) : (
            'Accept Invitation'
          )}
        </button>
      </div>
    </div>
  );
}
