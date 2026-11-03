import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import IconButton from './IconButton';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  pageSize = 10,
  className = '',
}) => {
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : null;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div
      className={`flex items-center justify-between px-2 py-3 text-xs text-[#635E56] dark:text-[#A69F94] ${className}`}
    >
      <div>
        {totalItems ? (
          <span>
            Showing <strong className="text-[#282521] dark:text-[#EDE8E1]">{startItem}</strong> to{' '}
            <strong className="text-[#282521] dark:text-[#EDE8E1]">{endItem}</strong> of{' '}
            <strong className="text-[#282521] dark:text-[#EDE8E1]">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-[#282521] dark:text-[#EDE8E1]">{currentPage}</strong> of{' '}
            <strong className="text-[#282521] dark:text-[#EDE8E1]">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <IconButton
          icon={ChevronLeft}
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          ariaLabel="Previous page"
        />

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange?.(pageNum)}
                className={`w-7 h-7 rounded-lg font-semibold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413]'
                    : 'text-[#635E56] dark:text-[#A69F94] hover:bg-[#EAE5DC] dark:hover:bg-white/[0.05]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <IconButton
          icon={ChevronRight}
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          ariaLabel="Next page"
        />
      </div>
    </div>
  );
};

export default Pagination;

