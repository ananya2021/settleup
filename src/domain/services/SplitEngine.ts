/**
 * SplitEngine — Pure calculation logic for expense splitting.
 *
 * Used for CLIENT-SIDE PREVIEW ONLY. Not the source of truth for financial state.
 * The authoritative split calculation happens in PostgreSQL functions.
 */

import { createMoney, type Money } from '../entities/Money';
import type { ExpenseSplitDraft } from '../entities/Expense';

export class SplitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SplitValidationError';
  }
}

export interface SplitInput {
  totalAmount: Money;
  participantIds: string[];
  payerId: string;
}

export class SplitEngine {
  /**
   * Split equally among participants. Payer gets the extra ₹1 on rounding.
   *
   * Example: ₹1000 among 3 (Riya pays):
   *   Riya: ₹334 (gets extra ₹1), Person2: ₹333, Person3: ₹333
   */
  static splitEqually(input: SplitInput): ExpenseSplitDraft[] {
    const { totalAmount, participantIds, payerId } = input;

    if (participantIds.length < 2) {
      throw new SplitValidationError('At least 2 participants required');
    }
    if (!participantIds.includes(payerId)) {
      throw new SplitValidationError('Payer must be a participant');
    }

    const n = participantIds.length;
    const baseShare = Math.floor(totalAmount / n);
    const remainder = totalAmount - baseShare * n;

    return participantIds.map((userId) => ({
      userId,
      amount: createMoney(userId === payerId ? baseShare + remainder : baseShare),
      isPayer: userId === payerId,
    }));
  }

  /**
   * Each participant specifies an exact amount. Must sum to totalAmount.
   */
  static splitByExact(
    totalAmount: Money,
    amounts: Array<{ userId: string; amount: Money }>
  ): ExpenseSplitDraft[] {
    if (amounts.length < 2) {
      throw new SplitValidationError('At least 2 participants required');
    }

    const sum = amounts.reduce((acc, a) => acc + a.amount, 0);
    if (sum !== totalAmount) {
      throw new SplitValidationError(
        `Split amounts (₹${sum}) must equal total amount (₹${totalAmount})`
      );
    }

    return amounts.map((a) => ({
      userId: a.userId,
      amount: a.amount,
      isPayer: false, // Caller must set isPayer based on context
    }));
  }

  /**
   * Each participant specifies a percentage (must sum to 100).
   * Payer gets remainder ₹1(s).
   */
  static splitByPercentage(
    totalAmount: Money,
    percentages: Array<{ userId: string; percentage: number; isPayer: boolean }>
  ): ExpenseSplitDraft[] {
    if (percentages.length < 2) {
      throw new SplitValidationError('At least 2 participants required');
    }

    const totalPct = percentages.reduce((acc, p) => acc + p.percentage, 0);
    if (totalPct !== 100) {
      throw new SplitValidationError(
        `Percentages must sum to 100 (got ${totalPct})`
      );
    }

    const payer = percentages.find((p) => p.isPayer);
    if (!payer) {
      throw new SplitValidationError('Payer must be specified');
    }

    // Calculate non-payer amounts first
    let computedSum = 0;
    const drafts: ExpenseSplitDraft[] = percentages.map((p) => {
      if (p.isPayer) return { userId: p.userId, amount: 0 as Money, isPayer: true };
      const amount = createMoney(Math.floor((totalAmount * p.percentage) / 100));
      computedSum += amount;
      return { userId: p.userId, amount, isPayer: false };
    });

    // Payer gets the remainder
    const payerAmount = createMoney(totalAmount - computedSum);
    const payerDraft = drafts.find((d) => d.isPayer);
    if (payerDraft) {
      payerDraft.amount = payerAmount;
    }

    return drafts;
  }

  /**
   * Validate that splits are well-formed.
   */
  static validateSplits(
    totalAmount: Money,
    splits: ExpenseSplitDraft[]
  ): void {
    if (splits.length < 2) {
      throw new SplitValidationError('At least 2 splits required');
    }

    const sum = splits.reduce((acc, s) => acc + s.amount, 0);
    if (sum !== totalAmount) {
      throw new SplitValidationError(
        `Split amounts (₹${sum}) must equal total amount (₹${totalAmount})`
      );
    }

    for (const split of splits) {
      if (split.amount <= 0) {
        throw new SplitValidationError('Each split amount must be positive');
      }
    }
  }
}
