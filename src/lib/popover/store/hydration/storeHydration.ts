/**
 * Request Hydration Counter State Manager for popover-trail store.
 * Tracks root and nested hydration counters to prevent race conditions.
 *
 * @module storeHydration
 */

import { omitKey, omitKeys, mapValues } from '../../utils/cleanObject';

export interface HydrationState {
  rootHydrationRequestCounter: number;
  nestedHydrationRequestCounters: Record<string, number>;
}

export function createHydrationManager() {
  let rootCounter = 0;
  let epoch = 0;
  let nestedCounters: Partial<Record<string, number>> = Object.create(null);

  const getEpoch = (): number => epoch;
  const incrementEpoch = (): number => {
    epoch++;
    return epoch;
  };
  const isEpochStale = (startedEpoch: number): boolean => startedEpoch !== epoch;

  const incrementRootCounter = (): number => {
    rootCounter++;
    return rootCounter;
  };
  const isRootStale = (startedCounter: number): boolean => startedCounter !== rootCounter;

  const incrementNestedCounter = (parentKey: string): number => {
    const next = (nestedCounters[parentKey] ?? 0) + 1;
    nestedCounters[parentKey] = next;
    return next;
  };

  const isNestedStale = (parentKey: string, startedCounter: number): boolean =>
    (nestedCounters[parentKey] ?? 0) !== startedCounter;

  const deleteNestedCounter = (parentKey: string): void => {
    nestedCounters = omitKey(nestedCounters, parentKey);
  };

  const deleteNestedCounters = (parentKeys: readonly string[] | ReadonlySet<string>): void => {
    nestedCounters = omitKeys(nestedCounters, parentKeys);
  };

  const markAllCountersStale = (): void => {
    rootCounter++;
    epoch++;
    nestedCounters = mapValues(nestedCounters, (val) => val + 1);
  };

  const resetHydrationCounters = (): void => {
    rootCounter = 0;
    epoch = 0;
    nestedCounters = Object.create(null);
  };

  return {
    getRootCounter: () => rootCounter,
    getNestedCounters: () => ({ ...nestedCounters }),
    getEpoch,
    incrementEpoch,
    isEpochStale,
    incrementRootCounter,
    isRootStale,
    incrementNestedCounter,
    isNestedStale,
    deleteNestedCounter,
    deleteNestedCounters,
    markAllCountersStale,
    resetHydrationCounters,
  };
}

export type HydrationManager = ReturnType<typeof createHydrationManager>;
