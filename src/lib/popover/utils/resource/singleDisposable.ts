/**
 * Single Resource Disposable Factory with Idempotency Guard.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/singleDisposable
 */

import { wrapResult } from '../result';
import { DISPOSE_SYMBOL, type ScopeDisposable } from './disposableTypes';
import { noop } from '../functional';

/**
 * Creates an idempotent disposable wrapper around a cleanup function.
 * Ensures the cleanup function executes at most once and catches any thrown errors.
 * Implements both `.dispose()` and `[Symbol.dispose]` contracts.
 *
 * @param cleanupFn - Teardown or resource deallocation callback.
 * @returns Idempotent disposable resource with `isDisposed` status indicator.
 *
 * @example
 * ```typescript
 * const disposable = createDisposable(() => {
 *   ws.close();
 * });
 *
 * disposable.dispose(); // Runs cleanupFn
 * disposable.dispose(); // No-op, already disposed
 * console.log(disposable.isDisposed); // true
 * ```
 */
export function createDisposable(
  cleanupFn: () => void,
): ScopeDisposable & { readonly isDisposed: boolean; [key: symbol]: () => void } {
  let disposed = false;
  const doCleanup = () => {
    if (!disposed) {
      disposed = true;
      wrapResult(() => cleanupFn());
    }
  };

  return {
    get isDisposed() {
      return disposed;
    },
    dispose: doCleanup,
    [DISPOSE_SYMBOL]: doCleanup,
  };
}

/**
 * Immutable pre-disposed singleton disposable instance.
 * Useful as a zero-allocation sentinel return value for no-op disposals.
 *
 * @example
 * ```typescript
 * function acquireResource(enabled: boolean): ScopeDisposable {
 *   if (!enabled) return DISPOSED_DISPOSABLE;
 *   return createDisposable(() => release());
 * }
 * ```
 */
export const DISPOSED_DISPOSABLE: ScopeDisposable & {
  readonly isDisposed: boolean;
} = Object.freeze({
  isDisposed: true,
  dispose: noop,
  [DISPOSE_SYMBOL]: noop,
});
