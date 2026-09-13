/**
 * Composable Middleware Engine for popover-trail store.
 * Coordinates pipeline execution and state patches across registered middleware.
 *
 * @module storeMiddlewareEngine
 */

import type { PopoverMiddleware, PopoverStore, TypedMiddlewarePatch } from '../../types';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { toError } from '../../utils/storeHelpers';
import { isUnsafeKey } from '../../utils/safeKeys';
import { noop } from '../../utils/functional';

function isStorePatchObject<TData, TContext, TPopoverKey extends string>(
  val: unknown,
): val is Partial<PopoverStore<TData, TContext, TPopoverKey>> {
  return typeof val === 'object' && val !== null;
}

/**
 * Merges patch properties into target while blocking prototype pollution.
 *
 * @remarks
 * Skips dangerous keys (`__proto__`, `constructor`, `prototype`) to guard against
 * prototype pollution from third-party middleware, modifying the object directly.
 */
function mergeSanitizedPatch<T extends object>(target: T, source: object): void {
  for (const k of Object.keys(source)) {
    if (!isUnsafeKey(k)) {
      Reflect.set(target, k, Reflect.get(source, k));
    }
  }
}

/**
 * Runs middleware hooks for state inspection and mutation patches.
 *
 * @remarks
 * - Middleware runs inside isolated `try/catch` blocks so an error in custom logic never crashes the store.
 * - Uses Copy-On-Write: the original patch is only cloned if a middleware actually modifies it.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context type.
 * @template TPopoverKey - Registered string key identifiers.
 */
export class PopoverMiddlewareEngine<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  private readonly middlewares = new Set<PopoverMiddleware<TData, TContext, TPopoverKey>>();

  /**
   * Registers a middleware callback in the execution pipeline.
   *
   * @param middleware - Pure or patch-returning middleware function.
   * @returns Cleanup unsubscriber function.
   */
  public use(middleware: PopoverMiddleware<TData, TContext, TPopoverKey>): () => void {
    if (!middleware || typeof middleware !== 'function') return noop;
    this.middlewares.add(middleware);
    return () => {
      this.middlewares.delete(middleware);
    };
  }

  /** Total number of registered middleware in this engine. */
  public get size(): number {
    return this.middlewares.size;
  }

  /** Clears all registered middleware. */
  public clear(): void {
    this.middlewares.clear();
  }

  /** Releases engine resources. */
  public dispose(): void {
    this.clear();
  }

  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }

  public [Symbol.dispose](): void {
    this.dispose();
  }

  /**
   * Applies the middleware pipeline to an incoming store state patch.
   *
   * @remarks
   * If any middleware returns `false`, execution halts immediately and the patch is vetoed.
   * If a middleware returns a patch object, it is merged into the working patch using Copy-On-Write.
   *
   * @param initialPatch - Proposed state changes.
   * @param currentState - Current immutable store snapshot.
   * @returns Sanitized combined patch, or `false` if rejected.
   */
  public apply(
    initialPatch: Partial<PopoverStore<TData, TContext, TPopoverKey>>,
    currentState: PopoverStore<TData, TContext, TPopoverKey>,
  ): Partial<PopoverStore<TData, TContext, TPopoverKey>> | false {
    let patch = initialPatch;
    let isCloned = false;

    for (const mw of this.middlewares) {
      let result: ReturnType<typeof mw>;
      try {
        // Fault-isolated execution: user middleware errors cannot crash the engine
        result = mw(patch, currentState);
      } catch (error) {
        toError(error);
        continue;
      }

      // Explicit cancellation / rejection
      if (result === false) return false;

      // Copy-On-Write: allocate new patch container only when first patch modification occurs
      if (isStorePatchObject(result)) {
        if (!isCloned) {
          patch = { ...initialPatch };
          isCloned = true;
        }
        mergeSanitizedPatch(patch, result);
      }
    }
    return patch;
  }
}

/**
 * Composes multiple middleware functions into a single pipeline middleware.
 *
 * @remarks
 * Executes registered middleware in linear sequence. Short-circuits immediately if any middleware
 * returns `false`. Clones the patch container lazily on the first patch mutation (Copy-On-Write).
 *
 * @param middlewares - Variable list of middleware callbacks.
 * @returns Composed composite middleware function.
 */
export function composeMiddlewares<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ...middlewares: readonly PopoverMiddleware<TData, TContext, TPopoverKey>[]
): PopoverMiddleware<TData, TContext, TPopoverKey> {
  return (initialPatch, currentState) => {
    let patch: TypedMiddlewarePatch<TData, TContext, TPopoverKey> = initialPatch;
    let isCloned = false;

    for (const mw of middlewares) {
      if (typeof mw !== 'function') continue;
      const res = mw(patch, currentState);
      // Veto if any middleware explicitly returns false
      if (res === false) return false;
      // Lazily clone and sanitize patch mutations
      if (typeof res === 'object' && res !== null) {
        if (!isCloned) {
          patch = { ...initialPatch };
          isCloned = true;
        }
        mergeSanitizedPatch(patch, res);
      }
    }
    return patch;
  };
}
