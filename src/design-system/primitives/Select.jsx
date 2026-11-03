import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  id,
  value,
  onChange,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  children,
  ...props
}) => {
  return (
    <div className={`relative flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 text-xs font-semibold text-[#635E56] dark:text-[#A69F94] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full h-11 px-3.5 pr-10 text-sm font-medium rounded-xl appearance-none transition-all duration-200 bg-[#FFFEFA] dark:bg-[#1D1C1A] text-[#282521] dark:text-[#EDE8E1] border ${
            error
              ? 'border-[#9B3835] ring-1 ring-[#9B3835]/20'
              : 'border-[#D8D0C5] dark:border-white/[0.08] hover:border-[#C4B9AA] dark:hover:border-white/[0.14] focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/15 dark:focus:border-[#D1A7CC]/60 dark:focus:ring-[#D1A7CC]/20'
          } outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                  {opt.label ?? opt}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#756E64] dark:text-[#A69F94]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-[#9B3835] dark:text-[#D66B67] font-medium pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;

