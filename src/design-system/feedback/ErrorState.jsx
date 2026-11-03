import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from '../primitives/Button';

export const ErrorState = ({
  title = 'Unable to load workspace data',
  description = 'An unexpected network error occurred while retrieving this content. Please verify your connection or try again.',
  onRetry,
  retryLabel = 'Retry Request',
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E8B4B2] dark:border-[#D66B67]/30 max-w-lg mx-auto shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FAECEB] dark:bg-[#D66B67]/15 border border-[#E8B4B2] dark:border-[#D66B67]/30 flex items-center justify-center text-[#9B3835] dark:text-[#D66B67] mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h4 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1] mb-2">
        {title}
      </h4>

      <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed mb-6 max-w-sm">
        {description}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={RotateCcw}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

