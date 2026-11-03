import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ className = '', showLabel = false, size = 'md' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  const isSmall = size === 'sm';

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 cursor-pointer select-none border focus:outline-none focus:ring-2 focus:ring-[#5B3E57]/20 dark:focus:ring-[#D1A7CC]/30 ${
        isDark
          ? 'bg-[#1D1C1A] text-[#EDE8E1] hover:text-[#D1A7CC] border-white/[0.08] hover:border-white/20'
          : 'bg-[#FFFEFA] text-[#282521] hover:text-[#5B3E57] border-[#E3DCD3] hover:border-[#D8D0C5] shadow-xs'
      } ${isSmall ? 'p-1.5 text-xs' : 'p-2 text-sm'} ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center shrink-0"
      >
        {isDark ? (
          <Moon className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-400`} />
        ) : (
          <Sun className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-500`} />
        )}
      </motion.div>
      {showLabel && (
        <span className="font-semibold text-xs pr-1">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </motion.button>
  );
}

export default ThemeToggle;

