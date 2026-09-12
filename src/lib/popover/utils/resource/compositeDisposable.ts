/**
 * Composite Container for Aggregate Resource Disposals with LIFO Teardown.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/compositeDisposable
 */

import { wrapResult } from '../result';
import { DISPOSE_SYMBOL, getDisposeMethod, type ScopeDisposable, type CleanupItem } from './disposableTypes';

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

export class CompositeDisposable implements ScopeDisposable {
  private readonly items: CleanupItem[] = [];
  private disposed = false;

  get isDisposed(): boolean {
    return this.disposed;
  }

  get size(): number {
    return this.items.length;
  }

  /**
   * Registers one or more cleanup items or disposables into this aggregate container.
   * If already disposed, newly added items are torn down immediately in LIFO order.
   *
   * @param items - Disposables, teardown functions, or cleanup descriptors.
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
