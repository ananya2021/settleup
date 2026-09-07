import { useWishlist, useClaimWishlistItem } from '../hooks/useWishlist';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatMoney } from '@/domain/entities/Money';
import { Card } from '@/ui/primitives/Card';
import { Button } from '@/ui/primitives/Button';
import { EmptyState } from '@/ui/primitives/EmptyState';
import { Skeleton } from '@/ui/primitives/Skeleton';

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
          <Skeleton key={i} height={72} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        emoji="🎁"
        title="No wishlist items"
        description="Add items you or the group would like to purchase together."
      />
    );
  }

  const handleClaim = (itemId: string) => {
    claimItem.mutate(itemId);
  };

  return (
    <Card padded={false} className="divide-y divide-[var(--color-border-light)] overflow-hidden">
      {items.map((item) => {
        const isOwn = item.userId === user?.id;
        const isClaimed = item.claimedBy !== null;
        const claimedByMe = item.claimedBy === user?.id;

        return (
          <div
            key={item.id}
            className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--color-surface-sunken)] transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                  {item.title}
                </h4>
                {item.amount && (
                  <span className="text-xs font-bold text-amount text-[var(--color-accent)]">
                    {formatMoney(item.amount)}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">
                  {item.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isClaimed ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-owed-light)] text-[var(--color-owed)]">
                  {claimedByMe ? 'Claimed by you' : 'Claimed'}
                </span>
              ) : !isOwn ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleClaim(item.id)}
                  disabled={claimItem.isPending}
                >
                  Claim
                </Button>
              ) : (
                <span className="text-xs text-[var(--color-text-tertiary)]">Added by you</span>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
