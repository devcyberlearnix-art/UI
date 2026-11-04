// src/core/experience/AnimationController.js
// Standardized Luxury Motion Curves and Reduced-Motion Governance for Asivo 2.0

export const LUXURY_EASING = [0.16, 1, 0.3, 1];
export const SNAPPY_EASING = [0.2, 0, 0, 1];

/**
 * Checks system-level reduced motion preference
 */
export const checkReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Generates Framer Motion transition config honoring user motion preference
 */
export const createTransition = (duration = 0.4, delay = 0, easing = LUXURY_EASING) => {
  if (checkReducedMotion()) {
    return { duration: 0 };
  }
  return {
    duration,
    delay,
    ease: easing,
  };
};

/**
 * Motion variants for experience mode transitions
 */
export const MODE_TRANSITION_VARIANTS = {
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: createTransition(0.35, 0, LUXURY_EASING),
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.99,
    transition: createTransition(0.2, 0, SNAPPY_EASING),
  },
};

export default {
  LUXURY_EASING,
  SNAPPY_EASING,
  checkReducedMotion,
  createTransition,
  MODE_TRANSITION_VARIANTS,
};
