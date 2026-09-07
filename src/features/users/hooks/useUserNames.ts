import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export function useUserNames(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const sortedKey = [...uniqueIds].sort().join(',');

  return useQuery({
    queryKey: ['user-profiles-batch', sortedKey],
    queryFn: async (): Promise<Record<string, UserSummary>> => {
      if (uniqueIds.length === 0) return {};

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', uniqueIds);

      if (error) {
        console.warn('[useUserNames] failed to fetch profiles:', error.message);
        return {};
      }

      const map: Record<string, UserSummary> = {};
      for (const p of data ?? []) {
        map[p.id] = {
          id: p.id,
          name: p.name || p.email.split('@')[0] || 'User',
          email: p.email,
        };
      }
      return map;
    },
    enabled: uniqueIds.length > 0,
    staleTime: 60 * 1000,
  });
}
