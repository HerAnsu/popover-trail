/**
 * Atomic Single-Slot Disposable Container with Predecessor Cancellation.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/serialDisposable
 */

import { wrapResult } from '../result';
import {
  DISPOSE_SYMBOL,
  getDisposeMethod,
  type ScopeDisposable,
  type CleanupItem,
} from './disposableTypes';

function safelyDispose(d: CleanupItem): void {
  if (!d) return;
  wrapResult(() => {
    if (typeof d === 'function') {
      d();
    } else {
      const fn = getDisposeMethod(d);
      fn?.();
    }
  });
}

/**
 * Container holding a single disposable resource that disposes the previous resource whenever a new one is assigned.
 *
 * Useful for managing resources that are continually replaced (such as active timers, inflight requests, or dynamic subscriptions).
 * If the container itself is disposed, any newly assigned resource is immediately disposed.
 *
 * @example
 * ```typescript
 * const serial = new SerialDisposable();
 *
 * // Assign first timer
 * serial.set(createTimerDisposable(setTimeout(() => {}, 1000)));
 *
 * // Assign second timer: first timer is automatically cancelled!
 * serial.set(createTimerDisposable(setTimeout(() => {}, 2000)));
 *
 * // Cleanup container and active timer
 * serial.dispose();
 * ```
 */
export class SerialDisposable implements ScopeDisposable {
  private current: CleanupItem = null;
  private disposed = false;

  /**
   * Indicates whether this container has been permanently disposed.
   */
  get isDisposed(): boolean {
    return this.disposed;
  }

  /**
   * Gets the currently active disposable or cleanup function without removing it.
   *
   * @returns Current active cleanup item or null.
   */
  get(): CleanupItem {
    return this.current;
  }

  /**
   * Sets the active disposable item, automatically disposing the previously tracked item.
   * If this container is already disposed, the new item is disposed immediately.
   *
   * @param newDisposable - New resource or teardown callback to track.
   *
   * @example
   * ```typescript
   * serial.set(createEventListenerDisposable(window, 'resize', onResize));
   * ```
   */
  set(newDisposable: CleanupItem): void {
    if (this.disposed) {
      safelyDispose(newDisposable);
      return;
    }
    const previous = this.current;
    this.current = newDisposable;
    safelyDispose(previous);
  }

  /**
   * Permanently disposes this container and cleans up the currently held resource.
   * Subsequent assignments to `set()` will immediately dispose the incoming item.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const previous = this.current;
    this.current = null;
    safelyDispose(previous);
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
