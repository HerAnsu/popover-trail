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

/**
 * Reference-counted disposable container for shared resources (e.g., shared worker connections, event channels).
 *
 * The underlying resource remains open until both:
 * 1. The primary `RefCountDisposable` container has been disposed.
 * 2. Every acquired handle via `acquire()` has been released.
 *
 * @example
 * ```typescript
 * const refCounted = new RefCountDisposable(createSharedWorker());
 *
 * // Consumer A acquires a handle
 * const handleA = refCounted.acquire();
 *
 * // Primary container marked for disposal (underlying resource still alive because handleA is active)
 * refCounted.dispose();
 *
 * // Consumer A finishes and releases handle -> underlying resource is now torn down!
 * handleA.dispose();
 * ```
 */
export class RefCountDisposable implements ScopeDisposable {
  private underlying: CleanupItem;
  private refCount = 0;
  private primaryDisposed = false;
  private underlyingDisposed = false;

  /**
   * Creates a reference-counted container around a shared underlying resource.
   *
   * @param underlying - Target resource or teardown callback to manage.
   */
  constructor(underlying: CleanupItem) {
    this.underlying = underlying;
  }

  /**
   * Current number of actively held references.
   */
  get count(): number {
    return this.refCount;
  }

  /**
   * Indicates whether the underlying shared resource has been permanently destroyed.
   */
  get isDisposed(): boolean {
    return this.underlyingDisposed;
  }

  /**
   * Acquires a reference handle to the underlying resource.
   * Disposing the returned handle decrements the reference count.
   *
   * @returns Disposable handle that decrements the reference count on disposal.
   *
   * @example
   * ```typescript
   * const handle = refCounted.acquire();
   * try {
   *   // use shared resource
   * } finally {
   *   handle.dispose();
   * }
   * ```
   */
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

  /**
   * Marks the primary container as disposed.
   * If there are zero active acquired references, the underlying resource is torn down immediately.
   * Otherwise, teardown is deferred until all active handles are disposed.
   */
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
