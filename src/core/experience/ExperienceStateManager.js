// src/core/experience/ExperienceStateManager.js
// Governs explicit state transitions between Asivo 2.0 Experience Modes

import { EXPERIENCE_MODES, MODE_CONFIG } from './ExperienceRegistry';

export class ExperienceStateManager {
  constructor(initialMode = EXPERIENCE_MODES.EXPLORATION, onStateChange = null) {
    this.currentMode = EXPERIENCE_MODES[initialMode] ? initialMode : EXPERIENCE_MODES.EXPLORATION;
    this.history = [this.currentMode];
    this.listeners = new Set();
    if (onStateChange) this.subscribe(onStateChange);
  }

  getMode() {
    return this.currentMode;
  }

  getConfig() {
    return MODE_CONFIG[this.currentMode] || MODE_CONFIG[EXPERIENCE_MODES.EXPLORATION];
  }

  getHistory() {
    return [...this.history];
  }

  /**
   * Explicitly transition to a new experience mode
   * @param {string} targetMode 
   * @param {Object} metadata 
   * @returns {boolean} Success
   */
  transitionTo(targetMode, metadata = {}) {
    if (!EXPERIENCE_MODES[targetMode]) {
      console.warn(`[ExperienceStateManager] Invalid target mode: ${targetMode}`);
      return false;
    }

    if (this.currentMode === targetMode) {
      return true;
    }

    const previousMode = this.currentMode;
    this.currentMode = targetMode;
    this.history.push(targetMode);

    // Keep history bounded
    if (this.history.length > 20) {
      this.history.shift();
    }

    const eventPayload = {
      mode: this.currentMode,
      previousMode,
      config: this.getConfig(),
      metadata,
      timestamp: Date.now(),
    };

    this.notify(eventPayload);
    return true;
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    return () => {};
  }

  notify(eventPayload) {
    this.listeners.forEach((listener) => {
      try {
        listener(eventPayload);
      } catch (err) {
        console.error('[ExperienceStateManager] Listener error:', err);
      }
    });
  }

  reset() {
    this.currentMode = EXPERIENCE_MODES.EXPLORATION;
    this.history = [this.currentMode];
    this.notify({
      mode: this.currentMode,
      previousMode: null,
      config: this.getConfig(),
      metadata: { reason: 'reset' },
      timestamp: Date.now(),
    });
  }
}

export default ExperienceStateManager;

