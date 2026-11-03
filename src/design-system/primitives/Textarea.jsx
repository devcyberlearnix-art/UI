import React from 'react';

export const Textarea = ({
  label,
  id,
  value,
  onChange,
  error,
  placeholder = '',
  rows = 4,
  className = '',
  disabled = false,
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
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full p-3.5 text-sm font-medium rounded-xl transition-all duration-200 bg-[#FFFEFA] dark:bg-[#1D1C1A] text-[#282521] dark:text-[#EDE8E1] placeholder:text-[#756E64] dark:placeholder-[#7A7368] border ${
          error
            ? 'border-[#9B3835] ring-1 ring-[#9B3835]/20'
            : 'border-[#D8D0C5] dark:border-white/[0.08] hover:border-[#C4B9AA] dark:hover:border-white/[0.14] focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/15 dark:focus:border-[#D1A7CC]/60 dark:focus:ring-[#D1A7CC]/20'
        } outline-none resize-y disabled:opacity-40 disabled:cursor-not-allowed`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-[#9B3835] dark:text-[#D66B67] font-medium pl-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;

