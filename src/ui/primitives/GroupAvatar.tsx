import React from 'react';
import { getAvatarGradient, getInitials } from './Avatar';

export interface GroupAvatarProps {
  name: string;
  emoji?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-9 h-9 text-xs rounded-xl',
  md: 'w-11 h-11 text-sm rounded-2xl',
  lg: 'w-14 h-14 text-lg rounded-[1.25rem]',
  xl: 'w-20 h-20 text-2xl rounded-[1.5rem]',
};

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  name,
  emoji,
  size = 'md',
  className = '',
}) => {
  const gradient = getAvatarGradient(name);
  const initials = getInitials(name);

  return (
    <div
      className={`flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 select-none ${sizeClasses[size]} ${className}`}
      style={{ background: gradient }}
      aria-label={name}
      role="img"
    >
      {emoji ? (
        <span className="text-xl leading-none">{emoji}</span>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
