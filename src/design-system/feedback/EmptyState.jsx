import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Button from '../primitives/Button';

export const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'Try adjusting your search query, clearing filters, or exploring other categories.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-3xl bg-glass-card border border-white/5 max-w-lg mx-auto ${className}`}
    >
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <Icon className="w-8 h-8" />
        </div>
        <div className="absolute -inset-2 bg-brand-500/10 rounded-3xl blur-xl -z-10" />
      </div>

      <h3 className="text-xl font-bold text-white tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-sm text-ink-400 leading-relaxed mb-6 max-w-sm">
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
            variant="ghost"
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
