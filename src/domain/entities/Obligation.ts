import type { Money } from './Money';

export type ObligationStatus = 'pending' | 'partially_settled' | 'settled' | 'cancelled';

export type ObligationSource = 'group_expense' | 'individual_debt' | 'reversal';

/**
 * An obligation is the atomic unit of debt in Split Pay.
 * Represents: "Person A (debtor) owes Person B (creditor) ₹X"
 */
export interface Obligation {
  readonly id: string;
  readonly groupId: string | null;
  readonly expenseId: string | null;
  readonly creditorId: string;
  readonly debtorId: string;
  readonly originalAmount: Money;
  readonly settledAmount: Money;
  readonly status: ObligationStatus;
  readonly source: ObligationSource;
  readonly sourceReference: string | null;
  readonly createdAt: Date;
  readonly settledAt: Date | null;
  readonly cancelledAt: Date | null;
  readonly cancelledBy: string | null;
}

/**
 * Compute remaining amount for an obligation.
 */
export function getRemainingAmount(obligation: Obligation): Money {
  return (obligation.originalAmount - obligation.settledAmount) as Money;
}

/**
 * Draft obligation for creation (before ID is assigned).
 */
export interface ObligationDraft {
  groupId: string | null;
  expenseId: string | null;
  creditorId: string;
  debtorId: string;
  originalAmount: Money;
  source: ObligationSource;
  sourceReference: string | null;
}
