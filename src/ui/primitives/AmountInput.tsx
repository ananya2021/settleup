import React from 'react';

export interface AmountInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  error?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  autoFocus = false,
  className = '',
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only permit positive integer whole numbers (no decimal dots or negative signs)
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onChange(raw);
  };

  return (
    <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
      <div className="relative inline-flex items-baseline justify-center">
        <span className="text-2xl sm:text-3xl font-semibold text-[var(--color-text-secondary)] mr-1 select-none">
          ₹
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="text-amount-hero bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none text-center font-bold max-w-[280px] sm:max-w-[360px]"
          style={{ width: `${Math.max(String(value || placeholder).length, 1) + 0.5}ch` }}
        />
      </div>
      <p className="text-xs text-[var(--color-text-tertiary)] mt-1.5 font-medium">
        Whole rupees only
      </p>
      {error && (
        <p className="text-xs font-semibold text-[var(--color-owe)] mt-2">
          {error}
        </p>
      )}
    </div>
  );
};
