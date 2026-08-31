import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { IndividualDebt } from '@/domain/entities/IndividualDebt';

export function useIndividualDebts(userId: string) {
  return useQuery({
    queryKey: ['individual-debts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('individual_debts')
        .select('*')
        .or(`creditor_id.eq.${userId},debtor_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((d) => ({
        id: d.id,
        creditorId: d.creditor_id,
        debtorId: d.debtor_id,
        description: d.description,
        amount: d.amount,
        createdAt: new Date(d.created_at),
      })) as IndividualDebt[];
    },
    enabled: !!userId,
  });
}

export function useCreateIndividualDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      debtorId,
      description,
      amount,
    }: {
      debtorId: string;
      description: string;
      amount: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('create-individual-debt', {
        body: { debtorId, description, amount },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individual-debts'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
}
