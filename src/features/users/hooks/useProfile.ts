import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/domain/entities/Profile';

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[useProfile] query failed:', error);
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        notificationPreferences: data.notification_preferences || {
          emailNotifications: true,
          pushNotifications: true,
          dailyReminder: false,
        },
        activeSessionId: data.active_session_id,
        createdAt: new Date(data.created_at),
      };
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
