/**
 * AbortController and In-Flight Promise Manager for popover-trail store.
 *
 * @module storeControllers
 */

import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { AbortRegistry } from './AbortRegistry';
import { InFlightPromiseCache } from './InFlightPromiseCache';

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
