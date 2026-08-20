/**
 * Middleware Engine for intercepting and transforming PopoverStore state patches.
 *
 * @module storeMiddlewareEngine
 */

import type { PopoverMiddleware, PopoverStore } from '../types';
import { wrapResult, isErr } from '../utils/result';
import { DISPOSE_SYMBOL } from '../utils/disposable';

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
 */
export class PopoverMiddlewareEngine<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  private readonly middlewares = new Set<PopoverMiddleware<TData, TContext, TPopoverKey>>();

  public use(middleware: PopoverMiddleware<TData, TContext, TPopoverKey>): () => void {
    if (!middleware || typeof middleware !== 'function') return () => {};
    this.middlewares.add(middleware);
    return () => {
      this.middlewares.delete(middleware);
    };
  }

  public get size(): number {
    return this.middlewares.size;
  }

  public clear(): void {
    this.middlewares.clear();
  }

  public dispose(): void {
    this.clear();
  }

  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }

  /**
   * Pipeline runner executing registered middleware interceptors on state patches using Result monad.
   */
  public apply(
    initialPatch: Partial<PopoverStore<TData, TContext, TPopoverKey>>,
    currentState: PopoverStore<TData, TContext, TPopoverKey>,
  ): Partial<PopoverStore<TData, TContext, TPopoverKey>> | false {
    if (this.middlewares.size === 0) return initialPatch;

    let patch = initialPatch;
    let isCloned = false;

    for (const mw of this.middlewares) {
      const execResult = wrapResult(() => mw(patch, currentState));

      if (isErr(execResult)) {
        console.error('[PopoverStore] Middleware execution error:', execResult.error);
        continue;
      }

      const result = execResult.data;
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
    }

    return patch;
  }
}
