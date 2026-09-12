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

export class FixedCompositeDisposable implements ScopeDisposable {
  private readonly slots: CleanupItem[];
  private top = 0;
  private disposed = false;

  constructor(capacity = 8) {
    this.slots = Array.from<CleanupItem>({ length: capacity });
  }

  get capacity(): number {
    return this.slots.length;
  }

  get size(): number {
    return this.top;
  }

  get isDisposed(): boolean {
    return this.disposed;
  }

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
