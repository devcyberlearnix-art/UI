import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700 shadow-glow-brand border border-brand-400/30',
  secondary:
    'bg-ink-800/80 text-ink-100 hover:bg-ink-700/80 active:bg-ink-850 border border-white/10 hover:border-white/20',
  ghost:
    'bg-transparent text-ink-300 hover:text-white hover:bg-white/5 active:bg-white/10',
  danger:
    'bg-brand-rose/20 text-rose-300 hover:bg-brand-rose/30 active:bg-brand-rose/40 border border-brand-rose/40',
  cyan:
    'bg-brand-accent/20 text-cyan-300 hover:bg-brand-accent/30 active:bg-brand-accent/40 border border-brand-accent/40 shadow-glow-cyan',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base font-bold rounded-2xl gap-2.5',
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
      whileHover={isDisabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.97, y: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`relative inline-flex items-center justify-center font-sans tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:opacity-50 disabled:pointer-events-none select-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {/* Morphing Loading Overlay without layout displacement */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit backdrop-blur-[1px]">
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
