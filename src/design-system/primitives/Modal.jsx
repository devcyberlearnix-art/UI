import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import IconButton from './IconButton';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-2xl',
  className = '',
}) => {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Diffused warm backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#282521]/45 dark:bg-black/75 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${maxWidth} rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xl text-[#282521] dark:text-[#EDE8E1] z-10 flex flex-col max-h-[90vh] overflow-hidden ${className}`}
          >
            {/* Header */}
            {(title || onClose) && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3DCD3] dark:border-white/[0.08] shrink-0">
                <div>
                  {title && (
                    <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#756E64] dark:text-[#A69F94] mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                {onClose && (
                  <IconButton
                    icon={X}
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    ariaLabel="Close modal"
                  />
                )}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1">{children}</div>

            {/* Pinned Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-[#E3DCD3] dark:border-white/[0.08] bg-[#FAF7F2] dark:bg-[#151413] flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Dialog = Modal;
export default Modal;

