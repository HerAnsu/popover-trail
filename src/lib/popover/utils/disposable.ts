/**
 * Explicit Resource Management Utilities (TS 5.2+ Symbol.dispose / using pattern).
 * Provides scope-bound disposable cleanup handles for store listeners, timers, and DOM subscriptions.
 *
 * @module disposable
 */

/**
 * Interface representing a disposable resource with TypeScript 5.2+ Symbol.dispose support.
 */
export interface ScopeDisposable {
  /** Standard disposal method. */
  dispose: () => void;
  /** Explicit resource management symbol handler for TS 5.2 `using` statements. */
  [key: symbol]: unknown;
}

/**
 * Creates a ScopeDisposable wrapper supporting TS 5.2+ `using` statements and standard `dispose()`.
 *
 * @param cleanupFn - Cleanup callback invoked upon disposal.
 * @returns ScopeDisposable object handle.
 *
 * @example
 * ```typescript
 * {
 *   using sub = createDisposable(() => store.unsubscribe());
 * } // Automatically disposes when exiting block scope!
 * ```
 */
export function createDisposable(cleanupFn: () => void): ScopeDisposable {
  let disposed = false;
  const doCleanup = () => {
    if (!disposed) {
      disposed = true;
      try {
        cleanupFn();
      } catch {
        // Safe disposal
      }
    }
  };

  const handle: ScopeDisposable = {
    dispose: doCleanup,
  };

  const disposeSymbol = (Symbol as unknown as { dispose?: symbol }).dispose;
  if (disposeSymbol) {
    handle[disposeSymbol] = doCleanup;
  }

  return handle;
}
