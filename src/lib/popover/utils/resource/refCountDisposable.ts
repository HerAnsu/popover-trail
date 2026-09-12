/**
 * Reference-Counted Shared Resource Disposable Container.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/refCountDisposable
 */

import { wrapResult } from '../result';
import {
  DISPOSE_SYMBOL,
  getDisposeMethod,
  type ScopeDisposable,
  type CleanupItem,
} from './disposableTypes';
import { createDisposable, DISPOSED_DISPOSABLE } from './singleDisposable';

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

export class RefCountDisposable implements ScopeDisposable {
  private underlying: CleanupItem;
  private refCount = 0;
  private primaryDisposed = false;
  private underlyingDisposed = false;

  constructor(underlying: CleanupItem) {
    this.underlying = underlying;
  }

  get count(): number {
    return this.refCount;
  }

  get isDisposed(): boolean {
    return this.underlyingDisposed;
  }

  acquire(): ScopeDisposable & { readonly isDisposed: boolean } {
    if (this.underlyingDisposed) {
      return DISPOSED_DISPOSABLE;
    }
    this.refCount++;
    return createDisposable(() => {
      this.release();
    });
  }

  private release(): void {
    if (this.refCount > 0) {
      this.refCount--;
    }
    if (this.primaryDisposed && this.refCount === 0 && !this.underlyingDisposed) {
      this.teardown();
    }
  }

  private teardown(): void {
    this.underlyingDisposed = true;
    const target = this.underlying;
    this.underlying = null;
    safelyDispose(target);
  }

  dispose(): void {
    if (this.primaryDisposed) return;
    this.primaryDisposed = true;
    if (this.refCount === 0 && !this.underlyingDisposed) {
      this.teardown();
    }
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
