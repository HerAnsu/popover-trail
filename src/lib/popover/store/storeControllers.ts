/**
 * AbortController and In-Flight Promise Manager for popover-trail store.
 * Manages cancellable HTTP requests, in-flight deduplication, and prefetch controllers.
 *
 * @module storeControllers
 */

import { DISPOSE_SYMBOL } from '../utils/disposable';

/**
 * Controller manager interface contract for in-flight requests and cancellations.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export interface ControllerManager<TData = unknown, TPopoverKey extends string = string> {
  activeControllers: Map<TPopoverKey, AbortController>;
  inFlightPromises: Map<TPopoverKey, Promise<TData>>;
  registerController: (key: TPopoverKey) => AbortController;
  removeController: (key: TPopoverKey, controller?: AbortController) => void;
  abortControllersForKeys: (keys: Iterable<TPopoverKey>) => void;
  abortAllControllers: () => void;
  hasInFlight: (key: TPopoverKey) => boolean;
  getInFlight: (key: TPopoverKey) => Promise<TData> | undefined;
  setInFlight: (key: TPopoverKey, promise: Promise<TData>) => void;
  removeInFlight: (key: TPopoverKey) => void;
  dispose: () => void;
  [DISPOSE_SYMBOL]: () => void;
}

/**
 * Creates an isolated AbortController and in-flight Promise manager for the store.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @returns Controller manager instance with registration, cancellation, and deduplication methods.
 */
export function createControllerManager<
  TData = unknown,
  TPopoverKey extends string = string,
>(): ControllerManager<TData, TPopoverKey> {
  const activeControllers = new Map<TPopoverKey, AbortController>();
  const inFlightPromises = new Map<TPopoverKey, Promise<TData>>();

  const registerController = (key: TPopoverKey): AbortController => {
    const existing = activeControllers.get(key);
    if (existing) {
      existing.abort();
    }
    const controller = new AbortController();
    activeControllers.set(key, controller);
    return controller;
  };

  const removeController = (key: TPopoverKey, controller?: AbortController): void => {
    // With an identity reference, never remove a newer controller that a
    // concurrent resolution has registered under the same key.
    if (controller && activeControllers.get(key) !== controller) return;
    activeControllers.delete(key);
  };

  const abortControllersForKeys = (keys: Iterable<TPopoverKey>): void => {
    if (!keys) return;
    for (const key of keys) {
      const controller = activeControllers.get(key);
      if (controller) {
        controller.abort();
        activeControllers.delete(key);
      }
      inFlightPromises.delete(key);
    }
  };

  const abortAllControllers = (): void => {
    for (const controller of activeControllers.values()) {
      controller.abort();
    }
    activeControllers.clear();
    inFlightPromises.clear();
  };

  return {
    activeControllers,
    inFlightPromises,
    registerController,
    removeController,
    abortControllersForKeys,
    abortAllControllers,
    hasInFlight: (key: TPopoverKey) => inFlightPromises.has(key),
    getInFlight: (key: TPopoverKey) => inFlightPromises.get(key),
    setInFlight: (key: TPopoverKey, promise: Promise<TData>) => {
      inFlightPromises.set(key, promise);
    },
    removeInFlight: (key: TPopoverKey) => {
      inFlightPromises.delete(key);
    },
    dispose: abortAllControllers,
    [DISPOSE_SYMBOL]: abortAllControllers,
  };
}

/**
 * Runs `task` as the tracked in-flight promise for `key`.
 * Concurrent callers observing the map share a single execution; on settle the
 * entry is removed only when no newer resolution has replaced it (identity guard).
 *
 * @template TData - Promise resolution payload type.
 * @param inFlightPromises - Shared dedup map owned by the controller manager.
 * @param key - Dedup key identifying the resolution.
 * @param task - Async work to execute exactly once per key.
 * @returns The tracked promise stored under `key`.
 */
export function runTracked<TData>(
  inFlightPromises: Map<string, Promise<TData>>,
  key: string,
  task: () => Promise<TData>,
): Promise<TData> {
  // Holder indirection lets the cleanup closure compare its own registered
  // promise against the map without a definite-assignment self-reference.
  const tracked: { promise?: Promise<TData> } = {};
  const promise = (async () => {
    try {
      return await task();
    } finally {
      if (tracked.promise && inFlightPromises.get(key) === tracked.promise) {
        inFlightPromises.delete(key);
      }
    }
  })();
  tracked.promise = promise;
  inFlightPromises.set(key, promise);
  return promise;
}
