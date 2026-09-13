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
 * Middleware: L1 Synchronous Cache lookup and write-through.
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
 * Middleware: In-Flight Promise Deduplication per key.
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
 * Middleware: AbortSignal validation before and after dispatch.
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
 * Middleware: Compose multiple middleware functions into a single pipeline handler.
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
  const pipeline = compose(...(valid as readonly ((h: unknown) => unknown)[])) as (
    base: ResolverHandler<TData, TContext, TPopoverKey>,
  ) => ResolverHandler<TData, TContext, TPopoverKey>;
  return pipeline(baseResolver);
}
