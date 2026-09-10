import { useState, useCallback } from 'react';
import { useCreateGroupInvitation } from '../hooks/useInvitations';
import { Sheet } from '@/ui/primitives/Sheet';
import { Button } from '@/ui/primitives/Button';

interface InviteMembersModalProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

export function InviteMembersModal({ groupId, groupName, onClose }: InviteMembersModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const createInvitation = useCreateGroupInvitation();

  const invitationUrl = token ? `${window.location.origin}/invite/${token}` : '';

  const handleGenerate = useCallback(async () => {
    setError('');
    try {
      const result = await createInvitation.mutateAsync({ groupId });
      setToken(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invitation link');
    }
  }, [groupId, createInvitation]);

  const handleCopy = useCallback(async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const handleNativeShare = useCallback(async () => {
    if (!invitationUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on Splitwise`,
          text: `Hey! Join my group "${groupName}" on Splitwise to easily split expenses:`,
          url: invitationUrl,
        });
      } catch (err) {
        // Fallback to copy if user cancelled or dismissed
        console.log('Share dismissed:', err);
      }
    } else {
      handleCopy();
    }
  }, [invitationUrl, groupName, handleCopy]);

  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="Invite Friends"
      subtitle={`Anyone with this secure link can join ${groupName}`}
    >
      <div className="space-y-5">
        {!token ? (
          <div className="p-6 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-sm">
              🔗
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-text-primary)]">
                Generate a 7-day Invite Link
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Share with friends via WhatsApp, iMessage, Telegram, or email.
              </p>
            </div>
            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={handleGenerate}
              loading={createInvitation.isPending}
            >
              Generate Invite Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Invite Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={invitationUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] truncate outline-none select-all"
                />
              </div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                <span>⏳</span> Link valid for 7 days
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopy}
                icon={
                  copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )
                }
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleNativeShare}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                }
              >
                Share Link
              </Button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={handleGenerate}
                disabled={createInvitation.isPending}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline pressable"
              >
                Generate a fresh link
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl text-xs font-semibold bg-[var(--color-owe-light)] text-[var(--color-owe)]">
            {error}
          </div>
        )}

        <Button variant="ghost" fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </Sheet>
  );
}
