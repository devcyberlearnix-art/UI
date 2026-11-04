// src/core/experience/AccessibilityController.js
// Accessibility Controls, High-Contrast Enhancers, and Screen Reader Announcers for Asivo 2.0

export class AccessibilityController {
  constructor() {
    this.highContrast = false;
    this.fontScale = 1.0; // 1.0 (default), 1.15 (large), 1.3 (extra large)
    this.screenReaderLiveRegion = null;
    this.initLiveRegion();
  }

  initLiveRegion() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('asivo-live-announcer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'asivo-live-announcer';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      el.className = 'sr-only';
      el.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      document.body.appendChild(el);
    }
    this.screenReaderLiveRegion = el;
  }

  announce(message) {
    if (this.screenReaderLiveRegion) {
      this.screenReaderLiveRegion.textContent = '';
      setTimeout(() => {
        if (this.screenReaderLiveRegion) {
          this.screenReaderLiveRegion.textContent = message;
        }
      }, 50);
    }
  }

  setHighContrast(enabled) {
    this.highContrast = enabled;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('high-contrast-mode', enabled);
    }
    this.announce(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  setFontScale(scale) {
    this.fontScale = Math.max(0.9, Math.min(1.4, scale));
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--asivo-font-scale', `${this.fontScale}`);
    }
    this.announce(`Reading scale set to ${Math.round(this.fontScale * 100)} percent`);
  }
}

export default AccessibilityController;
