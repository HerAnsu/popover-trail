/**
 * In-Flight Promise Awaiter & Resolution Settlement.
 *
 * @module store/resolver/awaitResolution
 */

import { toError } from '../../utils/storeHelpers';
import { handleResolverSuccess, handleResolverError } from './resolverResultHandler';
import type { AwaitInFlightResolutionArgs } from './resolverTypes';

/**
 * Awaits an in-flight promise resolution and commits success or error state patches.
 *
 * Checks if the resolution request has become stale prior to committing state changes.
 * Dispatches performance telemetry and updates the store accordingly.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param args - Structured arguments including the active promise, keys, dependencies, and state builders.
 * @returns Promise resolving when settlement is committed to the store.
 *
 * @example
 * ```typescript
 * await awaitInFlightResolution({
 *   inFlight: promise,
 *   key: 'item-1',
 *   requestCounter: 1,
 *   resolveParams,
 *   deps,
 *   storeCache,
 *   startTime: performance.now(),
 *   isDeduped: false,
 *   buildEntry,
 * });
 * ```
 */
export async function awaitInFlightResolution<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(args: AwaitInFlightResolutionArgs<TData, TContext, TPopoverKey>): Promise<void> {
  const {
    inFlight,
    key,
    requestCounter,
    resolveParams,
    deps,
    storeCache,
    startTime,
    isDeduped,
    buildEntry,
  } = args;

  try {
    const data = await inFlight;
    if (resolveParams.isStale(requestCounter)) return;

    handleResolverSuccess(
      data,
      key,
      buildEntry(data, null, false),
      resolveParams,
      deps,
      storeCache,
      startTime,
      isDeduped ? 'deduped' : 'async',
    );
  } catch (err) {
    if (resolveParams.isStale(requestCounter)) return;

    const error = toError(err);
    handleResolverError(error, key, deps, resolveParams, buildEntry(null, error, false), startTime);
  }
}
