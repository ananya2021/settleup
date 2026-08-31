import type { Money } from './Money';

/**
 * A direct person-to-person debt, outside of any group.
 */
export interface IndividualDebt {
  readonly id: string;
  readonly creditorId: string;
  readonly debtorId: string;
  readonly description: string;
  readonly amount: Money;
  readonly createdAt: Date;
}
