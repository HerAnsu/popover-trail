/**
 * Request Hydration Counter State Manager for popover-trail store.
 * Tracks root and nested hydration counters to prevent race conditions.
 *
 * @module storeHydration
 */

export interface HydrationState {
  rootHydrationRequestCounter: number;
  nestedHydrationRequestCounters: Record<string, number>;
}

/**
 * Creates an isolated request hydration counter manager.
 */
export function createHydrationManager() {
  let rootCounter = 0;
  const nestedCounters: Record<string, number> = {};

  const incrementRootCounter = (): number => {
    rootCounter += 1;
    return rootCounter;
  };

  const isRootStale = (startedCounter: number): boolean => {
    return rootCounter !== startedCounter;
  };

  const incrementNestedCounter = (parentKey: string): number => {
    const next = (nestedCounters[parentKey] ?? 0) + 1;
    nestedCounters[parentKey] = next;
    return next;
  };

  const isNestedStale = (parentKey: string, startedCounter: number): boolean => {
    return nestedCounters[parentKey] !== startedCounter;
  };

  const resetHydrationCounters = () => {
    rootCounter = 0;
    for (const k in nestedCounters) {
      delete nestedCounters[k];
    }
  };

  return {
    getRootCounter: () => rootCounter,
    getNestedCounters: () => ({ ...nestedCounters }),
    incrementRootCounter,
    isRootStale,
    incrementNestedCounter,
    isNestedStale,
    resetHydrationCounters,
  };
}
