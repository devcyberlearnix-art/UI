// src/core/experience/LayoutOrchestrator.jsx
// Dynamically orchestrates page geometry, ambient lighting, and focus curtains based on active Experience Mode

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExperience } from './ExperienceProvider';
import { MODE_TRANSITION_VARIANTS } from './AnimationController';

export const LayoutOrchestrator = ({ children, className = '' }) => {
  const { mode, config, focus } = useExperience();

  // Mode-specific container classes
  const getContainerClasses = () => {
    switch (mode) {
      case 'FOCUS':
        return 'max-w-5xl mx-auto px-4 sm:px-6 py-4';
      case 'LEARNING':
        return 'max-w-[1536px] mx-auto px-2 sm:px-6 py-4';
      case 'ACHIEVEMENT':
        return 'max-w-6xl mx-auto px-4 sm:px-8 py-8';
      case 'EXPLORATION':
      default:
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6';
    }
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${className}`}>
      {/* Ambient Lighting Backdrop (Exploration & Achievement modes) */}
      {config.showAmbientBackdrop && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(91,62,87,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(209,167,204,0.06),transparent)]" />
        </div>
      )}

      {/* Focus Mode Curtains & Floating Timer (When in FOCUS mode) */}
      {mode === 'FOCUS' && (
        <aside
          aria-label="Focus Mode Indicator"
          className="sticky top-2 z-40 mx-auto mb-4 flex items-center justify-between px-4 py-2 rounded-2xl bg-[#FFFEFA]/95 dark:bg-[#1D1C1A]/95 border border-[#5B3E57]/30 dark:border-[#D1A7CC]/30 shadow-lg backdrop-blur-md max-w-md text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5B3E57] dark:bg-[#D1A7CC] animate-pulse" />
            <span className="font-bold text-[#282521] dark:text-[#EDE8E1]">DEEP FOCUS THEATRE</span>
          </div>
          {focus.isFocusActive && (
            <div className="flex items-center gap-3">
              <span className="text-[#5B3E57] dark:text-[#D1A7CC] font-bold">{focus.formattedTime}</span>
              <button
                type="button"
                onClick={() => focus.endFocus()}
                className="text-[10px] uppercase font-sans px-2 py-0.5 rounded-md bg-[#5B3E57]/10 hover:bg-[#5B3E57]/20 text-[#5B3E57] dark:text-[#D1A7CC]"
              >
                Exit Focus
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Orchestrated Page Viewport with Smooth Motion Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={MODE_TRANSITION_VARIANTS}
          initial="enter"
          animate="enter"
          exit="exit"
          className={getContainerClasses()}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LayoutOrchestrator;
