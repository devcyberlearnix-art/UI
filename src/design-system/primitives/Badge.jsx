import React from 'react';

const BADGE_VARIANTS = {
  default: 'bg-slate-100 dark:bg-[#14141A] text-slate-700 dark:text-[#A1A1AA] border-slate-200 dark:border-white/[0.06]',
  pewter: 'bg-slate-100 dark:bg-[#14141A] text-slate-700 dark:text-[#A1A1AA] border-slate-200 dark:border-white/[0.06]',
  gold: 'bg-blue-50 dark:bg-[#C5A880]/10 text-blue-700 dark:text-[#C5A880] border-blue-200 dark:border-[#C5A880]/30 shadow-xs dark:shadow-[0_0_15px_rgba(197,168,128,0.08)]',
  mercury: 'bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-[#E5E5E7] border-slate-200 dark:border-white/[0.12]',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/25',
  danger: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/25',
  // Backward compatibility mappings
  brand: 'bg-blue-50 dark:bg-[#C5A880]/10 text-blue-700 dark:text-[#C5A880] border-blue-200 dark:border-[#C5A880]/30',
  cyan: 'bg-cyan-50 dark:bg-[#C5A880]/10 text-cyan-700 dark:text-[#C5A880] border-cyan-200 dark:border-[#C5A880]/30',
  magenta: 'bg-purple-50 dark:bg-white/[0.06] text-purple-700 dark:text-[#E5E5E7] border-purple-200 dark:border-white/[0.12]',
  rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/25',
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
