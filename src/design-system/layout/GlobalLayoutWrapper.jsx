import React from 'react';

/**
 * GlobalLayoutWrapper provides high-density spacing boundaries,
 * single max-w-7xl responsive constraints, and eliminates accidental
 * double-nesting paddings across deep workspaces.
 */
export const GlobalLayoutWrapper = ({
  children,
  className = '',
  showFooter = false,
}) => {
  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
};

export default GlobalLayoutWrapper;
