import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

/**
 * Hook to subscribe to Supabase Realtime events and invalidate caches.
 * Realtime events cause the client to refetch authoritative data
 * rather than reconstructing financial state from payloads.
 */
export function useRealtimeSubscriptions(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to obligations where user is creditor
    const obligationsCreditorChannel = supabase
      .channel('obligations-creditor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'obligations',
          filter: `creditor_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['balances'] });
          queryClient.invalidateQueries({ queryKey: ['obligations'] });
        }
      )
      .subscribe();

    // Subscribe to obligations where user is debtor
    const obligationsDebtorChannel = supabase
      .channel('obligations-debtor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'obligations',
          filter: `debtor_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['balances'] });
          queryClient.invalidateQueries({ queryKey: ['obligations'] });
        }
      )
      .subscribe();

    // Subscribe to settlements where user is involved
    const settlementsFromChannel = supabase
      .channel('settlements-from')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settlements',
          filter: `from_user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['settlements'] });
          queryClient.invalidateQueries({ queryKey: ['balances'] });
        }
      )
      .subscribe();

    const settlementsToChannel = supabase
      .channel('settlements-to')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settlements',
          filter: `to_user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['settlements'] });
          queryClient.invalidateQueries({ queryKey: ['balances'] });
        }
      )
      .subscribe();

    // Subscribe to notifications for this user
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
        }
      )
      .subscribe();

    // Subscribe to group membership changes
    const groupMembersChannel = supabase
      .channel('group-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['groups'] });
          queryClient.invalidateQueries({ queryKey: ['group-members'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(obligationsCreditorChannel);
      supabase.removeChannel(obligationsDebtorChannel);
      supabase.removeChannel(settlementsFromChannel);
      supabase.removeChannel(settlementsToChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(groupMembersChannel);
    };
  }, [userId, queryClient]);
}
