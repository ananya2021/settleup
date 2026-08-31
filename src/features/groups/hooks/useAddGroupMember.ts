import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Add a member to a group (admin only).
 * Calls the add_group_member PostgreSQL function.
 */
export function useAddGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase.rpc('add_group_member', {
        p_group_id: groupId,
        p_user_id: userId,
      });

      if (error) throw error;
      return data as {
        group_id: string;
        user_id: string;
        role: string;
        name: string;
        email: string;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['group-members', groupId],
      });
    },
  });
}
