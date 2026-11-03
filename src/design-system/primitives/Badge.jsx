import React from 'react';

const BADGE_VARIANTS = {
  default: 'bg-[#EAE5DC] dark:bg-[#272523] text-[#635E56] dark:text-[#A69F94] border-[#E3DCD3] dark:border-white/[0.08]',
  pewter: 'bg-[#EAE5DC] dark:bg-[#272523] text-[#635E56] dark:text-[#A69F94] border-[#E3DCD3] dark:border-white/[0.08]',
  gold: 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] border-[#D5C0D1] dark:border-[#D1A7CC]/30',
  mercury: 'bg-[#FFFEFA] dark:bg-[#1D1C1A] text-[#282521] dark:text-[#EDE8E1] border-[#E3DCD3] dark:border-white/[0.12]',
  emerald: 'bg-[#EBF3EE] dark:bg-[#529E73]/15 text-[#2B6747] dark:text-[#529E73] border-[#B7D9C5] dark:border-[#529E73]/30',
  amber: 'bg-[#F9F2E7] dark:bg-[#D19447]/15 text-[#935E1E] dark:text-[#D19447] border-[#E5CDA8] dark:border-[#D19447]/30',
  danger: 'bg-[#FAECEB] dark:bg-[#D66B67]/15 text-[#9B3835] dark:text-[#D66B67] border-[#E8B4B2] dark:border-[#D66B67]/30',
  clay: 'bg-[#F6EFEA] dark:bg-[#D9A48F]/15 text-[#9A6B56] dark:text-[#D9A48F] border-[#E0D0C7] dark:border-[#D9A48F]/30',
  // Backward compatibility mappings
  brand: 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] border-[#D5C0D1] dark:border-[#D1A7CC]/30',
  cyan: 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] border-[#D5C0D1] dark:border-[#D1A7CC]/30',
  magenta: 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] border-[#D5C0D1] dark:border-[#D1A7CC]/30',
  rose: 'bg-[#FAECEB] dark:bg-[#D66B67]/15 text-[#9B3835] dark:text-[#D66B67] border-[#E8B4B2] dark:border-[#D66B67]/30',
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
