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

export class AsyncCompositeDisposable implements AsyncScopeDisposable {
  private readonly items: AsyncCleanupItem[] = [];
  private disposed = false;

  get isDisposed(): boolean {
    return this.disposed;
  }

  get size(): number {
    return this.items.length;
  }

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

  remove(disposable: AsyncCleanupItem): boolean {
    if (this.disposed || !disposable) return false;
    const idx = this.items.indexOf(disposable);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }

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
