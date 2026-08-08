/**
 * Isolated Close and Transition Timer Manager for popover-trail.
 * Handles automatic timer clearance and memory leak prevention.
 *
 * @module timers
 */

export interface TimerManager {
  hoverCloseTimers: Map<string, ReturnType<typeof setTimeout>>;
  transitionTimers: Map<string, ReturnType<typeof setTimeout>>;
  clearHoverTimer: (key: string) => void;
  clearTransitionTimer: (key: string) => void;
  clearAllTimers: () => void;
  dispose: () => void;
  scheduleHoverLeave: (key: string, delay: number, callback: () => void) => void;
  scheduleTransitionExit: (key: string, duration: number, callback: () => void) => void;
}

function scheduleNamedTimer(
  timersMap: Map<string, ReturnType<typeof setTimeout>>,
  key: string,
  delay: number,
  callback: () => void,
): void {
  const existing = timersMap.get(key);
  if (existing) {
    clearTimeout(existing);
    timersMap.delete(key);
  }
  const timer = setTimeout(() => {
    timersMap.delete(key);
    callback();
  }, delay);
  timersMap.set(key, timer);
}

/**
 * Creates an isolated manager for hover close and transition timers.
 */
export function createTimerManager(): TimerManager {
  const hoverCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const transitionTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const clearHoverTimer = (key: string) => {
    if (!key) return;
    const timer = hoverCloseTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      hoverCloseTimers.delete(key);
    }
  };

  const clearTransitionTimer = (key: string) => {
    if (!key) return;
    const timer = transitionTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      transitionTimers.delete(key);
    }
  };

  const clearAllTimers = () => {
    if (hoverCloseTimers.size > 0) {
      for (const timer of hoverCloseTimers.values()) {
        clearTimeout(timer);
      }
      hoverCloseTimers.clear();
    }

    if (transitionTimers.size > 0) {
      for (const timer of transitionTimers.values()) {
        clearTimeout(timer);
      }
      transitionTimers.clear();
    }
  };

  const scheduleHoverLeave = (key: string, delay: number, callback: () => void) => {
    scheduleNamedTimer(hoverCloseTimers, key, delay, callback);
  };

  const scheduleTransitionExit = (key: string, duration: number, callback: () => void) => {
    scheduleNamedTimer(transitionTimers, key, duration, callback);
  };

  return {
    hoverCloseTimers,
    transitionTimers,
    clearHoverTimer,
    clearTransitionTimer,
    clearAllTimers,
    dispose: clearAllTimers,
    scheduleHoverLeave,
    scheduleTransitionExit,
  };
}
