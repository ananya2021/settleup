import { describe, it, expect } from 'vitest';
import { BalanceEngine } from '../BalanceEngine';
import { createMoney, createMoneyOrZero } from '../../entities/Money';
import type { Obligation } from '../../entities/Obligation';

function makeObligation(overrides: Partial<Obligation> & { id: string }): Obligation {
  return {
    groupId: null,
    expenseId: null,
    creditorId: 'creditor',
    debtorId: 'debtor',
    originalAmount: createMoney(100),
    settledAmount: createMoneyOrZero(0),
    status: 'pending',
    source: 'group_expense',
    sourceReference: null,
    createdAt: new Date('2024-01-01'),
    settledAt: null,
    cancelledAt: null,
    cancelledBy: null,
    ...overrides,
  };
}

describe('BalanceEngine', () => {
  describe('calculateNetBalance', () => {
    it('returns 0 for no obligations', () => {
      expect(BalanceEngine.calculateNetBalance('A', [])).toBe(0);
    });

    it('calculates net balance when user is creditor', () => {
      const obligations = [
        makeObligation({ id: '1', creditorId: 'A', debtorId: 'B', originalAmount: createMoney(100) }),
        makeObligation({ id: '2', creditorId: 'A', debtorId: 'C', originalAmount: createMoney(200) }),
      ];

      expect(BalanceEngine.calculateNetBalance('A', obligations)).toBe(300);
    });

    it('calculates net balance when user is debtor', () => {
      const obligations = [
        makeObligation({ id: '1', creditorId: 'B', debtorId: 'A', originalAmount: createMoney(100) }),
      ];

      expect(BalanceEngine.calculateNetBalance('A', obligations)).toBe(-100);
    });

    it('combines creditor and debtor positions', () => {
      const obligations = [
        makeObligation({ id: '1', creditorId: 'A', debtorId: 'B', originalAmount: createMoney(300) }),
        makeObligation({ id: '2', creditorId: 'C', debtorId: 'A', originalAmount: createMoney(100) }),
      ];

      // A is owed 300, owes 100 → net +200
      expect(BalanceEngine.calculateNetBalance('A', obligations)).toBe(200);
    });

    it('ignores cancelled obligations', () => {
      const obligations = [
        makeObligation({ id: '1', creditorId: 'A', debtorId: 'B', originalAmount: createMoney(100), status: 'cancelled' }),
      ];

      expect(BalanceEngine.calculateNetBalance('A', obligations)).toBe(0);
    });

    it('accounts for settled amounts', () => {
      const obligations = [
        makeObligation({
          id: '1',
          creditorId: 'A',
          debtorId: 'B',
          originalAmount: createMoney(500),
          settledAmount: createMoneyOrZero(200),
          status: 'partially_settled',
        }),
      ];

      // Remaining: 500 - 200 = 300
      expect(BalanceEngine.calculateNetBalance('A', obligations)).toBe(300);
    });
  });

  describe('calculatePairwiseBalances', () => {
    it('computes pairwise balance correctly', () => {
      const obligations = [
        makeObligation({ id: '1', creditorId: 'A', debtorId: 'B', originalAmount: createMoney(100) }),
        makeObligation({ id: '2', creditorId: 'B', debtorId: 'A', originalAmount: createMoney(40) }),
      ];

      const pairwise = BalanceEngine.calculatePairwiseBalances('A', obligations);

      // A is owed 100 by B, A owes 40 to B → net B owes A 60
      expect(pairwise.get('B')).toBe(60);
    });
  });

  describe('getSimplifiedDebts', () => {
    it('simplifies 3-way circular debt', () => {
      const obligations = [
        makeObligation({ id: '1', creditorId: 'B', debtorId: 'A', originalAmount: createMoney(300) }),
        makeObligation({ id: '2', creditorId: 'C', debtorId: 'B', originalAmount: createMoney(200) }),
        makeObligation({ id: '3', creditorId: 'A', debtorId: 'C', originalAmount: createMoney(100) }),
      ];

      const simplified = BalanceEngine.getSimplifiedDebts(obligations);

      // Net: A owes 200, B is owed 100, C is owed 100
      // A pays B: 100, A pays C: 100
      expect(simplified).toHaveLength(2);
      const aToB = simplified.find((d) => d.from === 'A' && d.to === 'B');
      const aToC = simplified.find((d) => d.from === 'A' && d.to === 'C');
      expect(aToB?.amount).toBe(100);
      expect(aToC?.amount).toBe(100);
    });
  });

  describe('cross-group balance aggregation', () => {
    it('aggregates obligations from different groups', () => {
      const obligations = [
        makeObligation({
          id: 'g1',
          groupId: 'group-1',
          creditorId: 'A',
          debtorId: 'B',
          originalAmount: createMoney(100),
        }),
        makeObligation({
          id: 'g2',
          groupId: 'group-2',
          creditorId: 'A',
          debtorId: 'B',
          originalAmount: createMoney(200),
        }),
        makeObligation({
          id: 'ind',
          groupId: null,
          creditorId: 'A',
          debtorId: 'B',
          originalAmount: createMoney(50),
        }),
      ];

      // A is owed 350 total from B across all sources
      expect(BalanceEngine.calculateNetBalance('A', obligations)).toBe(350);
    });

    it('aggregates individual and group obligations together', () => {
      const obligations = [
        makeObligation({
          id: 'group',
          groupId: 'group-1',
          creditorId: 'A',
          debtorId: 'B',
          originalAmount: createMoney(100),
        }),
        makeObligation({
          id: 'individual',
          groupId: null,
          creditorId: 'B',
          debtorId: 'A',
          originalAmount: createMoney(60),
        }),
      ];

      // A is owed 100, owes 60 → net +40
      expect(BalanceEngine.calculateNetBalance('A', obligations)).toBe(40);
    });
  });
});
