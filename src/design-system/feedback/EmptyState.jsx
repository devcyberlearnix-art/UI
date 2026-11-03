import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Button from '../primitives/Button';

export const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'Try adjusting your search query, clearing active filters, or exploring other curriculum specializations.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-sm max-w-lg mx-auto ${className}`}
    >
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] shadow-xs">
          <Icon className="w-8 h-8" />
        </div>
        <div className="absolute -inset-2 bg-[#5B3E57]/5 dark:bg-[#D1A7CC]/10 rounded-3xl blur-xl -z-10" />
      </div>

      <h3 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-[#635E56] dark:text-[#A69F94] leading-relaxed mb-6 max-w-sm">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="md"
            onClick={onAction}
            rightIcon={ArrowRight}
          >
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="secondary"
            size="md"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
