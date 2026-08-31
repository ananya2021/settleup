import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface InvitationResult {
  id: string;
  token: string;
  group_id: string;
  group_name: string;
  expires_at: string;
}

/**
 * Create a group invitation (admin only).
 * Returns the secure invitation token.
 */
export function useCreateGroupInvitation() {
  return useMutation({
    mutationFn: async ({
      groupId,
    }: {
      groupId: string;
    }): Promise<InvitationResult> => {
      const { data, error } = await supabase.rpc(
        'create_group_invitation',
        {
          p_group_id: groupId,
        }
      );

      if (error) throw error;
      return data as InvitationResult;
    },
  });
}

export interface InvitationDetails {
  valid: boolean;
  error?: string;
  invitation_id?: string;
  group_id?: string;
  group_name?: string;
  inviter_name?: string;
  is_member?: boolean;
  expires_at?: string;
}

/**
 * Look up an invitation by token.
 * Accessible to both anon and authenticated users.
 */
export function useInvitationDetails(token: string) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: async (): Promise<InvitationDetails> => {
      const { data, error } = await supabase.rpc(
        'get_invitation_by_token',
        { p_token: token }
      );

      if (error) throw error;
      return data as InvitationDetails;
    },
    enabled: !!token,
    retry: false,
  });
}

/**
 * Accept a group invitation.
 * Requires authentication.
 */
export function useAcceptGroupInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      const { data, error } = await supabase.rpc(
        'accept_group_invitation',
        { p_token: token }
      );

      if (error) throw error;
      return data as {
        success: boolean;
        already_member: boolean;
        group_id: string;
        group_name: string;
      };
    },
    onSuccess: () => {
      // Invalidate groups and group-members queries
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
    },
  });
}
