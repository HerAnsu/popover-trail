/**
 * In-Flight Resolution Launcher.
 *
 * @module store/resolver/inFlightLauncher
 */

import type { PopoverResolver, TrailEntry } from '../../types';
import { isPromise } from '../../utils/storeHelpers';
import { dispatchStoreEvent } from '../eventBus';
import { invokeResolverSafely } from './resolverArity';
import { handleResolverError } from './resolverResultHandler';
import { executeTrackedInFlight } from './inFlightRunner';
import type {
  ResolverPipelineDependencies,
  ResolvePopoverEntryParams,
  ResolverLaunchResult,
} from './resolverTypes';

function handleLaunchError<TData, TContext, TPopoverKey extends string>(
  error: unknown,
  key: TPopoverKey,
  controllerKey: string,
  controller: AbortController,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
): ResolverLaunchResult<TData> {
  deps.removeController(controllerKey, controller);
  handleResolverError(error, key, deps, params);
  return { isSync: false, hasError: true };
}

/**
 * Initiates an in-flight resolution tracking its AbortController and handling sync/async branches.
 *
 * Dispatches a `resolve_start` event, registers an AbortController, and invokes the resolver safely.
 * If the resolver returns synchronously, the controller is cleaned up immediately and the result is returned.
 * If the resolver returns a Promise, the task is tracked in `inFlightPromises` until settlement.
 *
 * @template TData - Data type returned by the resolver.
 * @template TContext - Context passed to the resolver.
 * @template TPopoverKey - Popover key identifier type.
 * @param key - Popover key undergoing resolution.
 * @param controllerKey - Key to track the AbortController under.
 * @param parentData - Parent popover data if chained in a cascade.
 * @param activeResolver - Resolver callback function.
 * @param currentContext - Ambient context value.
 * @param deps - Pipeline dependencies (controllers, listeners, bus).
 * @param params - Optional single entry resolution parameters.
 * @param _buildEntry - Optional builder function to create a new TrailEntry.
 * @returns ResolverLaunchResult indicating if resolution resolved synchronously, asynchronously, or with error.
 *
 * @example
 * ```typescript
 * const result = startInFlightResolver(key, ctrlKey, parentData, resolver, ctx, deps);
 * if (result.isSync) {
 *   console.log('Resolved synchronously:', result.result);
 * }
 * ```
 */
export function startInFlightResolver<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  key: TPopoverKey,
  controllerKey: string,
  parentData: TData | null | undefined,
  activeResolver: PopoverResolver<TData, TContext>,
  currentContext: TContext | undefined,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  _buildEntry?: (
    data?: TData | null,
    error?: Error | null,
    isLoading?: boolean,
  ) => TrailEntry<TData, TPopoverKey>,
): ResolverLaunchResult<TData> {
  const { eventListeners, registerController, removeController, inFlightPromises, eventBus } = deps;
  dispatchStoreEvent(eventListeners, { type: 'resolve_start', key }, eventBus);
  const controller = registerController(controllerKey);
  const cleanup = () => removeController(controllerKey, controller);

  try {
    const res = invokeResolverSafely(
      activeResolver,
      key,
      parentData,
      currentContext,
      controller.signal,
    );

    if (isPromise(res)) {
      void executeTrackedInFlight(inFlightPromises, key, async () => {
        try {
          return await res;
        } finally {
          cleanup();
        }
      });
      return { isSync: false, hasError: false };
    }

    cleanup();
    return { isSync: true, result: res };
  } catch (error) {
    return handleLaunchError(error, key, controllerKey, controller, deps, params);
  }
}
