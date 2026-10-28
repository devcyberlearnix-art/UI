import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  leftIcon: LeftIcon,
  rightElement,
  placeholder = '',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value !== undefined && value !== null && String(value).length > 0);
  const isElevated = isFocused || hasValue || Boolean(placeholder);

  return (
    <div className={`relative flex flex-col ${className}`}>
      <div
        className={`relative flex items-center min-h-[54px] rounded-xl transition-all duration-300 border bg-[#0F0F13]/90 backdrop-blur-xl ${
          error
            ? 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30'
            : isFocused
            ? 'border-[#C5A880]/60 shadow-[0_0_25px_rgba(197,168,128,0.14)] bg-[#14141A]'
            : 'border-white/[0.05] hover:border-white/[0.12]'
        }`}
      >
        {LeftIcon && (
          <div className="pl-3.5 pr-1 text-[#71717A] shrink-0">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        {/* Input container with fixed interior layout */}
        <div className="relative flex-1 h-full flex flex-col justify-end">
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? placeholder : ''}
            className={`w-full px-3.5 pt-4 pb-1.5 text-sm font-medium text-[#F5F5F7] bg-transparent outline-none placeholder:text-[#71717A]/60 transition-colors ${
              LeftIcon ? 'pl-2' : ''
            }`}
            {...props}
          />

          {/* Floating Label with zero displacement physics */}
          {label && (
            <label
              htmlFor={id}
              className={`absolute pointer-events-none select-none transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] font-medium ${
                LeftIcon ? 'left-2' : 'left-3.5'
              } ${
                isElevated
                  ? 'top-1.5 text-[10px] tracking-wider uppercase font-semibold text-[#C5A880]'
                  : 'top-3.5 text-xs text-[#71717A]'
              }`}
            >
              {label}
            </label>
          )}
        </div>

        {rightElement && <div className="pr-3.5 shrink-0">{rightElement}</div>}
      </div>

      {/* Resilient Error Micro-Alert */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-1 text-xs text-red-400 font-medium pl-1 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
