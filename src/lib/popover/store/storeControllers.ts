/**
 * AbortController and In-Flight Promise Manager for popover-trail store.
 * Manages cancellable HTTP requests, in-flight deduplication, and prefetch controllers.
 *
 * @module storeControllers
 */

/**
 * Creates an isolated AbortController and promise manager.
 *
 * @template TData - Resolved data payload type.
 */
export function createControllerManager<TData = unknown>() {
  const activeControllers = new Map<string, AbortController>();
  const inFlightPromises = new Map<string, Promise<TData>>();

  const registerController = (key: string): AbortController => {
    const existing = activeControllers.get(key);
    if (existing) {
      existing.abort();
      activeControllers.delete(key);
    }
    const controller = new AbortController();
    activeControllers.set(key, controller);
    return controller;
  };

  const removeController = (key: string): void => {
    activeControllers.delete(key);
  };

  const abortControllersForKeys = (keys: Iterable<string>): void => {
    for (const key of keys) {
      const controller = activeControllers.get(key);
      if (controller) {
        controller.abort();
        activeControllers.delete(key);
      }
    }
  };

  const abortAllControllers = (): void => {
    for (const controller of activeControllers.values()) {
      controller.abort();
    }
    activeControllers.clear();
  };

  return {
    activeControllers,
    inFlightPromises,
    registerController,
    removeController,
    abortControllersForKeys,
    abortAllControllers,
  };
}
