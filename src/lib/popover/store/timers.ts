/**
 * Creates an isolated manager for hover close and transition timers.
 */
export function createTimerManager() {
  const hoverCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const transitionTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const clearHoverTimer = (key: string) => {
    const timer = hoverCloseTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      hoverCloseTimers.delete(key);
    }
  };

  const clearTransitionTimer = (key: string) => {
    const timer = transitionTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      transitionTimers.delete(key);
    }
  };

  const clearAllTimers = () => {
    for (const timer of hoverCloseTimers.values()) {
      clearTimeout(timer);
    }
    hoverCloseTimers.clear();

    for (const timer of transitionTimers.values()) {
      clearTimeout(timer);
    }
    transitionTimers.clear();
  };

  return {
    hoverCloseTimers,
    transitionTimers,
    clearHoverTimer,
    clearTransitionTimer,
    clearAllTimers,
  };
}
