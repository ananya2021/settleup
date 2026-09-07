import { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'positive' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-semibold transition-all select-none outline-none disabled:opacity-40 disabled:pointer-events-none pressable';

  const sizeClasses = {
    sm: 'min-h-[38px] px-3.5 py-1.5 text-xs rounded-full gap-1.5',
    md: 'min-h-[44px] px-5 py-2.5 text-sm rounded-full gap-2',
    lg: 'min-h-[50px] px-6 py-3 text-base rounded-full gap-2.5',
  };

  const variantStyles: Record<string, { className: string; style?: React.CSSProperties }> = {
    primary: {
      className: 'text-white shadow-md',
      style: { background: 'var(--gradient-primary)' },
    },
    secondary: {
      className: 'text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
      style: { background: 'var(--color-surface-raised)' },
    },
    tertiary: {
      className: 'text-[var(--color-accent)] hover:bg-[var(--color-accent-light)]',
      style: { background: 'transparent' },
    },
    ghost: {
      className: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]',
      style: { background: 'transparent' },
    },
    destructive: {
      className: 'text-white shadow-sm',
      style: { background: 'var(--gradient-owe)' },
    },
    positive: {
      className: 'text-white shadow-sm',
      style: { background: 'var(--gradient-owed)' },
    },
    icon: {
      className: 'min-h-[44px] min-w-[44px] p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-surface-sunken)]',
      style: { background: 'transparent' },
    },
  };

  const selectedVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${selectedVariant.className} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      style={selectedVariant.style}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
