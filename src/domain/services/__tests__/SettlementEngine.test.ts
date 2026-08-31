import { describe, it, expect } from 'vitest';
import { SettlementEngine, SettlementError } from '../SettlementEngine';
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

describe('SettlementEngine', () => {
  describe('previewAllocation', () => {
    it('allocates FIFO (oldest first)', () => {
      const obligations = [
        makeObligation({
          id: 'oldest',
          debtorId: 'Priya',
          creditorId: 'Riya',
          originalAmount: createMoney(100),
          createdAt: new Date('2024-01-10'),
        }),
        makeObligation({
          id: 'middle',
          debtorId: 'Priya',
          creditorId: 'Riya',
          originalAmount: createMoney(200),
          createdAt: new Date('2024-01-11'),
        }),
        makeObligation({
          id: 'newest',
          debtorId: 'Priya',
          creditorId: 'Riya',
          originalAmount: createMoney(150),
          createdAt: new Date('2024-01-13'),
        }),
      ];

      const plan = SettlementEngine.previewAllocation(
        'Priya',
        'Riya',
        createMoney(300),
        obligations
      );

      expect(plan.allocations).toHaveLength(2);
      expect(plan.allocations[0].obligationId).toBe('oldest');
      expect(plan.allocations[0].amount).toBe(100);
      expect(plan.allocations[1].obligationId).toBe('middle');
      expect(plan.allocations[1].amount).toBe(200);
      expect(plan.totalAllocated).toBe(300);
      expect(plan.unallocated).toBe(0);
    });

    it('handles partial FIFO settlement', () => {
      const obligations = [
        makeObligation({
          id: 'o1',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(100),
          createdAt: new Date('2024-01-10'),
        }),
        makeObligation({
          id: 'o2',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(200),
          createdAt: new Date('2024-01-11'),
        }),
      ];

      const plan = SettlementEngine.previewAllocation('P', 'R', createMoney(150), obligations);

      expect(plan.allocations).toHaveLength(2);
      expect(plan.allocations[0].amount).toBe(100); // o1 fully settled
      expect(plan.allocations[1].amount).toBe(50); // o2 partially settled
      expect(plan.totalAllocated).toBe(150);
      expect(plan.unallocated).toBe(0);
    });

    it('detects overpayment', () => {
      const obligations = [
        makeObligation({
          id: 'o1',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(100),
        }),
      ];

      const plan = SettlementEngine.previewAllocation('P', 'R', createMoney(150), obligations);

      expect(plan.totalAllocated).toBe(100);
      expect(plan.unallocated).toBe(50);
    });

    it('skips cancelled obligations', () => {
      const obligations = [
        makeObligation({
          id: 'cancelled',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(100),
          status: 'cancelled',
        }),
        makeObligation({
          id: 'active',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(50),
        }),
      ];

      const plan = SettlementEngine.previewAllocation('P', 'R', createMoney(50), obligations);

      expect(plan.allocations).toHaveLength(1);
      expect(plan.allocations[0].obligationId).toBe('active');
    });

    it('only allocates to matching debtor-creditor pair', () => {
      const obligations = [
        makeObligation({
          id: 'wrong-pair',
          debtorId: 'X',
          creditorId: 'Y',
          originalAmount: createMoney(100),
        }),
        makeObligation({
          id: 'correct',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(50),
        }),
      ];

      const plan = SettlementEngine.previewAllocation('P', 'R', createMoney(100), obligations);

      expect(plan.allocations).toHaveLength(1);
      expect(plan.allocations[0].obligationId).toBe('correct');
    });
  });

  describe('previewCancellation', () => {
    it('simple cancel when no settlement', () => {
      const obligation = makeObligation({
        id: 'o1',
        originalAmount: createMoney(500),
        settledAmount: createMoneyOrZero(0),
        status: 'pending',
      });

      const preview = SettlementEngine.previewCancellation(obligation);

      expect(preview.cancelledObligationId).toBe('o1');
      expect(preview.reversalObligation).toBeNull();
    });

    it('creates reversal when partially settled', () => {
      const obligation = makeObligation({
        id: 'o1',
        originalAmount: createMoney(500),
        settledAmount: createMoneyOrZero(200),
        status: 'partially_settled',
        creditorId: 'Creditor',
        debtorId: 'Debtor',
      });

      const preview = SettlementEngine.previewCancellation(obligation);

      expect(preview.reversalObligation).not.toBeNull();
      expect(preview.reversalObligation!.amount).toBe(200);
      // Reversal: creditor becomes debtor, debtor becomes creditor
      expect(preview.reversalObligation!.creditorId).toBe('Debtor');
      expect(preview.reversalObligation!.debtorId).toBe('Creditor');
    });

    it('creates full reversal when fully settled', () => {
      const obligation = makeObligation({
        id: 'o1',
        originalAmount: createMoney(500),
        settledAmount: createMoneyOrZero(500),
        status: 'settled',
        creditorId: 'C',
        debtorId: 'D',
      });

      const preview = SettlementEngine.previewCancellation(obligation);

      expect(preview.reversalObligation).not.toBeNull();
      expect(preview.reversalObligation!.amount).toBe(500);
      // Reversal swaps creditor/debtor
      expect(preview.reversalObligation!.creditorId).toBe('D');
      expect(preview.reversalObligation!.debtorId).toBe('C');
    });

    it('throws for already cancelled obligation', () => {
      const obligation = makeObligation({
        id: 'o1',
        status: 'cancelled',
      });

      expect(() => SettlementEngine.previewCancellation(obligation)).toThrow(SettlementError);
    });

    it('cancellation after full settlement creates reversal for full amount', () => {
      // Example: Riya owes Ananya ₹500, settles ₹500, Ananya cancels
      const obligation = makeObligation({
        id: 'riya-owes-ananya',
        originalAmount: createMoney(500),
        settledAmount: createMoneyOrZero(500),
        status: 'settled',
        creditorId: 'Ananya',
        debtorId: 'Riya',
      });

      const preview = SettlementEngine.previewCancellation(obligation);

      // Ananya cancelled, so now Ananya owes Riya ₹500
      expect(preview.reversalObligation).not.toBeNull();
      expect(preview.reversalObligation!.amount).toBe(500);
      expect(preview.reversalObligation!.creditorId).toBe('Riya');
      expect(preview.reversalObligation!.debtorId).toBe('Ananya');
    });
  });

  describe('wouldOverpay', () => {
    it('returns true when amount exceeds debt', () => {
      const obligations = [
        makeObligation({
          id: 'o1',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(100),
        }),
      ];

      expect(SettlementEngine.wouldOverpay('P', 'R', createMoney(150), obligations)).toBe(true);
    });

    it('returns false when amount is within debt', () => {
      const obligations = [
        makeObligation({
          id: 'o1',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(100),
        }),
      ];

      expect(SettlementEngine.wouldOverpay('P', 'R', createMoney(100), obligations)).toBe(false);
    });
  });

  describe('FIFO across different obligation sources', () => {
    it('settles oldest obligation first regardless of source', () => {
      const obligations = [
        makeObligation({
          id: 'individual',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(100),
          source: 'individual_debt',
          createdAt: new Date('2024-01-10'),
        }),
        makeObligation({
          id: 'group',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(200),
          source: 'group_expense',
          createdAt: new Date('2024-01-15'),
        }),
        makeObligation({
          id: 'reversal',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(50),
          source: 'reversal',
          createdAt: new Date('2024-01-20'),
        }),
      ];

      const plan = SettlementEngine.previewAllocation('P', 'R', createMoney(250), obligations);

      // Should settle individual (100) first, then group (150 of 200)
      expect(plan.allocations).toHaveLength(2);
      expect(plan.allocations[0].obligationId).toBe('individual');
      expect(plan.allocations[0].amount).toBe(100);
      expect(plan.allocations[1].obligationId).toBe('group');
      expect(plan.allocations[1].amount).toBe(150);
      expect(plan.totalAllocated).toBe(250);
    });
  });

  describe('settlement of reversal obligations', () => {
    it('can settle a reversal obligation via FIFO', () => {
      // After cancellation of a partially-settled obligation,
      // a reversal obligation is created. This test verifies
      // the reversal can be settled normally.
      const obligations = [
        makeObligation({
          id: 'original',
          debtorId: 'P',
          creditorId: 'R',
          originalAmount: createMoney(500),
          settledAmount: createMoneyOrZero(200),
          status: 'partially_settled',
          createdAt: new Date('2024-01-10'),
        }),
        makeObligation({
          id: 'reversal',
          debtorId: 'R', // R now owes P (reversal)
          creditorId: 'P',
          originalAmount: createMoney(200),
          source: 'reversal',
          createdAt: new Date('2024-01-15'),
        }),
      ];

      // P settles the reversal (P pays R the ₹200 R owes)
      const plan = SettlementEngine.previewAllocation('R', 'P', createMoney(200), obligations);

      expect(plan.allocations).toHaveLength(1);
      expect(plan.allocations[0].obligationId).toBe('reversal');
      expect(plan.allocations[0].amount).toBe(200);
      expect(plan.totalAllocated).toBe(200);
    });
  });
});
