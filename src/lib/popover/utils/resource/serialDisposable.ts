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

export class SerialDisposable implements ScopeDisposable {
  private current: CleanupItem = null;
  private disposed = false;

  get isDisposed(): boolean {
    return this.disposed;
  }

  get(): CleanupItem {
    return this.current;
  }

  set(newDisposable: CleanupItem): void {
    if (this.disposed) {
      safelyDispose(newDisposable);
      return;
    }
    const previous = this.current;
    this.current = newDisposable;
    safelyDispose(previous);
  }

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
