/**
 * Middleware Engine for intercepting and transforming PopoverStore state patches.
 *
 * @module storeMiddlewareEngine
 */

import type { PopoverMiddleware, PopoverStore } from '../types';

const DISPOSE_SYMBOL: symbol =
  (Symbol as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');

function isStorePatchObject<TData, TContext, TPopoverKey extends string>(
  val: unknown,
): val is Partial<PopoverStore<TData, TContext, TPopoverKey>> {
  return (
    typeof val === 'object' &&
    val !== null &&
    !Array.isArray(val) &&
    !(val instanceof Date) &&
    !(val instanceof RegExp)
  );
}

function mergeSanitizedPatch<T extends object>(target: T, source: object): void {
  for (const k of Object.keys(source)) {
    if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
      (target as Record<string, unknown>)[k] = (source as Record<string, unknown>)[k];
    }
  }
}

/**
 * Middleware Engine managing store interceptor subscriptions and patch processing pipeline.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Valid popover key union.
 */
export class PopoverMiddlewareEngine<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  private readonly middlewares = new Set<PopoverMiddleware<TData, TContext, TPopoverKey>>();

  /** Registers a new middleware interceptor and returns an unsubscription callback. */
  public use(middleware: PopoverMiddleware<TData, TContext, TPopoverKey>): () => void {
    if (!middleware || typeof middleware !== 'function') return () => {};
    this.middlewares.add(middleware);
    return () => {
      this.middlewares.delete(middleware);
    };
  }

  /** Gets the current count of active registered middlewares. */
  public get size(): number {
    return this.middlewares.size;
  }

  /** Clears all registered middleware interceptors. */
  public clear(): void {
    this.middlewares.clear();
  }

  /** ScopeDisposable compliance handle clearing all registered middlewares. */
  public dispose(): void {
    this.clear();
  }

  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }

  /**
   * Pipeline runner executing registered middleware interceptors on state patches.
   * If any middleware returns false, the update is canceled (returns false).
   */
  public apply(
    initialPatch: Partial<PopoverStore<TData, TContext, TPopoverKey>>,
    currentState: PopoverStore<TData, TContext, TPopoverKey>,
  ): Partial<PopoverStore<TData, TContext, TPopoverKey>> | false {
    if (this.middlewares.size === 0) return initialPatch;

    let patch = initialPatch;
    let isCloned = false;

    for (const mw of this.middlewares) {
      try {
        const result = mw(patch, currentState);
        if (result === false) {
          return false;
        }
        if (isStorePatchObject(result)) {
          if (!isCloned) {
            patch = { ...initialPatch };
            isCloned = true;
          }
          mergeSanitizedPatch(patch, result);
        }
      } catch (err) {
        console.error('[PopoverStore] Middleware execution error:', err);
      }
    }

    return patch;
  }
}
