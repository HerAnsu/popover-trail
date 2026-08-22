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

function clearRecordKeys(record: Record<string, unknown>): void {
  for (const k of Object.keys(record)) {
    delete record[k];
  }
}

/**
 * Creates an isolated request hydration counter manager to prevent asynchronous race conditions.
 *
 * @remarks
 * Stamping each asynchronous resolution with an incrementing counter ensures that slow responses
 * from previous user clicks cannot overwrite newer requests for the same card or cascade.
 *
 * @returns Hydration counter manager with increment and stale-check methods.
 */
export function createHydrationManager() {
  let rootCounter = 0;
  const nestedCounters: Record<string, number> = Object.create(null);

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
    const current = nestedCounters[parentKey];
    return current === undefined || current !== startedCounter;
  };

  const deleteNestedCounter = (parentKey: string): void => {
    delete nestedCounters[parentKey];
  };

  /**
   * Bumps the root counter and every nested counter at once, marking all
   * in-flight resolutions stale. Used when the active resolver is replaced:
   * resolvers that ignore their AbortSignal must not commit data produced
   * by the previous resolver.
   */
  const markAllCountersStale = (): void => {
    rootCounter += 1;
    for (const parentKey of Object.keys(nestedCounters)) {
      nestedCounters[parentKey] = (nestedCounters[parentKey] ?? 0) + 1;
    }
  };

  const resetHydrationCounters = () => {
    rootCounter = 0;
    clearRecordKeys(nestedCounters as Record<string, unknown>);
  };

  return {
    getRootCounter: () => rootCounter,
    getNestedCounters: () => ({ ...nestedCounters }),
    incrementRootCounter,
    isRootStale,
    incrementNestedCounter,
    isNestedStale,
    deleteNestedCounter,
    markAllCountersStale,
    resetHydrationCounters,
  };
}
