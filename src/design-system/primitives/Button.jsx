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
    'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] font-semibold border border-[#5B3E57] dark:border-[#D1A7CC] hover:bg-[#462D42] dark:hover:bg-[#E0BFDC] hover:border-[#462D42] dark:hover:border-[#E0BFDC] shadow-sm hover:shadow-md active:bg-[#382335] dark:active:bg-[#C092BB]',
  secondary:
    'bg-[#EAE5DC] dark:bg-[#1D1C1A] text-[#282521] dark:text-[#EDE8E1] hover:text-[#282521] dark:hover:text-[#FFFEFA] hover:bg-[#E1DBD0] dark:hover:bg-[#2B2926] border border-[#E3DCD3] dark:border-white/[0.08] hover:border-[#D8D0C5] dark:hover:border-white/[0.14]',
  gold:
    'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] font-semibold border border-[#5B3E57] dark:border-[#D1A7CC] hover:bg-[#462D42] dark:hover:bg-[#E0BFDC] hover:border-[#462D42] dark:hover:border-[#E0BFDC] shadow-sm hover:shadow-md active:bg-[#382335] dark:active:bg-[#C092BB]',
  ghost:
    'bg-transparent text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1] hover:bg-[#EAE5DC]/60 dark:hover:bg-white/[0.05] active:bg-[#EAE5DC] dark:active:bg-white/[0.08] border border-transparent',
  outline:
    'bg-transparent text-[#282521] dark:text-[#EDE8E1] hover:text-[#282521] dark:hover:text-white border border-[#E3DCD3] dark:border-white/[0.1] hover:border-[#5B3E57] dark:hover:border-[#D1A7CC]/50 hover:bg-[#F2ECF1]/50 dark:hover:bg-[#D1A7CC]/[0.05]',
  danger:
    'bg-[#FAECEB] dark:bg-[#D66B67]/15 text-[#9B3835] dark:text-[#D66B67] hover:bg-[#F7D8D7] dark:hover:bg-[#D66B67]/25 border border-[#E8B4B2] dark:border-[#D66B67]/30 hover:border-[#DF908D] dark:hover:border-[#D66B67]/50',
  // Compatibility aliases
  cyan:
    'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] font-semibold border border-[#5B3E57] dark:border-[#D1A7CC] hover:bg-[#462D42] dark:hover:bg-[#E0BFDC] shadow-sm',
  magenta:
    'bg-[#EAE5DC] dark:bg-[#1D1C1A] text-[#282521] dark:text-[#EDE8E1] border border-[#E3DCD3] dark:border-white/[0.08] hover:border-[#5B3E57] dark:hover:border-[#D1A7CC]/50',
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
      className={`relative inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B3E57]/40 dark:focus-visible:ring-[#D1A7CC]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFEFA] dark:focus-visible:ring-offset-[#1D1C1A] disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer ${
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
