import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Hook to create a group expense via Edge Function.
 * The Edge Function delegates to the create_group_expense PostgreSQL function.
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      description,
      totalAmount,
      splitType,
      splits,
    }: {
      groupId: string;
      description: string;
      totalAmount: number;
      splitType: 'equal' | 'exact' | 'percentage';
      splits: Array<{ user_id: string; amount: number }>;
    }) => {
      const response = await supabase.functions.invoke('create-expense', {
        body: { groupId, description, totalAmount, splitType, splits },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

/**
 * Hook to settle a debt via Edge Function.
 * The Edge Function delegates to the settle_debt PostgreSQL function.
 */
export function useSettle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fromUserId,
      toUserId,
      amount,
    }: {
      fromUserId: string;
      toUserId: string;
      amount: number;
    }) => {
      const response = await supabase.functions.invoke('settle', {
        body: { fromUserId, toUserId, amount },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    },
  });
}

/**
 * Hook to cancel an obligation via Edge Function.
 * The Edge Function delegates to the cancel_obligation PostgreSQL function.
 */
export function useCancelObligation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ obligationId }: { obligationId: string }) => {
      const response = await supabase.functions.invoke('cancel-obligation', {
        body: { obligationId },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
    },
  });
}

/**
 * Hook to cancel an expense via Edge Function.
 * The Edge Function delegates to the cancel_expense PostgreSQL function.
 */
export function useCancelExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expenseId }: { expenseId: string }) => {
      const response = await supabase.functions.invoke('cancel-expense', {
        body: { expenseId },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
