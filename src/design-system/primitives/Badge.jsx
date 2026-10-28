import React from 'react';

const BADGE_VARIANTS = {
  default: 'bg-[#14141A] text-[#A1A1AA] border-white/[0.06]',
  pewter: 'bg-[#14141A] text-[#A1A1AA] border-white/[0.06]',
  gold: 'bg-[#C5A880]/10 text-[#C5A880] border-[#C5A880]/30 shadow-[0_0_15px_rgba(197,168,128,0.08)]',
  mercury: 'bg-white/[0.06] text-[#E5E5E7] border-white/[0.12]',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  danger: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
  // Backward compatibility mappings
  brand: 'bg-[#C5A880]/10 text-[#C5A880] border-[#C5A880]/30',
  cyan: 'bg-[#C5A880]/10 text-[#C5A880] border-[#C5A880]/30',
  magenta: 'bg-white/[0.06] text-[#E5E5E7] border-white/[0.12]',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
};

export const Badge = ({
  children,
  variant = 'default',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border backdrop-blur-md transition-colors select-none ${
        BADGE_VARIANTS[variant] || BADGE_VARIANTS.default
      } ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90 animate-pulse" />
      )}
      {children}
    </span>
  );
};

export default Badge;
