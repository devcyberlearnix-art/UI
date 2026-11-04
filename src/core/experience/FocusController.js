// src/core/experience/FocusController.js
// Governs sensory environment, focus session timers, and ambient distraction reduction

export class FocusController {
  constructor(options = {}) {
    this.isFocusActive = false;
    this.focusMinutes = options.defaultMinutes || 25;
    this.secondsRemaining = this.focusMinutes * 60;
    this.timerId = null;
    this.listeners = new Set();
    this.suppressNotifications = false;
    this.ambientDimmingLevel = 0.85; // 85% dimming of background elements in FOCUS mode
  }

  startSession(minutes = 25) {
    this.focusMinutes = minutes;
    this.secondsRemaining = minutes * 60;
    this.isFocusActive = true;
    this.suppressNotifications = true;

    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      this.secondsRemaining -= 1;
      if (this.secondsRemaining <= 0) {
        this.endSession(true);
      } else {
        this.emitUpdate();
      }
    }, 1000);

    this.emitUpdate();
  }

  pauseSession() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.emitUpdate();
  }

  resumeSession() {
    if (!this.timerId && this.secondsRemaining > 0) {
      this.timerId = setInterval(() => {
        this.secondsRemaining -= 1;
        if (this.secondsRemaining <= 0) {
          this.endSession(true);
        } else {
          this.emitUpdate();
        }
      }, 1000);
      this.emitUpdate();
    }
  }

  endSession(completed = false) {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isFocusActive = false;
    this.suppressNotifications = false;
    this.emitUpdate(completed ? 'completed' : 'cancelled');
  }

  setAmbientDimming(level) {
    this.ambientDimmingLevel = Math.max(0, Math.min(1, level));
    this.emitUpdate();
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    return () => {};
  }

  emitUpdate(eventReason = 'tick') {
    const payload = {
      isFocusActive: this.isFocusActive,
      secondsRemaining: this.secondsRemaining,
      totalSeconds: this.focusMinutes * 60,
      formattedTime: this.getFormattedTime(),
      suppressNotifications: this.suppressNotifications,
      ambientDimmingLevel: this.ambientDimmingLevel,
      eventReason,
    };
    this.listeners.forEach((fn) => fn(payload));
  }

  getFormattedTime() {
    const m = Math.floor(this.secondsRemaining / 60);
    const s = this.secondsRemaining % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}

export default FocusController;
