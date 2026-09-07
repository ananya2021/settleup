import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
}) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-2xl',
  }[variant];

  return (
    <div
      className={`animate-pulse bg-[var(--color-surface-sunken)] border border-[var(--color-border-light)] ${variantClasses} ${className}`}
      style={{
        width,
        height,
      }}
    />
  );
};
