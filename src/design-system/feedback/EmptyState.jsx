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
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-[#0B0B0F]/90 border border-white/5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.8),0_0_40px_rgba(0,240,255,0.03)] backdrop-blur-2xl max-w-lg mx-auto ${className}`}
    >
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/25 flex items-center justify-center text-[#00F0FF] shadow-[0_0_25px_rgba(0,240,255,0.2)]">
          <Icon className="w-8 h-8" />
        </div>
        <div className="absolute -inset-2 bg-[#00F0FF]/15 rounded-3xl blur-xl -z-10" />
      </div>

      <h3 className="text-xl font-bold text-[#F5F5F7] tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-[#8E8E93] leading-relaxed mb-6 max-w-sm">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button
            variant="cyan"
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
