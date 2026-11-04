// src/core/experience/NavigationController.js
// Synchronizes Experience Engine state with React Router and Browser History

import { EXPERIENCE_MODES } from './ExperienceRegistry';

export class NavigationController {
  constructor(navigate, location) {
    this.navigate = navigate;
    this.location = location;
  }

  updateLocation(location) {
    this.location = location;
  }

  /**
   * Read mode from URL search parameters if explicitly present
   * e.g. /student/courses/1/classroom?mode=focus
   */
  getModeFromUrl() {
    if (!this.location || !this.location.search) return null;
    const params = new URLSearchParams(this.location.search);
    const modeParam = params.get('mode');
    if (modeParam && EXPERIENCE_MODES[modeParam.toUpperCase()]) {
      return modeParam.toUpperCase();
    }
    return null;
  }

  /**
   * Synchronize experience mode to URL query parameters while preserving existing params and browser history
   * @param {string} mode 
   * @param {boolean} replaceHistory 
   */
  syncModeToUrl(mode, replaceHistory = true) {
    if (!this.navigate || !this.location) return;

    const params = new URLSearchParams(this.location.search);
    const currentParam = params.get('mode');

    // Only update if mode differs or is non-default
    if (mode === EXPERIENCE_MODES.EXPLORATION) {
      if (currentParam) {
        params.delete('mode');
      } else {
        return;
      }
    } else {
      if (currentParam?.toUpperCase() === mode) return;
      params.set('mode', mode.toLowerCase());
    }

    const newSearch = params.toString() ? `?${params.toString()}` : '';
    const newUrl = `${this.location.pathname}${newSearch}${this.location.hash || ''}`;

    this.navigate(newUrl, { replace: replaceHistory });
  }

  /**
   * Navigate with explicit mode transition
   */
  navigateWithMode(targetPath, mode, options = {}) {
    if (!this.navigate) return;
    const url = new URL(targetPath, window.location.origin);
    if (mode && mode !== EXPERIENCE_MODES.EXPLORATION) {
      url.searchParams.set('mode', mode.toLowerCase());
    }
    const fullTarget = `${url.pathname}${url.search}${url.hash}`;
    this.navigate(fullTarget, options);
  }
}

export default NavigationController;

