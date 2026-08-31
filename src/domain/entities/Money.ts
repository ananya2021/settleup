/**
 * Money value object for integer INR.
 *
 * All monetary values in Split Pay are whole-number Indian Rupees.
 * Decimal values (₹2500.50) are INVALID.
 * Negative values are INVALID.
 */

declare const __brand: unique symbol;

export type Money = number & { readonly [__brand]: 'Money' };

export class InvalidMoneyError extends Error {
  constructor(value: unknown) {
    super(`Invalid monetary value: ${value}. All amounts must be positive integers in INR.`);
    this.name = 'InvalidMoneyError';
  }
}

/**
 * Create a Money value. Must be a positive integer (> 0).
 * @throws {InvalidMoneyError} if value is not a positive integer
 */
export function createMoney(value: number): Money {
  if (!Number.isInteger(value)) {
    throw new InvalidMoneyError(value);
  }
  if (value <= 0) {
    throw new InvalidMoneyError(value);
  }
  return value as Money;
}

/**
 * Create a Money value that allows zero.
 * Used for settled_amount which starts at 0.
 * @throws {InvalidMoneyError} if value is negative or not an integer
 */
export function createMoneyOrZero(value: number): Money {
  if (!Number.isInteger(value)) {
    throw new InvalidMoneyError(value);
  }
  if (value < 0) {
    throw new InvalidMoneyError(value);
  }
  return value as Money;
}

/**
 * Format a Money value as ₹ display string.
 */
export function formatMoney(amount: Money): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
