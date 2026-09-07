import { useEffect, type ReactNode } from 'react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: 'var(--color-surface-overlay)' }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-[var(--color-surface-raised)] rounded-t-[28px] sm:rounded-[24px] shadow-2xl border border-[var(--color-border)] overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-6 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[var(--color-border)]" />
        </div>

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-6 pt-4 pb-3 border-b border-[var(--color-border-light)]">
            <div>
              {title && (
                <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 -mr-2 -mt-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-surface-sunken)] transition-colors pressable"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
