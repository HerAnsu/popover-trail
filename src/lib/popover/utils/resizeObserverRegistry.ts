/**
 * Shared ResizeObserver Registry for popover-trail.
 * Manages a single native ResizeObserver instance with reference counting
 * to observe element size changes without memory leaks or observer proliferation.
 *
 * @module resizeObserverRegistry
 */

type ResizeCallback = (entry: ResizeObserverEntry) => void;

class ResizeObserverRegistryImpl {
  private observer: ResizeObserver | null = null;
  private listeners = new Map<Element, Set<ResizeCallback>>();

  private initObserver() {
    if (this.observer || typeof ResizeObserver === 'undefined') return;

    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const callbackSet = this.listeners.get(entry.target);
        if (callbackSet) {
          for (const callback of callbackSet) {
            try {
              callback(entry);
            } catch (err) {
              if (typeof console !== 'undefined') {
                console.error('[popover-trail]: Exception in ResizeObserver callback:', err);
              }
            }
          }
        }
      }
    });
  }

  /**
   * Observe a DOM element for size changes.
   *
   * @param element - Target DOM element to observe.
   * @param callback - Callback invoked whenever the element resizes.
   * @returns Unobserve cleanup function.
   */
  observe(element: Element | null | undefined, callback: ResizeCallback): () => void {
    if (!element || typeof window === 'undefined') {
      return () => {};
    }

    this.initObserver();

    let set = this.listeners.get(element);
    if (!set) {
      set = new Set();
      this.listeners.set(element, set);
      this.observer?.observe(element);
    }

    set.add(callback);

    return () => {
      const currentSet = this.listeners.get(element);
      if (currentSet) {
        currentSet.delete(callback);
        if (currentSet.size === 0) {
          this.listeners.delete(element);
          this.observer?.unobserve(element);
        }
      }
    };
  }

  /**
   * Clear all active observed targets and disconnect the native observer instance.
   */
  clear(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.listeners.clear();
  }
}

export const ResizeObserverRegistry = new ResizeObserverRegistryImpl();
