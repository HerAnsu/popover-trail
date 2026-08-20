import { wrapResult } from './result';

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
 * Global Symbol for explicit resource management (`Symbol.dispose`).
 */
export const DISPOSE_SYMBOL: symbol = Symbol.dispose ?? Symbol.for('Symbol.dispose');

/**
 * Creates a disposable handle object from a cleanup callback.
 * Implements both `.dispose()` and `[Symbol.dispose]()` for TypeScript `using` declarations.
 *
 * @param cleanupFn - Cleanup callback executed exactly once upon disposal.
 * @returns Disposable handle object.
 *
 * @example
 * ```typescript
 * const handle = createDisposable(() => clearInterval(timer));
 * handle.dispose();
 * ```
 */
export function createDisposable(
  cleanupFn: () => void,
): ScopeDisposable & { [key: symbol]: () => void } {
  let disposed = false;
  const doCleanup = () => {
    if (!disposed) {
      disposed = true;
      wrapResult(() => cleanupFn());
    }
  };

  return {
    dispose: doCleanup,
    [DISPOSE_SYMBOL]: doCleanup,
  };
}

function safelyDisposeItem(d: ScopeDisposable | (() => void) | null | undefined): void {
  if (!d) return;
  wrapResult(() => {
    if (typeof d === 'function') {
      d();
    } else if (typeof d.dispose === 'function') {
      d.dispose();
    }
  });
}

/**
 * Composite container that holds and manages multiple disposable handles.
 * Disposing the CompositeDisposable disposes all handles registered within it in one call.
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

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
