import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Group } from '@/domain/entities/Group';

/** Map raw Supabase snake_case group columns to our camelCase Group interface. */
function mapGroup(raw: Record<string, unknown>): Group {
  return {
    id: raw.id as string,
    name: raw.name as string,
    createdBy: raw.created_by as string,
    createdAt: new Date(raw.created_at as string),
  };
}

export function useGroups(userId: string) {
  return useQuery({
    queryKey: ['groups', userId],
    queryFn: async () => {
      // Step 1: Get the groups this user belongs to
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (membershipError) {
        console.error('[useGroups] membership query failed:', membershipError);
        throw membershipError;
      }

      if (!memberships || memberships.length === 0) {
        return [];
      }

      const groupIds = memberships.map((membership) => membership.group_id);

      // Step 2: Fetch the actual groups separately
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, created_by, created_at')
        .in('id', groupIds);

      if (groupsError) {
        console.error('[useGroups] groups query failed:', groupsError);
        throw groupsError;
      }

      return (groups ?? []).map((group) =>
        mapGroup(group as unknown as Record<string, unknown>)
      );
    },
    enabled: !!userId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data, error } = await supabase.rpc('create_group', {
        p_name: name,
      });

      if (error) throw error;
      // RPC returns { id, name, created_by } — not a full Group.
      // The mutation result is not used directly; onSuccess invalidates the list query.
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('*, profiles!inner(name, email)')
        .eq('group_id', groupId);

      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });
}
