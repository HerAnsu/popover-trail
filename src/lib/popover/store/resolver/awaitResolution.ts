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
