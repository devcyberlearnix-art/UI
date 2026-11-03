import React from 'react';

export const Radio = ({
  id,
  name,
  value,
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
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className="w-5 h-5 rounded-full border border-[#D8D0C5] dark:border-white/[0.14] bg-[#FFFEFA] dark:bg-[#1D1C1A] peer-checked:border-[#5B3E57] dark:peer-checked:border-[#D1A7CC] peer-focus-visible:ring-2 peer-focus-visible:ring-[#5B3E57]/40 dark:peer-focus-visible:ring-[#D1A7CC]/50 transition-all flex items-center justify-center">
          {checked && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#5B3E57] dark:bg-[#D1A7CC]" />
          )}
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

export default Radio;

