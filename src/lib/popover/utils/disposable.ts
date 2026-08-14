/**
 * Explicit Resource Management Utilities (TS 5.2+ Symbol.dispose / using pattern).
 * Provides scope-bound disposable cleanup handles for store listeners, timers, and DOM subscriptions.
 *
 * @module disposable
 */

declare global {
  interface SymbolConstructor {
    readonly dispose?: symbol;
    readonly asyncDispose?: symbol;
  }
}

/**
 * Interface representing a disposable resource with TypeScript 5.2+ Symbol.dispose support.
 */
export interface ScopeDisposable {
  /** Standard disposal method. */
  dispose: () => void;
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
const DISPOSE_SYMBOL =
  typeof Symbol !== 'undefined' ? (Symbol.dispose ?? Symbol.for('Symbol.dispose')) : undefined;

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

  if (DISPOSE_SYMBOL) {
    (handle as unknown as Record<symbol, unknown>)[DISPOSE_SYMBOL] = doCleanup;
  }

  return handle;
}

function safelyDisposeItem(d: ScopeDisposable | (() => void) | null | undefined): void {
  if (!d) return;
  try {
    if (typeof d === 'function') {
      d();
    } else if (typeof d.dispose === 'function') {
      d.dispose();
    }
  } catch {
    // Safe disposal
  }
}

/**
 * Composite container managing multiple disposable handles and cleanup callbacks atomically.
 *
 * @remarks
 * Collects event listeners, intervals, and store subscriptions. When disposed (via `.dispose()` or `using`),
 * all contained disposables are executed safely in isolation.
 *
 * @example
 * ```typescript
 * {
 *   using bag = new CompositeDisposable();
 *   bag.add(store.subscribe(handleChange));
 *   bag.add(() => window.removeEventListener('resize', handleResize));
 * } // Everything is disposed automatically upon exiting this block!
 * ```
 */
export class CompositeDisposable implements ScopeDisposable {
  private readonly disposables = new Set<ScopeDisposable | (() => void)>();
  private disposed = false;

  /**
   * Adds one or more disposables or cleanup callbacks to the composite container.
   * If the composite is already disposed, newly added items are disposed immediately.
   */
  add(...disposables: (ScopeDisposable | (() => void) | null | undefined)[]): void {
    if (this.disposed) {
      for (const d of disposables) {
        safelyDisposeItem(d);
      }
      return;
    }
    for (const d of disposables) {
      if (d) this.disposables.add(d);
    }
  }

  /**
   * Removes a disposable handle from the container without invoking its cleanup callback.
   *
   * @returns True if the item was found and removed.
   */
  remove(disposable: ScopeDisposable | (() => void)): boolean {
    return this.disposables.delete(disposable);
  }

  /** Number of active registered disposable handles. */
  get size(): number {
    return this.disposables.size;
  }

  /** Disposes all registered handles and cleans up the container. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const d of this.disposables) {
      safelyDisposeItem(d);
    }
    this.disposables.clear();
  }

  /** Explicit resource management symbol handler for TS 5.2+ `using` statements. */
  [DISPOSE_SYMBOL as symbol](): void {
    this.dispose();
  }
}
