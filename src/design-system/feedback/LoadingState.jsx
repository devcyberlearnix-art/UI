import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  message = 'Loading workspace data...',
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}
    >
      <Loader2
        className={`${
          sizeMap[size] || sizeMap.md
        } animate-spin text-[#5B3E57] dark:text-[#D1A7CC] mb-3`}
      />
      {message && (
        <p className="text-xs font-semibold text-[#756E64] dark:text-[#A69F94] tracking-wide uppercase">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingState;

