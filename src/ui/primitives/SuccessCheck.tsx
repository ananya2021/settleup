import React from 'react';

export interface SuccessCheckProps {
  title?: string;
  message?: string;
  className?: string;
}

export const SuccessCheck: React.FC<SuccessCheckProps> = ({
  title = 'All Done!',
  message,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-90 fade-in duration-300 ${className}`}>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg"
        style={{ background: 'var(--gradient-owed)' }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-in slide-in-from-bottom-2 duration-300"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-1">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
          {message}
        </p>
      )}
    </div>
  );
};
