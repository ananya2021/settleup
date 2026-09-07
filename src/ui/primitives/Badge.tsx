import React from 'react';

export type BalanceDirection = 'owe' | 'owed' | 'settled' | 'neutral';

export interface BadgeProps {
  direction?: BalanceDirection;
  label?: string;
  amount?: string;
  variant?: 'solid' | 'soft';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  direction = 'neutral',
  label,
  amount,
  className = '',
}) => {
  // Never color-only: Always pair color + arrow/check icon + unambiguous label
  if (direction === 'owe') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold select-none ${className}`}
        style={{
          backgroundColor: 'var(--color-owe-light)',
          color: 'var(--color-owe)',
          border: '1px solid var(--color-owe-border)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        <span>{label ?? 'You owe'}</span>
        {amount && <span className="font-bold text-amount ml-0.5">{amount}</span>}
      </span>
    );
  }

  if (direction === 'owed') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold select-none ${className}`}
        style={{
          backgroundColor: 'var(--color-owed-light)',
          color: 'var(--color-owed)',
          border: '1px solid var(--color-owed-border)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
        <span>{label ?? 'Owed to you'}</span>
        {amount && <span className="font-bold text-amount ml-0.5">{amount}</span>}
      </span>
    );
  }

  if (direction === 'settled') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold select-none ${className}`}
        style={{
          backgroundColor: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          border: '1px solid var(--color-accent-light-border)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>{label ?? 'Settled'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] border border-[var(--color-border)] select-none ${className}`}
    >
      <span>{label}</span>
      {amount && <span className="font-semibold text-amount ml-0.5">{amount}</span>}
    </span>
  );
};
