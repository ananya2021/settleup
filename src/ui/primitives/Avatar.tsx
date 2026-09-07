import React from 'react';

export interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  imageUrl?: string | null;
  className?: string;
}

// 8 Curated gradient families (Lavender, Violet, Mint, Sky, Peach, Coral, Rose, Sunset)
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #7C5CFF 0%, #B488FF 100%)', // Lavender
  'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)', // Mint -> Sky
  'linear-gradient(135deg, #FF6F61 0%, #FFA07A 100%)', // Coral -> Peach
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', // Violet -> Rose
  'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)', // Ocean -> Indigo
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)', // Amber -> Ruby
  'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)', // Cyan -> Emerald
  'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', // Indigo -> Purple
];

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export function getInitials(name: string): string {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm font-semibold',
  lg: 'w-12 h-12 text-base font-semibold',
  xl: 'w-16 h-16 text-xl font-bold',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  imageUrl,
  className = '',
}) => {
  const gradient = getAvatarGradient(name);
  const initials = getInitials(name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`rounded-full object-cover shadow-sm flex-shrink-0 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0 select-none ${sizeClasses[size]} ${className}`}
      style={{ background: gradient }}
      aria-label={name}
      role="img"
    >
      <span>{initials}</span>
    </div>
  );
};
