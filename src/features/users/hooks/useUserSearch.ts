import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

/**
 * Search for other Split Pay users by email prefix or name.
 * Requires the search_users PostgreSQL function (migration 00019).
 *
 * - Query must be at least 2 characters.
 * - Returns up to 10 results.
 * - Excludes the current user.
 */
export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['user-search', query],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_users', {
        p_query: query.trim(),
      });

      if (error) throw error;

      return (data ?? []) as UserSearchResult[];
    },
    enabled: query.trim().length >= 2,
    staleTime: 30_000, // 30 seconds — user list doesn't change often
  });
}
