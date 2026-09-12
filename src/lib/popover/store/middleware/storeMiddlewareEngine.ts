/**
 * Composable Middleware Engine for popover-trail store.
 * Coordinates pipeline execution and state patches across registered middleware.
 *
 * @module storeMiddlewareEngine
 */

import type { PopoverMiddleware, PopoverStore } from '../../types';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { toError } from '../../utils/storeHelpers';
import { isUnsafeKey } from '../../utils/safeKeys';

function isStorePatchObject<TData, TContext, TPopoverKey extends string>(
  val: unknown,
): val is Partial<PopoverStore<TData, TContext, TPopoverKey>> {
  return typeof val === 'object' && val !== null;
}

function mergeSanitizedPatch<T extends object>(target: T, source: object): void {
  for (const k of Object.keys(source)) {
    if (!isUnsafeKey(k)) {
      Reflect.set(target, k, Reflect.get(source, k));
    }
  }
}

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

  public [Symbol.dispose](): void {
    this.dispose();
  }

  public apply(
    initialPatch: Partial<PopoverStore<TData, TContext, TPopoverKey>>,
    currentState: PopoverStore<TData, TContext, TPopoverKey>,
  ): Partial<PopoverStore<TData, TContext, TPopoverKey>> | false {
    let patch = initialPatch;
    let isCloned = false;

    for (const mw of this.middlewares) {
      let result: ReturnType<typeof mw>;
      try {
        result = mw(patch, currentState);
      } catch (error) {
        toError(error);
        continue;
      }

      if (result === false) return false;
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
