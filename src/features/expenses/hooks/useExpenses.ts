import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface GroupExpenseItem {
  id: string;
  groupId: string;
  paidBy: string;
  description: string;
  totalAmount: number;
  splitType: 'equal' | 'exact' | 'percentage';
  createdAt: Date;
  splits?: Array<{ id: string; userId: string; amount: number }>;
}

/**
 * Hook to fetch expenses for a specific group.
 * Backed by Supabase RLS policy on expenses table.
 */
export function useGroupExpenses(groupId: string) {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: async (): Promise<GroupExpenseItem[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          group_id,
          paid_by,
          description,
          total_amount,
          split_type,
          created_at,
          expense_splits (
            id,
            user_id,
            amount
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useGroupExpenses] error:', error);
        throw error;
      }

      return (data ?? []).map((e: any) => ({
        id: e.id,
        groupId: e.group_id,
        paidBy: e.paid_by,
        description: e.description,
        totalAmount: e.total_amount,
        splitType: e.split_type as 'equal' | 'exact' | 'percentage',
        createdAt: new Date(e.created_at),
        splits: (e.expense_splits ?? []).map((s: any) => ({
          id: s.id,
          userId: s.user_id,
          amount: s.amount,
        })),
      }));
    },
    enabled: !!groupId,
    staleTime: 15 * 1000,
  });
}

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
