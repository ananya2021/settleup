import type { Money } from './Money';

export type SplitType = 'equal' | 'exact' | 'percentage';

/**
 * An expense represents a purchase made within a group.
 */
export interface Expense {
  readonly id: string;
  readonly groupId: string;
  readonly paidBy: string;
  readonly description: string;
  readonly totalAmount: Money;
  readonly splitType: SplitType;
  readonly createdAt: Date;
}

/**
 * Every participant (including the payer) has an ExpenseSplit record.
 * Only non-payer splits generate obligations.
 */
export interface ExpenseSplit {
  readonly expenseId: string;
  readonly userId: string;
  readonly amount: Money;
}

/**
 * Draft split for preview (before persistence).
 */
export interface ExpenseSplitDraft {
  readonly userId: string;
  amount: Money;
  readonly isPayer: boolean;
}
