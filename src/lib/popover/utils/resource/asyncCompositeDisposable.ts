/**
 * Asynchronous Aggregate Resource Container with LIFO Teardown.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/asyncCompositeDisposable
 */

import {
  ASYNC_DISPOSE_SYMBOL,
  getDisposeMethod,
  getAsyncDisposeMethod,
  type AsyncScopeDisposable,
  type AsyncCleanupItem,
} from './disposableTypes';

async function safelyDisposeAsyncItem(d: AsyncCleanupItem): Promise<void> {
  if (!d) return;
  try {
    if (typeof d === 'function') {
      await d();
    } else {
      const asyncFn = getAsyncDisposeMethod(d);
      if (asyncFn) {
        await asyncFn();
      } else {
        const syncFn = getDisposeMethod(d);
        syncFn?.();
      }
    }
  } catch {
    /* isolated fault containment */
  }
}

/**
 * Asynchronous composite container aggregating async and sync disposables, tearing them down in LIFO order upon `disposeAsync()`.
 *
 * Implements `AsyncScopeDisposable` and `[Symbol.asyncDispose]`.
 * Fault-isolated: exceptions thrown in one disposal do not prevent remaining disposals from executing.
 *
 * @example
 * ```typescript
 * const asyncGroup = new AsyncCompositeDisposable();
 * asyncGroup.add(
 *   async () => await fetch('/cleanup'),
 *   createTimerDisposable(timerId),
 * );
 *
 * await asyncGroup.disposeAsync();
 * ```
 */
export class AsyncCompositeDisposable implements AsyncScopeDisposable {
  private readonly items: AsyncCleanupItem[] = [];
  private disposed = false;

  /**
   * Indicates whether this container has been permanently disposed.
   */
  get isDisposed(): boolean {
    return this.disposed;
  }

  /**
   * Number of registered items pending asynchronous disposal.
   */
  get size(): number {
    return this.items.length;
  }

  /**
   * Registers one or more asynchronous or synchronous cleanup items.
   * If already disposed, newly added items are torn down immediately in LIFO order.
   *
   * @param items - Async or sync disposables, or cleanup functions.
   *
   * @example
   * ```typescript
   * asyncGroup.add(asyncWorker, syncTimer);
   * ```
   */
  add(...items: AsyncCleanupItem[]): void {
    if (this.disposed) {
      for (let i = items.length - 1; i >= 0; i--) {
        void safelyDisposeAsyncItem(items[i]);
      }
      return;
    }
    for (const item of items) {
      if (item) this.items.push(item);
    }
  }

  /**
   * Removes an item from the container without invoking it.
   *
   * @param disposable - Item to untrack.
   * @returns True if found and removed, false otherwise.
   *
   * @example
   * ```typescript
   * const removed = asyncGroup.remove(task);
   * ```
   */
  remove(disposable: AsyncCleanupItem): boolean {
    if (this.disposed || !disposable) return false;
    const idx = this.items.indexOf(disposable);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Asynchronously disposes all registered items in LIFO order, awaiting their resolution concurrently.
   *
   * @returns Promise resolving when all items have completed teardown.
   */
  async disposeAsync(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    const tasks: Promise<void>[] = [];
    while (this.items.length > 0) {
      const item = this.items.pop();
      tasks.push(safelyDisposeAsyncItem(item));
    }
    await Promise.all(tasks);
  }

  async [ASYNC_DISPOSE_SYMBOL](): Promise<void> {
    await this.disposeAsync();
  }
}
