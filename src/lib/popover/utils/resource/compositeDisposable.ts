/**
 * Composite Container for Aggregate Resource Disposals with LIFO Teardown.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/compositeDisposable
 */

import { wrapResult } from '../result';
import {
  DISPOSE_SYMBOL,
  getDisposeMethod,
  type ScopeDisposable,
  type CleanupItem,
} from './disposableTypes';

function safelyDisposeItem(d: CleanupItem): void {
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
 * Composite container that aggregates multiple disposables or cleanup functions, tearing them down in LIFO (reverse) order.
 *
 * All cleanup errors are trapped internally to guarantee that failure of one disposable does not prevent sibling disposables from running.
 *
 * @example
 * ```typescript
 * const group = new CompositeDisposable();
 * group.add(
 *   createEventListenerDisposable(window, 'resize', handleResize),
 *   createTimerDisposable(timerId),
 *   () => console.log('teardown complete'),
 * );
 *
 * // Tears down timer, removes listener, and runs custom callback in LIFO order
 * group.dispose();
 * ```
 */
export class CompositeDisposable implements ScopeDisposable {
  private readonly items: CleanupItem[] = [];
  private disposed = false;

  /**
   * Indicates whether this composite container has been permanently disposed.
   */
  get isDisposed(): boolean {
    return this.disposed;
  }

  /**
   * Current number of registered cleanup items pending disposal.
   */
  get size(): number {
    return this.items.length;
  }

  /**
   * Registers one or more cleanup items or disposables into this aggregate container.
   * If already disposed, newly added items are torn down immediately in LIFO order.
   *
   * @param items - Disposables, teardown functions, or cleanup descriptors.
   *
   * @example
   * ```typescript
   * group.add(sub1, sub2);
   * ```
   */
  add(...items: CleanupItem[]): void {
    if (this.disposed) {
      for (let i = items.length - 1; i >= 0; i--) {
        safelyDisposeItem(items[i]);
      }
      return;
    }
    for (const item of items) {
      if (item) this.items.push(item);
    }
  }

  /**
   * Removes a registered cleanup item from this container without invoking it.
   *
   * @param disposable - Item to remove from tracking.
   * @returns True if the item was found and removed, false otherwise.
   *
   * @example
   * ```typescript
   * const removed = group.remove(sub1);
   * ```
   */
  remove(disposable: CleanupItem): boolean {
    if (this.disposed || !disposable) return false;
    const idx = this.items.indexOf(disposable);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Disposes all registered items in Last-In-First-Out (LIFO) order.
   * Each item is isolated so exceptions in one item do not abort remaining cleanups.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    while (this.items.length > 0) {
      const item = this.items.pop();
      safelyDisposeItem(item);
    }
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
