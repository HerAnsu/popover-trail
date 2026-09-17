/**
 * Synchronous Resolver Execution and Fast-Path Dispatcher.
 *
 * @module store/resolver/syncResolver
 */

import { handleResolverSuccess } from './resolverResultHandler';
import { startInFlightResolver } from './inFlightLauncher';
import type { SyncResolutionLaunchArgs } from './resolverTypes';

/**
 * Attempts synchronous resolver execution; commits state on immediate success or returns status.
 *
 * Fast-path optimization: if the resolver function returns synchronously (non-promise), the data is committed
 * immediately to the store without queueing microtasks or dispatching intermediate loading states.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param args - Arguments controlling the resolution attempt.
 * @returns True if resolution finished (synchronously or with immediate error), false if running asynchronously.
 *
 * @example
 * ```typescript
 * const finished = tryLaunchSyncResolver({
 *   key: 'static-item',
 *   controllerKey: 'static-item',
 *   parentData: null,
 *   activeResolver: (k) => staticData[k],
 *   currentContext: undefined,
 *   forceRefresh: false,
 *   requestCounter: 1,
 *   resolveParams,
 *   deps,
 *   storeCache,
 *   startTime: performance.now(),
 *   buildEntry,
 * });
 * ```
 */
export function tryLaunchSyncResolver<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(args: SyncResolutionLaunchArgs<TData, TContext, TPopoverKey>): boolean {
  const {
    key,
    controllerKey,
    parentData,
    activeResolver,
    currentContext,
    forceRefresh,
    requestCounter,
    resolveParams,
    deps,
    storeCache,
    startTime,
    buildEntry,
  } = args;

  if (!activeResolver) return false;
  if (!forceRefresh && deps.inFlightPromises.has(key)) return false;

  const launch = startInFlightResolver(
    key,
    controllerKey,
    parentData,
    activeResolver,
    currentContext,
    deps,
    resolveParams,
    buildEntry,
  );

  if (launch.isSync) {
    if (!resolveParams.isStale(requestCounter)) {
      handleResolverSuccess(
        launch.result,
        key,
        buildEntry(launch.result, null, false),
        resolveParams,
        deps,
        storeCache,
        startTime,
        'sync',
      );
    }
    return true;
  }
  return launch.hasError;
}
