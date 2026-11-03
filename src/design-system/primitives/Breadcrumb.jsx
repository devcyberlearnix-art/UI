import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-[#756E64] dark:text-[#A69F94] ${className}`}
    >
      <Link
        to="/"
        className="hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-[#D8D0C5] dark:text-white/[0.2] shrink-0" />
            {isLast || !item.to ? (
              <span className="font-semibold text-[#282521] dark:text-[#EDE8E1] truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

