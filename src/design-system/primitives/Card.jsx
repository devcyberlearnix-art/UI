import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  as: Component = 'div',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover
    ? 'transition-all duration-200 hover:shadow-md hover:border-[#D8D0C5] dark:hover:border-white/[0.14] hover:-translate-y-0.5'
    : '';

  return (
    <Component
      className={`rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] text-[#282521] dark:text-[#EDE8E1] shadow-xs ${paddingClasses[padding] || paddingClasses.md} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;

