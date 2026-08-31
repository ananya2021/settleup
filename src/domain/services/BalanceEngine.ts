/**
 * BalanceEngine — Pure calculation logic for balance computation.
 *
 * Used for CLIENT-SIDE display of balances from server-fetched obligation records.
 * The authoritative balance data comes from the server.
 */

import { createMoney, type Money } from '../entities/Money';
import { getRemainingAmount, type Obligation } from '../entities/Obligation';

export class BalanceEngine {
  /**
   * Calculate a user's net balance across ALL obligations.
   *
   * Positive = others owe this user money (net creditor).
   * Negative = this user owes money (net debtor).
   */
  static calculateNetBalance(userId: string, obligations: Obligation[]): number {
    let balance = 0;

    for (const o of obligations) {
      if (o.status === 'cancelled') continue;
      const remaining = getRemainingAmount(o);
      if (remaining <= 0) continue;

      if (o.creditorId === userId) {
        // Someone owes this user money
        balance += remaining;
      } else if (o.debtorId === userId) {
        // This user owes someone
        balance -= remaining;
      }
    }

    return balance;
  }

  /**
   * Calculate pairwise balances for a user.
   *
   * Positive = other user owes this user.
   * Negative = this user owes other user.
   */
  static calculatePairwiseBalances(
    userId: string,
    obligations: Obligation[]
  ): Map<string, number> {
    const pairwise = new Map<string, number>();

    for (const o of obligations) {
      if (o.status === 'cancelled') continue;
      const remaining = getRemainingAmount(o);
      if (remaining <= 0) continue;

      let otherUserId: string;
      let direction: number; // +1 = other owes user, -1 = user owes other

      if (o.creditorId === userId) {
        otherUserId = o.debtorId;
        direction = 1;
      } else if (o.debtorId === userId) {
        otherUserId = o.creditorId;
        direction = -1;
      } else {
        continue;
      }

      const current = pairwise.get(otherUserId) ?? 0;
      pairwise.set(otherUserId, current + direction * remaining);
    }

    return pairwise;
  }

  /**
   * Simplify all obligations into minimum set of transactions.
   *
   * Uses greedy algorithm: match largest debtor with largest creditor.
   */
  static getSimplifiedDebts(
    obligations: Obligation[]
  ): Array<{ from: string; to: string; amount: Money }> {
    // Compute net balance per user
    const netBalances = new Map<string, number>();

    for (const o of obligations) {
      if (o.status === 'cancelled') continue;
      const remaining = getRemainingAmount(o);
      if (remaining <= 0) continue;

      // creditor gains, debtor loses
      netBalances.set(o.creditorId, (netBalances.get(o.creditorId) ?? 0) + remaining);
      netBalances.set(o.debtorId, (netBalances.get(o.debtorId) ?? 0) - remaining);
    }

    // Separate into creditors and debtors
    const creditors: Array<{ userId: string; amount: number }> = [];
    const debtors: Array<{ userId: string; amount: number }> = [];

    for (const [userId, balance] of netBalances) {
      if (balance > 0) {
        creditors.push({ userId, amount: balance });
      } else if (balance < 0) {
        debtors.push({ userId, amount: -balance });
      }
    }

    // Sort descending by amount
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Greedy matching
    const result: Array<{ from: string; to: string; amount: Money }> = [];
    let ci = 0;
    let di = 0;

    while (ci < creditors.length && di < debtors.length) {
      const transfer = Math.min(creditors[ci].amount, debtors[di].amount);
      if (transfer > 0) {
        result.push({
          from: debtors[di].userId,
          to: creditors[ci].userId,
          amount: createMoney(transfer),
        });
      }

      creditors[ci].amount -= transfer;
      debtors[di].amount -= transfer;

      if (creditors[ci].amount === 0) ci++;
      if (debtors[di].amount === 0) di++;
    }

    return result;
  }
}
