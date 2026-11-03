import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary:
    'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] hover:bg-[#462D42] dark:hover:bg-[#E0BFDC] shadow-xs',
  secondary:
    'bg-[#EAE5DC] dark:bg-[#1D1C1A] text-[#282521] dark:text-[#EDE8E1] hover:bg-[#E1DBD0] dark:hover:bg-[#2B2926] border border-[#E3DCD3] dark:border-white/[0.08]',
  ghost:
    'bg-transparent text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1] hover:bg-[#EAE5DC]/60 dark:hover:bg-white/[0.05]',
  outline:
    'bg-transparent text-[#282521] dark:text-[#EDE8E1] border border-[#E3DCD3] dark:border-white/[0.1] hover:border-[#5B3E57] dark:hover:border-[#D1A7CC]/50 hover:bg-[#F2ECF1]/50 dark:hover:bg-[#D1A7CC]/[0.05]',
  danger:
    'bg-[#FAECEB] dark:bg-[#D66B67]/15 text-[#9B3835] dark:text-[#D66B67] hover:bg-[#F7D8D7] dark:hover:bg-[#D66B67]/25 border border-[#E8B4B2] dark:border-[#D66B67]/30',
};

const SIZES = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-12 h-12 rounded-xl',
};

export const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  ariaLabel,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={`inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B3E57]/40 dark:focus-visible:ring-[#D1A7CC]/50 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
        VARIANTS[variant] || VARIANTS.ghost
      } ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
    </motion.button>
  );
};

export default IconButton;

