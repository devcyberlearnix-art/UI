// src/core/experience/ExperienceProvider.jsx
// Central Context Provider & Hook for Asivo 2.0 Shared Experience Engine

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EXPERIENCE_MODES, MODE_CONFIG, resolveExperienceMode } from './ExperienceRegistry';
import ExperienceStateManager from './ExperienceStateManager';
import NavigationController from './NavigationController';
import FocusController from './FocusController';
import AccessibilityController from './AccessibilityController';

const ExperienceContext = createContext(null);

export const ExperienceProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize controllers once
  const stateManagerRef = useRef(null);
  const navigationControllerRef = useRef(null);
  const focusControllerRef = useRef(null);
  const a11yControllerRef = useRef(null);

  if (!stateManagerRef.current) {
    const initialMode = resolveExperienceMode(location.pathname);
    stateManagerRef.current = new ExperienceStateManager(initialMode);
    navigationControllerRef.current = new NavigationController(navigate, location);
    focusControllerRef.current = new FocusController();
    a11yControllerRef.current = new AccessibilityController();
  }

  // Reactive state mirrored from state manager
  const [currentMode, setCurrentMode] = useState(() => stateManagerRef.current.getMode());
  const [focusState, setFocusState] = useState({
    isFocusActive: false,
    secondsRemaining: 1500,
    formattedTime: '25:00',
    suppressNotifications: false,
  });
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScaleState] = useState(1.0);

  // Keep navigation controller synced with current location
  useEffect(() => {
    navigationControllerRef.current.updateLocation(location);
    
    // Check if URL has explicit ?mode= param override
    const urlMode = navigationControllerRef.current.getModeFromUrl();
    const resolvedMode = urlMode || resolveExperienceMode(location.pathname);
    
    if (resolvedMode !== stateManagerRef.current.getMode()) {
      stateManagerRef.current.transitionTo(resolvedMode, { source: 'route_change', pathname: location.pathname });
    }
  }, [location]);

  // Subscribe to state manager changes
  useEffect(() => {
    const unsubscribeState = stateManagerRef.current.subscribe((event) => {
      setCurrentMode(event.mode);
      // Synchronize URL search params when mode explicitly changes
      navigationControllerRef.current.syncModeToUrl(event.mode, true);
    });

    const unsubscribeFocus = focusControllerRef.current.subscribe((payload) => {
      setFocusState({
        isFocusActive: payload.isFocusActive,
        secondsRemaining: payload.secondsRemaining,
        formattedTime: payload.formattedTime,
        suppressNotifications: payload.suppressNotifications,
      });
    });

    return () => {
      unsubscribeState();
      unsubscribeFocus();
    };
  }, []);

  // Mode Transition Dispatcher
  const setMode = useCallback((targetMode, metadata = {}) => {
    stateManagerRef.current.transitionTo(targetMode, metadata);
  }, []);

  // Focus Actions
  const startFocus = useCallback((minutes) => focusControllerRef.current.startSession(minutes), []);
  const pauseFocus = useCallback(() => focusControllerRef.current.pauseSession(), []);
  const resumeFocus = useCallback(() => focusControllerRef.current.resumeSession(), []);
  const endFocus = useCallback(() => focusControllerRef.current.endSession(), []);

  // Accessibility Actions
  const toggleHighContrast = useCallback(() => {
    const next = !highContrast;
    setHighContrast(next);
    a11yControllerRef.current.setHighContrast(next);
  }, [highContrast]);

  const setFontScale = useCallback((scale) => {
    setFontScaleState(scale);
    a11yControllerRef.current.setFontScale(scale);
  }, []);

  const announce = useCallback((msg) => {
    a11yControllerRef.current.announce(msg);
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => {
    const config = MODE_CONFIG[currentMode] || MODE_CONFIG[EXPERIENCE_MODES.EXPLORATION];
    return {
      mode: currentMode,
      config,
      setMode,
      isExplorationMode: currentMode === EXPERIENCE_MODES.EXPLORATION,
      isLearningMode: currentMode === EXPERIENCE_MODES.LEARNING,
      isFocusMode: currentMode === EXPERIENCE_MODES.FOCUS,
      isAchievementMode: currentMode === EXPERIENCE_MODES.ACHIEVEMENT,
      focus: {
        ...focusState,
        startFocus,
        pauseFocus,
        resumeFocus,
        endFocus,
      },
      accessibility: {
        highContrast,
        toggleHighContrast,
        fontScale,
        setFontScale,
        announce,
      },
      navigateWithMode: (path, mode, options) =>
        navigationControllerRef.current.navigateWithMode(path, mode, options),
    };
  }, [currentMode, focusState, highContrast, fontScale, setMode, startFocus, pauseFocus, resumeFocus, endFocus, toggleHighContrast, setFontScale, announce]);

  return (
    <ExperienceContext.Provider value={contextValue}>
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return ctx;
};

export default ExperienceProvider;
