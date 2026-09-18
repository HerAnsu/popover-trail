/**
 * AbortController and In-Flight Promise Manager for popover-trail store.
 *
 * @module storeControllers
 */

import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { AbortRegistry } from './AbortRegistry';
import { InFlightPromiseCache } from './InFlightPromiseCache';

/**
 * Unified controller interface managing network abort controllers and concurrent in-flight promises.
 *
 * @template TData - Resolved data type returned by async operations.
 * @template TPopoverKey - Key identifying individual popover entries.
 */
export interface ControllerManager<TData = unknown, TPopoverKey extends string = string> {
  activeControllers: Map<string, AbortController>;
  inFlightPromises: Map<string, Promise<TData>>;
  registerController: (key: string) => AbortController;
  removeController: (key: string, controller?: AbortController) => void;
  abortControllersForKeys: (keys: Iterable<TPopoverKey | string>) => void;
  abortAllControllers: () => void;
  hasInFlight: (key: string) => boolean;
  getInFlight: (key: string) => Promise<TData> | undefined;
  setInFlight: (key: string, promise: Promise<TData>) => void;
  removeInFlight: (key: string) => void;
  dispose: () => void;
  [DISPOSE_SYMBOL]: () => void;
  [Symbol.dispose]: () => void;
}

/**
 * Creates a unified `ControllerManager` instance binding `AbortRegistry` and `InFlightPromiseCache`.
 *
 * @template TData - Data type returned by async promises.
 * @template TPopoverKey - Key identifying popover nodes.
 * @returns Initialized `ControllerManager`.
 *
 * @example
 * ```typescript
 * const manager = createControllerManager();
 * const controller = manager.registerController('card-1');
 * manager.setInFlight('card-1', fetch('/api/data'));
 *
 * // Later, abort and clean up:
 * manager.abortControllersForKeys(['card-1']);
 * ```
 */
export function createControllerManager<
  TData = unknown,
  TPopoverKey extends string = string,
>(): ControllerManager<TData, TPopoverKey> {
  const abortRegistry = new AbortRegistry<string>();
  const inFlightCache = new InFlightPromiseCache<TData, string>();

  const abortControllersForKeys = (keys: Iterable<TPopoverKey | string>): void => {
    if (!keys) return;
    abortRegistry.abortKeys(keys);
    for (const key of keys) inFlightCache.remove(key);
  };

  const abortAllControllers = (): void => {
    abortRegistry.abortAll();
    inFlightCache.clear();
  };

  return {
    activeControllers: abortRegistry.controllerMap,
    inFlightPromises: inFlightCache.inFlightMap,
    registerController: (key) => abortRegistry.register(key),
    removeController: (key, ctrl) => abortRegistry.remove(key, ctrl),
    abortControllersForKeys,
    abortAllControllers,
    hasInFlight: (key) => inFlightCache.has(key),
    getInFlight: (key) => inFlightCache.get(key),
    setInFlight: (key, promise) => inFlightCache.set(key, promise),
    removeInFlight: (key) => inFlightCache.remove(key),
    dispose: abortAllControllers,
    [DISPOSE_SYMBOL]: abortAllControllers,
    [Symbol.dispose]: abortAllControllers,
  };
}

/**
 * Executes an async task while tracking it in an in-flight promises Map.
 * Automatically cleans up the promise from the Map upon completion.
 *
 * @template TData - Output type of task.
 * @param inFlightPromises - Target map to record running promise.
 * @param key - Operation key.
 * @param task - Async task factory function.
 * @returns Promise resolving to the task result.
 *
 * @example
 * ```typescript
 * const result = await runTracked(inFlightMap, 'task-key', async () => {
 *   return await api.call();
 * });
 * ```
 */
export function runTracked<TData>(
  inFlightPromises: Map<string, Promise<TData>>,
  key: string,
  task: () => Promise<TData>,
): Promise<TData> {
  const tracked: { promise?: Promise<TData> } = {};
  const promise = (async () => {
    try {
      return await task();
    } finally {
      if (tracked.promise && inFlightPromises.get(key) === tracked.promise)
        inFlightPromises.delete(key);
    }
  })();
  tracked.promise = promise;
  inFlightPromises.set(key, promise);
  return promise;
}
