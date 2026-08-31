import { describe, it, expect } from 'vitest';
import { SplitEngine, SplitValidationError } from '../SplitEngine';
import { createMoney } from '../../entities/Money';

describe('SplitEngine', () => {
  describe('splitEqually', () => {
    it('splits evenly with no remainder', () => {
      const splits = SplitEngine.splitEqually({
        totalAmount: createMoney(1000),
        participantIds: ['A', 'B'],
        payerId: 'A',
      });

      expect(splits).toHaveLength(2);
      const payerSplit = splits.find((s) => s.userId === 'A')!;
      const otherSplit = splits.find((s) => s.userId === 'B')!;
      expect(payerSplit.amount).toBe(500);
      expect(otherSplit.amount).toBe(500);
      expect(payerSplit.isPayer).toBe(true);
    });

    it('gives payer the extra ₹1 on rounding (3 people, ₹1000)', () => {
      const splits = SplitEngine.splitEqually({
        totalAmount: createMoney(1000),
        participantIds: ['Riya', 'Priya', 'Neha'],
        payerId: 'Riya',
      });

      expect(splits).toHaveLength(3);
      const riya = splits.find((s) => s.userId === 'Riya')!;
      const priya = splits.find((s) => s.userId === 'Priya')!;
      const neha = splits.find((s) => s.userId === 'Neha')!;

      expect(riya.amount).toBe(334); // 333 + 1 remainder
      expect(priya.amount).toBe(333);
      expect(neha.amount).toBe(333);

      // Sum must equal total
      expect(riya.amount + priya.amount + neha.amount).toBe(1000);
    });

    it('gives payer extra ₹2 on larger remainder (₹1001, 3 people)', () => {
      const splits = SplitEngine.splitEqually({
        totalAmount: createMoney(1001),
        participantIds: ['A', 'B', 'C'],
        payerId: 'A',
      });

      const payer = splits.find((s) => s.userId === 'A')!;
      expect(payer.amount).toBe(335); // 333 + 2

      const sum = splits.reduce((acc, s) => acc + s.amount, 0);
      expect(sum).toBe(1001);
    });

    it('throws with less than 2 participants', () => {
      expect(() =>
        SplitEngine.splitEqually({
          totalAmount: createMoney(100),
          participantIds: ['A'],
          payerId: 'A',
        })
      ).toThrow(SplitValidationError);
    });

    it('throws if payer is not a participant', () => {
      expect(() =>
        SplitEngine.splitEqually({
          totalAmount: createMoney(100),
          participantIds: ['A', 'B'],
          payerId: 'C',
        })
      ).toThrow(SplitValidationError);
    });
  });

  describe('splitByExact', () => {
    it('splits with exact amounts that sum to total', () => {
      const splits = SplitEngine.splitByExact(createMoney(1000), [
        { userId: 'Riya', amount: createMoney(200) },
        { userId: 'Priya', amount: createMoney(300) },
        { userId: 'Neha', amount: createMoney(500) },
      ]);

      expect(splits).toHaveLength(3);
      const sum = splits.reduce((acc, s) => acc + s.amount, 0);
      expect(sum).toBe(1000);
    });

    it('throws when amounts do not sum to total', () => {
      expect(() =>
        SplitEngine.splitByExact(createMoney(1000), [
          { userId: 'A', amount: createMoney(300) },
          { userId: 'B', amount: createMoney(300) },
        ])
      ).toThrow(SplitValidationError);
    });
  });

  describe('splitByPercentage', () => {
    it('splits by percentages that sum to 100', () => {
      const splits = SplitEngine.splitByPercentage(createMoney(1000), [
        { userId: 'Riya', percentage: 40, isPayer: true },
        { userId: 'A', percentage: 30, isPayer: false },
        { userId: 'B', percentage: 30, isPayer: false },
      ]);

      const riya = splits.find((s) => s.userId === 'Riya')!;
      const a = splits.find((s) => s.userId === 'A')!;
      const b = splits.find((s) => s.userId === 'B')!;

      expect(a.amount).toBe(300);
      expect(b.amount).toBe(300);
      expect(riya.amount).toBe(400); // payer gets remainder

      const sum = splits.reduce((acc, s) => acc + s.amount, 0);
      expect(sum).toBe(1000);
    });

    it('throws when percentages do not sum to 100', () => {
      expect(() =>
        SplitEngine.splitByPercentage(createMoney(1000), [
          { userId: 'A', percentage: 50, isPayer: true },
          { userId: 'B', percentage: 30, isPayer: false },
        ])
      ).toThrow(SplitValidationError);
    });
  });
});
