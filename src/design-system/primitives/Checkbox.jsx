import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-start gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className="w-5 h-5 rounded-md border border-[#D8D0C5] dark:border-white/[0.14] bg-[#FFFEFA] dark:bg-[#1D1C1A] peer-checked:bg-[#5B3E57] dark:peer-checked:bg-[#D1A7CC] peer-checked:border-[#5B3E57] dark:peer-checked:border-[#D1A7CC] peer-focus-visible:ring-2 peer-focus-visible:ring-[#5B3E57]/40 dark:peer-focus-visible:ring-[#D1A7CC]/50 transition-all flex items-center justify-center text-white dark:text-[#151413]">
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-[#282521] dark:text-[#EDE8E1]">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-[#756E64] dark:text-[#A69F94]">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default Checkbox;

