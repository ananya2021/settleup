import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  emoji = '✨',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[24px] bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-sm ${className}`}>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm"
        style={{ background: 'var(--gradient-primary-soft)' }}
      >
        {icon ? icon : <span>{emoji}</span>}
      </div>
      <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
