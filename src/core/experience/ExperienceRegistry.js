// src/core/experience/ExperienceRegistry.js
// Asivo 2.0 Experience Registry
// Maps routes and workspaces to sensory modes (EXPLORATION, LEARNING, FOCUS, ACHIEVEMENT)

export const EXPERIENCE_MODES = {
  EXPLORATION: 'EXPLORATION',
  LEARNING: 'LEARNING',
  FOCUS: 'FOCUS',
  ACHIEVEMENT: 'ACHIEVEMENT',
};

export const MODE_CONFIG = {
  [EXPERIENCE_MODES.EXPLORATION]: {
    id: EXPERIENCE_MODES.EXPLORATION,
    title: 'Exploration & Discovery',
    tagline: 'Wide horizon, faceted catalog, and curriculum browsing',
    layout: 'canvas',
    sidebarDefaultOpen: true,
    showAmbientBackdrop: true,
    dimDistractions: false,
    headerCollapsed: false,
  },
  [EXPERIENCE_MODES.LEARNING]: {
    id: EXPERIENCE_MODES.LEARNING,
    title: 'Active Learning Stage',
    tagline: 'Synchronized syllabus, lecture notes, and classroom stage',
    layout: 'stage',
    sidebarDefaultOpen: true,
    showAmbientBackdrop: false,
    dimDistractions: false,
    headerCollapsed: false,
  },
  [EXPERIENCE_MODES.FOCUS]: {
    id: EXPERIENCE_MODES.FOCUS,
    title: 'Deep Focus Theatre',
    tagline: 'Distraction-free environment for assessments and intense study',
    layout: 'theatre',
    sidebarDefaultOpen: false,
    showAmbientBackdrop: false,
    dimDistractions: true,
    headerCollapsed: true,
  },
  [EXPERIENCE_MODES.ACHIEVEMENT]: {
    id: EXPERIENCE_MODES.ACHIEVEMENT,
    title: 'Milestone & Credential',
    tagline: 'Verified accomplishments, cryptographic certificates, and portfolio',
    layout: 'celebration',
    sidebarDefaultOpen: true,
    showAmbientBackdrop: true,
    dimDistractions: false,
    headerCollapsed: false,
  },
};

/**
 * Route-to-Mode Pattern Matcher
 */
const ROUTE_RULES = [
  { pattern: /^\/student\/courses\/[^/]+\/classroom\/quiz\//, mode: EXPERIENCE_MODES.FOCUS },
  { pattern: /^\/student\/courses\/[^/]+\/quiz\//, mode: EXPERIENCE_MODES.FOCUS },
  { pattern: /^\/student\/courses\/[^/]+\/classroom/, mode: EXPERIENCE_MODES.LEARNING },
  { pattern: /^\/classroom\//, mode: EXPERIENCE_MODES.LEARNING },
  { pattern: /^\/certifications/, mode: EXPERIENCE_MODES.ACHIEVEMENT },
  { pattern: /^\/verify-certificate/, mode: EXPERIENCE_MODES.ACHIEVEMENT },
  { pattern: /^\/student\/courses\/[^/]+\/certificate/, mode: EXPERIENCE_MODES.ACHIEVEMENT },
  { pattern: /^\/student\/profile/, mode: EXPERIENCE_MODES.ACHIEVEMENT },
];

/**
 * Resolve the default experience mode for a given pathname
 * @param {string} pathname 
 * @returns {string} One of EXPERIENCE_MODES
 */
export function resolveExperienceMode(pathname = '') {
  for (const rule of ROUTE_RULES) {
    if (rule.pattern.test(pathname)) {
      return rule.mode;
    }
  }
  return EXPERIENCE_MODES.EXPLORATION;
}

export default {
  EXPERIENCE_MODES,
  MODE_CONFIG,
  resolveExperienceMode,
};
