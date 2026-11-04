// src/core/experience/index.js
// Clean re-exports for Asivo 2.0 Shared Experience Engine

export { default as ExperienceProvider, useExperience } from './ExperienceProvider';
export { default as ExperienceRegistry, EXPERIENCE_MODES, MODE_CONFIG, resolveExperienceMode } from './ExperienceRegistry';
export { default as ExperienceStateManager } from './ExperienceStateManager';
export { default as NavigationController } from './NavigationController';
export { default as FocusController } from './FocusController';
export { default as AnimationController, LUXURY_EASING, SNAPPY_EASING, createTransition } from './AnimationController';
export { default as AccessibilityController } from './AccessibilityController';
export { default as LayoutOrchestrator } from './LayoutOrchestrator';

