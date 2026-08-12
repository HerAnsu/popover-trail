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

  private pendingEntries = new Map<Element, ResizeObserverEntry>();
  private frameId: number | null = null;

  private flushCallbacks = () => {
    this.frameId = null;
    if (this.listeners.size === 0) return;
    const toProcess = this.pendingEntries;
    this.pendingEntries = new Map<Element, ResizeObserverEntry>();

    for (const entry of toProcess.values()) {
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
  };

  private initObserver() {
    if (this.observer || typeof ResizeObserver === 'undefined') return;

    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.pendingEntries.set(entry.target, entry);
      }

      if (this.frameId === null && typeof requestAnimationFrame !== 'undefined') {
        this.frameId = requestAnimationFrame(this.flushCallbacks);
      } else if (this.frameId === null) {
        this.flushCallbacks();
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
    if (this.frameId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.pendingEntries.clear();
    this.observer?.disconnect();
    this.observer = null;
    this.listeners.clear();
  }

  /**
   * ScopeDisposable compliance handle clearing all registrations.
   */
  dispose(): void {
    this.clear();
  }
}

export const ResizeObserverRegistry = new ResizeObserverRegistryImpl();
