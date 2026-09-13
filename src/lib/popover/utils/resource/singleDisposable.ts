/**
 * Single Resource Disposable Factory with Idempotency Guard.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/singleDisposable
 */

import { wrapResult } from '../result';
import { DISPOSE_SYMBOL, type ScopeDisposable } from './disposableTypes';
import { noop } from '../functional';

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

export const DISPOSED_DISPOSABLE: ScopeDisposable & {
  readonly isDisposed: boolean;
} = Object.freeze({
  isDisposed: true,
  dispose: noop,
  [DISPOSE_SYMBOL]: noop,
});
