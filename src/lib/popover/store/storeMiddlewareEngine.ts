import type { PopoverMiddleware, PopoverStore } from '../types';

function isStorePatchObject<TData, TContext, TPopoverKey extends string>(
  val: unknown,
): val is Partial<PopoverStore<TData, TContext, TPopoverKey>> {
  return typeof val === 'object' && val !== null;
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
    this.middlewares.add(middleware);
    return () => {
      this.middlewares.delete(middleware);
    };
  }

  /** Gets the current count of active registered middlewares. */
  public get size(): number {
    return this.middlewares.size;
  }

  /**
   * Pipeline runner executing registered middleware interceptors on state patches.
   * If any middleware returns false, the update is cancelled (returns false).
   */
  public apply(
    initialPatch: Partial<PopoverStore<TData, TContext, TPopoverKey>>,
    currentState: PopoverStore<TData, TContext, TPopoverKey>,
  ): Partial<PopoverStore<TData, TContext, TPopoverKey>> | false {
    if (this.middlewares.size === 0) return initialPatch;

    const patch: Partial<PopoverStore<TData, TContext, TPopoverKey>> = { ...initialPatch };

    for (const mw of this.middlewares) {
      try {
        const result = mw(patch, currentState);
        if (result === false) {
          return false;
        }
        if (isStorePatchObject(result)) {
          Object.assign(patch, result);
        }
      } catch (err) {
        console.error('[PopoverStore] Middleware execution error:', err);
      }
    }

    return patch;
  }
}
