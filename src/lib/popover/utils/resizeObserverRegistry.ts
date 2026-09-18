/**
 * Shared ResizeObserver Registry with Reference Counting and Debounced Frames.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module resizeObserverRegistry
 */

import { wrapResult, isErr } from './result';
import { logger } from './logger';
import { isBrowser, isResizeObserverSupported } from './guards/envGuards';
import { noop } from './functional';

type ResizeCallback = (entry: ResizeObserverEntry) => void;

function notifyElementResize(callbacks: Set<ResizeCallback>, entry: ResizeObserverEntry): void {
  for (const cb of callbacks) {
    const res = wrapResult(() => cb(entry));
    if (isErr(res))
      logger.error('[popover-trail]: Exception in ResizeObserver callback:', res.error);
  }
}

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
      const cbs = this.listeners.get(entry.target);
      if (cbs) notifyElementResize(cbs, entry);
    }
  };

  private initObserver() {
    if (this.observer || !isResizeObserverSupported()) return;
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) this.pendingEntries.set(entry.target, entry);
      if (this.frameId === null) {
        this.frameId =
          typeof requestAnimationFrame !== 'undefined'
            ? requestAnimationFrame(this.flushCallbacks)
            : (this.flushCallbacks(), null);
      }
    });
  }

  /**
   * Registers a resize listener callback for the specified DOM Element.
   * Automatically initializes the shared ResizeObserver instance if not already running.
   *
   * @param element - The target DOM Element to observe.
   * @param callback - Function invoked on debounced animation frame when dimensions change.
   * @returns Cleanup function that unobserves the element and detaches the callback.
   *
   * @example
   * ```typescript
   * const cleanup = ResizeObserverRegistry.observe(element, (entry) => {
   *   console.log('New content rect:', entry.contentRect);
   * });
   * // Later:
   * cleanup();
   * ```
   */
  observe(element: Element | null | undefined, callback: ResizeCallback): () => void {
    if (!element || !isBrowser()) return noop;
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
          this.pendingEntries.delete(element);
          this.observer?.unobserve(element);
        }
      }
    };
  }

  /**
   * Clears all registered elements, cancels any pending animation frame callbacks,
   * and disconnects the underlying ResizeObserver.
   *
   * @example
   * ```typescript
   * ResizeObserverRegistry.clear();
   * ```
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
   * Disposes the registry and frees all observed elements.
   *
   * @example
   * ```typescript
   * ResizeObserverRegistry.dispose();
   * ```
   */
  dispose(): void {
    this.clear();
  }
}

export const ResizeObserverRegistry = new ResizeObserverRegistryImpl();
export const resetRegistryForTesting = () => ResizeObserverRegistry.clear();
