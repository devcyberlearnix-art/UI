import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
  const hasValue = Boolean(value && String(value).length > 0);
  const isElevated = isFocused || hasValue || Boolean(placeholder);

  return (
    <div className={`relative flex flex-col ${className}`}>
      <div
        className={`relative flex items-center rounded-xl transition-all duration-200 border bg-ink-900/60 backdrop-blur-md ${
          error
            ? 'border-brand-rose/60 ring-2 ring-brand-rose/20'
            : isFocused
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-ink-850'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        {LeftIcon && (
          <div className="pl-3.5 pr-1 text-ink-400">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          className="w-full px-3.5 pt-5 pb-2 text-sm text-white bg-transparent outline-none placeholder:text-ink-500"
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={id}
            className={`absolute left-3.5 transition-all duration-200 pointer-events-none font-medium select-none ${
              LeftIcon ? 'left-9' : 'left-3.5'
            } ${
              isElevated
                ? 'top-1.5 text-[11px] tracking-wide text-brand-400'
                : 'top-3.5 text-sm text-ink-400'
            }`}
          >
            {label}
          </label>
        )}

        {rightElement && <div className="pr-3 shrink-0">{rightElement}</div>}
      </div>

      {/* Animated Error text */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-rose-400 font-medium pl-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
