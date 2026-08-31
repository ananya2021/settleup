import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BalanceEngine } from '@/domain/services/BalanceEngine';
import type { Obligation } from '@/domain/entities/Obligation';

export function useBalances(userId: string) {
  return useQuery({
    queryKey: ['balances', userId],
    queryFn: async () => {
      // Fetch all non-cancelled obligations where user is involved
      const { data, error } = await supabase
        .from('obligations')
        .select('*')
        .or(`creditor_id.eq.${userId},debtor_id.eq.${userId}`)
        .neq('status', 'cancelled');

      if (error) throw error;

      // Cast to Obligation type (DB returns snake_case, but we map it)
      const obligations: Obligation[] = data.map((o) => ({
        id: o.id,
        groupId: o.group_id,
        expenseId: o.expense_id,
        creditorId: o.creditor_id,
        debtorId: o.debtor_id,
        originalAmount: o.original_amount,
        settledAmount: o.settled_amount,
        status: o.status,
        source: o.source,
        sourceReference: o.source_reference,
        createdAt: new Date(o.created_at),
        settledAt: o.settled_at ? new Date(o.settled_at) : null,
        cancelledAt: o.cancelled_at ? new Date(o.cancelled_at) : null,
        cancelledBy: o.cancelled_by,
      }));

      const netBalance = BalanceEngine.calculateNetBalance(userId, obligations);
      const pairwise = BalanceEngine.calculatePairwiseBalances(userId, obligations);
      const simplified = BalanceEngine.getSimplifiedDebts(obligations);

      return {
        netBalance,
        pairwise: Object.fromEntries(pairwise),
        simplified,
        obligations,
      };
    },
    enabled: !!userId,
    staleTime: 10 * 1000, // 10 seconds
  });
}
