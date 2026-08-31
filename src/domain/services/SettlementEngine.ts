/**
 * SettlementEngine — Pure calculation logic for settlement preview and cancellation preview.
 *
 * Used for CLIENT-SIDE PREVIEW ONLY. Not the source of truth for financial state.
 * The authoritative settlement logic lives in PostgreSQL functions.
 */

import { createMoney, createMoneyOrZero, type Money } from '../entities/Money';
import { getRemainingAmount, type Obligation } from '../entities/Obligation';
import type { SettlementPlan } from '../entities/Settlement';

export class SettlementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SettlementError';
  }
}

export interface CancelPreview {
  cancelledObligationId: string;
  reversalObligation: {
    creditorId: string;
    debtorId: string;
    amount: Money;
  } | null;
}

export class SettlementEngine {
  /**
   * Preview how a settlement would be allocated (FIFO, oldest first).
   *
   * Does NOT mutate any data. For display purposes only.
   */
  static previewAllocation(
    fromUserId: string,
    toUserId: string,
    amount: Money,
    obligations: Obligation[]
  ): SettlementPlan {
    // Filter to relevant obligations
    const relevant = obligations
      .filter(
        (o) =>
          o.debtorId === fromUserId &&
          o.creditorId === toUserId &&
          o.status !== 'cancelled' &&
          getRemainingAmount(o) > 0
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const allocations: Array<{ obligationId: string; amount: Money }> = [];
    let remainingPayment = amount as unknown as number;
    let totalAllocated = 0;

    for (const o of relevant) {
      if (remainingPayment <= 0) break;
      const oRemaining = getRemainingAmount(o) as unknown as number;
      const apply = Math.min(oRemaining, remainingPayment);
      allocations.push({ obligationId: o.id, amount: createMoney(apply) });
      remainingPayment -= apply;
      totalAllocated += apply;
    }

    return {
      allocations,
      totalAllocated: createMoney(totalAllocated),
      unallocated: createMoneyOrZero(remainingPayment),
    };
  }

  /**
   * Preview what would happen if an obligation is cancelled.
   *
   * Does NOT mutate any data. For display purposes only.
   */
  static previewCancellation(obligation: Obligation): CancelPreview {
    if (obligation.status === 'cancelled') {
      throw new SettlementError('Obligation is already cancelled');
    }

    if (obligation.settledAmount > 0) {
      // Reversal: creditor now owes debtor the settled amount
      return {
        cancelledObligationId: obligation.id,
        reversalObligation: {
          creditorId: obligation.debtorId,
          debtorId: obligation.creditorId,
          amount: createMoney(obligation.settledAmount),
        },
      };
    }

    // No settlement yet — simple cancel
    return {
      cancelledObligationId: obligation.id,
      reversalObligation: null,
    };
  }

  /**
   * Check if a settlement amount would result in overpayment.
   */
  static wouldOverpay(
    fromUserId: string,
    toUserId: string,
    amount: Money,
    obligations: Obligation[]
  ): boolean {
    const plan = this.previewAllocation(fromUserId, toUserId, amount, obligations);
    return plan.unallocated > 0;
  }
}
