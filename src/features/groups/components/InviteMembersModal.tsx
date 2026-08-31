import { useState, useCallback } from 'react';
import { useCreateGroupInvitation } from '../hooks/useInvitations';

interface InviteMembersModalProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

/**
 * Modal for generating and sharing an invitation link.
 * Only visible to admins.
 */
export function InviteMembersModal({
  groupId,
  groupName,
  onClose,
}: InviteMembersModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const createInvitation = useCreateGroupInvitation();

  const invitationUrl = token
    ? `${window.location.origin}/invite/${token}`
    : '';

  const handleGenerate = useCallback(async () => {
    setError('');
    try {
      const result = await createInvitation.mutateAsync({ groupId });
      setToken(result.token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate invitation'
      );
    }
  }, [groupId, createInvitation]);

  const handleCopy = useCallback(async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const textArea = document.createElement('textarea');
      textArea.value = invitationUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [invitationUrl]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-text-primary">
            Invite Friends
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-5">
          Generate a secure link to invite others to {groupName}
        </p>

        {!token ? (
          <button
            onClick={handleGenerate}
            disabled={createInvitation.isPending}
            className="btn-primary w-full mb-4"
          >
            {createInvitation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Generate Invite Link
              </span>
            )}
          </button>
        ) : (
          <div className="mb-4">
            {/* Generated link display */}
            <div className="p-4 bg-surface rounded-xl mb-3">
              <p className="text-xs text-text-secondary mb-2 uppercase tracking-wider font-medium">
                Invitation Link
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={invitationUrl}
                  className="flex-1 px-3 py-2.5 bg-white border border-border rounded-lg text-sm text-text-primary truncate"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-success/10 text-success'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Expires in 7 days
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={createInvitation.isPending}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {createInvitation.isPending ? 'Generating...' : 'Generate New Link'}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="btn-secondary w-full mt-2"
        >
          Done
        </button>
      </div>
    </div>
  );
}
