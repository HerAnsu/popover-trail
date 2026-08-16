/**
 * AbortController and In-Flight Promise Manager for popover-trail store.
 * Manages cancellable HTTP requests, in-flight deduplication, and prefetch controllers.
 *
 * @module storeControllers
 */

const DISPOSE_SYMBOL: symbol =
  (Symbol as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');

/**
 * Creates an isolated AbortController and in-flight Promise manager for the store.
 *
 * @template TData - Resolved data payload type.
 * @returns Controller manager instance with registration, cancellation, and deduplication methods.
 */
export function createControllerManager<TData = unknown>() {
  const activeControllers = new Map<string, AbortController>();
  const inFlightPromises = new Map<string, Promise<TData>>();

  const registerController = (key: string): AbortController => {
    const existing = activeControllers.get(key);
    if (existing) {
      existing.abort();
    }
    const controller = new AbortController();
    activeControllers.set(key, controller);
    return controller;
  };

  const removeController = (key: string): void => {
    activeControllers.delete(key);
  };

  const abortControllersForKeys = (keys: Iterable<string>): void => {
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
    hasInFlight: (key: string) => inFlightPromises.has(key),
    getInFlight: (key: string) => inFlightPromises.get(key),
    setInFlight: (key: string, promise: Promise<TData>) => {
      inFlightPromises.set(key, promise);
    },
    removeInFlight: (key: string) => {
      inFlightPromises.delete(key);
    },
    dispose: abortAllControllers,
    [DISPOSE_SYMBOL]: abortAllControllers,
  };
}
