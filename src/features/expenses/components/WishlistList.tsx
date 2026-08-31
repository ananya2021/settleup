import { useWishlist, useClaimWishlistItem } from '../hooks/useWishlist';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatMoney } from '@/domain/entities/Money';

interface Props {
  groupId?: string;
}

export function WishlistList({ groupId }: Props) {
  const { user } = useAuth();
  const { data: items, isLoading } = useWishlist(user?.id ?? '', groupId);
  const claimItem = useClaimWishlistItem();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card h-24" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
            <path d="M20 12v10H4V12" />
            <path d="M2 7h20v5H2z" />
            <path d="M12 22V7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>
        <p className="font-medium text-text-primary mb-1">No wishlist items</p>
        <p className="text-sm text-text-secondary">Add something you'd like the group to get</p>
      </div>
    );
  }

  const handleClaim = (itemId: string) => {
    claimItem.mutate(itemId);
  };

  return (
    <div className="card overflow-hidden">
      {items.map((item, index) => {
        const isOwn = item.userId === user?.id;
        const isClaimed = item.claimedBy !== null;
        const claimedByMe = item.claimedBy === user?.id;

        return (
          <div
            key={item.id}
            className={`p-4 transition-colors ${
              index < items.length - 1 ? 'border-b border-border/50' : ''
            } ${isClaimed ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-text-secondary mt-0.5">{item.description}</p>
                )}
                {item.amount && (
                  <p className="text-sm font-medium text-primary mt-1">
                    {formatMoney(item.amount)}
                  </p>
                )}
                <p className="text-xs text-text-tertiary mt-1.5">
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              {!isOwn && !isClaimed && (
                <button
                  onClick={() => handleClaim(item.id)}
                  disabled={claimItem.isPending}
                  className="btn-secondary text-sm px-3 py-1.5 flex-shrink-0"
                >
                  Claim
                </button>
              )}

              {isClaimed && (
                <div className="flex items-center gap-1.5 text-sm text-text-secondary flex-shrink-0">
                  {claimedByMe ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-success font-medium">Claimed</span>
                    </>
                  ) : (
                    <span>Gifted</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
