/**
 * Synchronous Resolver Execution and Fast-Path Dispatcher.
 *
 * @module store/resolver/syncResolver
 */

import { handleResolverSuccess } from './resolverResultHandler';
import { startInFlightResolver } from './inFlightLauncher';
import type { SyncResolutionLaunchArgs } from './resolverTypes';

/**
 * Attempts synchronous resolver execution; commits on success or returns status.
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
