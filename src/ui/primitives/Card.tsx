import { forwardRef, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  interactive = false,
  padded = true,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`${
        interactive ? 'apple-card-interactive' : 'apple-card'
      } ${padded ? 'p-5 sm:p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
