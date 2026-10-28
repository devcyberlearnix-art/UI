import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Intentional spring physics configuration per architectural specification
const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

const VARIANTS = {
  primary:
    'bg-[#C5A880] text-[#070709] font-bold border border-[#C5A880] hover:bg-[#D4BC98] hover:border-[#D4BC98] shadow-[0_4px_20px_rgba(197,168,128,0.22)] active:bg-[#B8976C]',
  secondary:
    'bg-[#14141A] text-[#E5E5E7] hover:text-white hover:bg-[#1B1B24] border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-xl',
  gold:
    'bg-[#C5A880] text-[#070709] font-bold border border-[#C5A880] hover:bg-[#D4BC98] shadow-[0_4px_20px_rgba(197,168,128,0.22)] active:bg-[#B8976C]',
  ghost:
    'bg-transparent text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-white/[0.04] active:bg-white/[0.08] border border-transparent',
  outline:
    'bg-transparent text-[#E5E5E7] hover:text-white border border-white/[0.08] hover:border-[#C5A880]/50 hover:bg-[#C5A880]/[0.04]',
  danger:
    'bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/60',
  // Compatibility aliases
  cyan:
    'bg-[#C5A880] text-[#070709] font-bold border border-[#C5A880] hover:bg-[#D4BC98] shadow-[0_4px_20px_rgba(197,168,128,0.22)]',
  magenta:
    'bg-[#14141A] text-[#E5E5E7] border border-white/[0.08] hover:border-[#C5A880]/50',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 py-3 text-base font-bold rounded-xl gap-2.5',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={isDisabled ? undefined : { scale: 1.01, y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={SPRING_TRANSITION}
      className={`relative inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070709] disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {/* Morphing Loading Overlay without layout displacement */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit backdrop-blur-[2px]">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        </span>
      )}

      {/* Content wrapper with subtle opacity dip on loading */}
      <span
        className={`inline-flex items-center gap-2 transition-opacity duration-150 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />}
        <span>{children}</span>
        {RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
      </span>
    </motion.button>
  );
};

export default Button;
