/**
 * Zero-GC Fixed-Capacity Composite Disposable Container.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/fixedCompositeDisposable
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
 * Fixed-capacity, pre-allocated composite disposable container designed for zero-allocation resource tracking in hot execution paths.
 *
 * Avoids dynamic array resizes and GC pauses by enforcing a fixed capacity threshold.
 * Teardown occurs in LIFO (reverse) order upon disposal.
 *
 * @example
 * ```typescript
 * const fixed = new FixedCompositeDisposable(4);
 * fixed.add(timerDisposable);
 * fixed.add(rafDisposable);
 *
 * // Tears down registered items in LIFO order
 * fixed.dispose();
 * ```
 */
export class FixedCompositeDisposable implements ScopeDisposable {
  private readonly slots: CleanupItem[];
  private top = 0;
  private disposed = false;

  /**
   * Initializes a fixed-capacity disposable container.
   *
   * @param capacity - Maximum number of disposables this container can hold (defaults to 8).
   */
  constructor(capacity = 8) {
    this.slots = Array.from<CleanupItem>({ length: capacity });
  }

  /**
   * Maximum capacity of this container before rejecting new items.
   */
  get capacity(): number {
    return this.slots.length;
  }

  /**
   * Current count of tracked cleanup items.
   */
  get size(): number {
    return this.top;
  }

  /**
   * Indicates whether this container has been permanently disposed.
   */
  get isDisposed(): boolean {
    return this.disposed;
  }

  /**
   * Adds a cleanup item or disposable to the container without allocating memory.
   * If capacity is exceeded or container is already disposed, the item is disposed immediately and returns `false`.
   *
   * @param item - Cleanup item to track.
   * @returns True if successfully added, false if capacity was full or container was disposed.
   *
   * @example
   * ```typescript
   * const added = fixed.add(createTimerDisposable(id));
   * if (!added) {
   *   // Container was full or disposed
   * }
   * ```
   */
  add(item: CleanupItem): boolean {
    if (!item) return true;
    if (this.disposed) {
      safelyDispose(item);
      return false;
    }
    if (this.top >= this.slots.length) {
      safelyDispose(item);
      return false;
    }
    this.slots[this.top++] = item;
    return true;
  }

  /**
   * Disposes all registered items in LIFO order and releases slot references.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    while (this.top > 0) {
      const item = this.slots[--this.top];
      this.slots[this.top] = null;
      safelyDispose(item);
    }
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
