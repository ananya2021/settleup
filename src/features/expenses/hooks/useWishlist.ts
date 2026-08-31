import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Money } from '@/domain/entities/Money';

export interface WishlistItem {
  id: string;
  userId: string;
  groupId: string | null;
  title: string;
  description: string | null;
  amount: Money | null;
  claimedBy: string | null;
  createdAt: Date;
}

export function useWishlist(userId: string, groupId?: string) {
  return useQuery({
    queryKey: ['wishlist', userId, groupId],
    queryFn: async () => {
      let query = supabase
        .from('wishlist_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupId) {
        query = query.eq('group_id', groupId);
      } else {
        query = query.eq('user_id', userId).is('group_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((item) => ({
        id: item.id,
        userId: item.user_id,
        groupId: item.group_id,
        title: item.title,
        description: item.description,
        amount: item.amount as Money | null,
        claimedBy: item.claimed_by,
        createdAt: new Date(item.created_at),
      })) as WishlistItem[];
    },
    enabled: !!userId,
  });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      amount,
      groupId,
    }: {
      title: string;
      description?: string;
      amount?: number;
      groupId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          group_id: groupId || null,
          title,
          description: description || null,
          amount: amount || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useClaimWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wishlist_items')
        .update({ claimed_by: user.id })
        .eq('id', itemId)
        .is('claimed_by', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
