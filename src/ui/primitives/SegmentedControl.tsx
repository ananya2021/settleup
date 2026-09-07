import React from 'react';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={`inline-flex p-1 rounded-2xl bg-[var(--color-surface-sunken)] border border-[var(--color-border)] select-none w-full ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 font-medium transition-all rounded-xl pressable ${
              size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'
            } ${
              isSelected
                ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] shadow-sm font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
