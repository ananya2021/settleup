import type { Money } from './Money';

/**
 * A settlement is a payment from debtor to creditor.
 */
export interface Settlement {
  readonly id: string;
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amount: Money;
  readonly createdAt: Date;
}

/**
 * Records which specific obligations a settlement was applied to.
 */
export interface SettlementAllocation {
  readonly id: string;
  readonly settlementId: string;
  readonly obligationId: string;
  readonly amount: Money;
}

/**
 * Preview of how a settlement would be allocated.
 */
export interface SettlementPlan {
  readonly allocations: ReadonlyArray<{
    readonly obligationId: string;
    readonly amount: Money;
  }>;
  readonly totalAllocated: Money;
  readonly unallocated: Money;
}
