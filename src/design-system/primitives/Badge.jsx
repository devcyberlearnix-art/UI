import React from 'react';

const BADGE_VARIANTS = {
  default: 'bg-ink-800 text-ink-300 border-white/10',
  brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  emerald: 'bg-brand-emerald/15 text-emerald-300 border-brand-emerald/30',
  cyan: 'bg-brand-accent/15 text-cyan-300 border-brand-accent/30',
  amber: 'bg-brand-amber/15 text-amber-300 border-brand-amber/30',
  rose: 'bg-brand-rose/15 text-rose-300 border-brand-rose/30',
};

export const Badge = ({
  children,
  variant = 'default',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide border backdrop-blur-sm ${BADGE_VARIANTS[variant]} ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      )}
      {children}
    </span>
  );
};

export default Badge;
