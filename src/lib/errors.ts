/**
 * Domain error types for Split Pay.
 */

export class DomainError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}

export class InvalidMoneyError extends DomainError {
  constructor(value: unknown) {
    super('INVALID_MONEY', `Invalid monetary value: ${value}. Must be a positive integer in INR.`);
  }
}

export class InsufficientObligationsError extends DomainError {
  constructor(debtorId: string, creditorId: string) {
    super('INSUFFICIENT_OBLIGATIONS', `No active obligations found between ${debtorId} and ${creditorId}.`);
  }
}

export class OverpaymentError extends DomainError {
  constructor(amount: number, maxOwed: number) {
    super('OVERPAYMENT', `Payment of ₹${amount} exceeds total owed of ₹${maxOwed}.`);
  }
}

export class CancellationNotAllowedError extends DomainError {
  constructor(obligationId: string) {
    super('CANCELLATION_NOT_ALLOWED', `Cannot cancel obligation ${obligationId}: already settled.`);
  }
}

export class SplitValidationError extends DomainError {
  constructor(message: string) {
    super('SPLIT_VALIDATION', message);
  }
}

export class AuthenticationError extends DomainError {
  constructor(message = 'Authentication required') {
    super('AUTHENTICATION', message);
  }
}

export class AuthorizationError extends DomainError {
  constructor(message = 'Not authorized') {
    super('AUTHORIZATION', message);
  }
}
