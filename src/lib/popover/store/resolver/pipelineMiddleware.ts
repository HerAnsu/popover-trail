/**
 * Composable Middleware Layer for Resolver Pipeline.
 * Provides caching, in-flight deduplication, and signal handling interceptors.
 *
 * @module store/resolver/pipelineMiddleware
 */

import type { ResolverCacheManager } from './ResolverCacheManager';
import type { InFlightPromiseCache } from '../controllers/InFlightPromiseCache';
import type { ResolverHandler, ResolverMiddleware } from './pipelineMiddlewareTypes';
import { compose } from '../../utils/functional';

export type {
  ResolverParams,
  ResolverHandler,
  ResolverMiddleware,
} from './pipelineMiddlewareTypes';

function assertNotAborted(signal: AbortSignal, message: string, cause?: unknown): void {
  if (signal.aborted) {
    const err = new Error(message, { cause });
    err.name = 'AbortError';
    throw err;
  }
}

/**
 * Middleware: L1 Synchronous Cache lookup and write-through interceptor.
 *
 * Checks `cacheManager.readSync(key)` before invoking `next()`. If cached, returns immediately without running `next()`.
 * Upon successful `next()` completion, commits the data to cache via `cacheManager.writeSync(key, data)`.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param cacheManager - Cache manager to read from and write to.
 * @returns Resolver middleware function.
 *
 * @example
 * ```typescript
 * const middleware = withL1Cache(cacheManager);
 * ```
 */
export function withL1Cache<TData, TContext = unknown, TPopoverKey extends string = string>(
  cacheManager: ResolverCacheManager<TData, TPopoverKey>,
): ResolverMiddleware<TData, TContext, TPopoverKey> {
  return (next) => async (params) => {
    const cached = cacheManager.readSync(params.key);
    if (cached !== undefined) return cached;
    const data = await next(params);
    cacheManager.writeSync(params.key, data);
    return data;
  };
}

/**
 * Middleware: In-Flight Promise Deduplication interceptor per popover key.
 *
 * Ensures concurrent requests for the same key share a single running Promise.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param promiseCache - InFlightPromiseCache instance.
 * @returns Resolver middleware function.
 *
 * @example
 * ```typescript
 * const middleware = withInFlightDeduplication(inFlightCache);
 * ```
 */
export function withInFlightDeduplication<
  TData,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  promiseCache: InFlightPromiseCache<TData, TPopoverKey>,
): ResolverMiddleware<TData, TContext, TPopoverKey> {
  return (next) => (params) => promiseCache.runTracked(params.key, () => next(params));
}

/**
 * Middleware: AbortSignal validation before and after resolution dispatch.
 *
 * Throws an `AbortError` if `params.signal` is already aborted before execution or becomes aborted during resolution.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param errorCause - Optional error cause to attach to the AbortError.
 * @returns Resolver middleware function.
 *
 * @example
 * ```typescript
 * const middleware = withAbortSignal();
 * ```
 */
export function withAbortSignal<TData, TContext = unknown, TPopoverKey extends string = string>(
  errorCause?: unknown,
): ResolverMiddleware<TData, TContext, TPopoverKey> {
  return (next) => async (params) => {
    const { signal } = params;
    assertNotAborted(signal, 'Aborted before execution', errorCause);
    const data = await next(params);
    assertNotAborted(signal, 'Aborted during resolution', errorCause);
    return data;
  };
}

/**
 * Composes multiple resolver middleware functions into a single pipeline handler.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param baseResolver - Core resolver handler at the end of the chain.
 * @param middlewares - Array of middleware functions applied in order.
 * @returns Composed resolver handler function.
 *
 * @example
 * ```typescript
 * const composedHandler = composeResolverPipeline(baseResolver, [
 *   withAbortSignal(),
 *   withL1Cache(cacheManager),
 *   withInFlightDeduplication(inFlightCache),
 * ]);
 * ```
 */
export function composeResolverPipeline<
  TData,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  baseResolver: ResolverHandler<TData, TContext, TPopoverKey>,
  middlewares: readonly ResolverMiddleware<TData, TContext, TPopoverKey>[],
): ResolverHandler<TData, TContext, TPopoverKey> {
  const valid = middlewares.filter(
    (mw): mw is ResolverMiddleware<TData, TContext, TPopoverKey> => typeof mw === 'function',
  );
  if (valid.length === 0) return baseResolver;
  const pipeline = compose<ResolverHandler<TData, TContext, TPopoverKey>>(...valid);
  return pipeline(baseResolver);
}
