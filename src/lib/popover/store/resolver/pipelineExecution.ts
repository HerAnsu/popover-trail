/**
 * Pipeline Execution & In-Flight Resolution for popover-trail.
 * Manages invocation, async promise deduplication, AbortSignals, and error dispatching.
 *
 * @module store/resolver/pipelineExecution
 */

import type { PopoverResolver, ResolverParams, TrailEntry, PopoverCache } from '../../types';
import { isPromise, toError } from '../../utils/storeHelpers';
import { isOk, isErr, wrapResult, wrapAsyncResult } from '../../utils/result';
import { PopoverErrorCode, createPopoverError } from '../../utils/errors';
import { dispatchStoreEvent } from '../eventBus';
import type {
  ResolverPipelineDependencies,
  ResolvePopoverEntryParams,
  AnyResolverFn,
} from './resolverTypes';

/**
 * Checks if a caught error was caused by calling an object-destructuring function positionally.
 */
function isDestructuringSignatureMismatch(err: unknown): boolean {
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('destructure') ||
      msg.includes('cannot destructure property') ||
      (msg.includes('cannot read property') &&
        (msg.includes('of undefined') || msg.includes('of null'))) ||
      msg.includes('cannot read properties of undefined') ||
      msg.includes('cannot read properties of null') ||
      msg.includes('expected object')
    );
  }
  return false;
}

/**
 * Safely invokes a `PopoverResolver` supporting both positional-argument `(key, parentData, context, signal)`
 * and object-argument `({ key, parentData, context, signal })` calling conventions.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @param resolver - Target resolver function.
 * @param key - Popover key being resolved.
 * @param parentData - Resolved data payload from the parent popover (if nested).
 * @param context - Global context object.
 * @param signal - AbortSignal for request cancellation.
 * @returns Data payload or Promise resolving to data.
 * @throws {PopoverError} If resolver is not a valid function or fails to resolve.
 */
export function invokeResolverSafely<TData, TContext>(
  resolver: AnyResolverFn<TData, TContext>,
  key: string,
  parentData: TData | null | undefined,
  context: TContext | undefined,
  signal: AbortSignal,
): TData | Promise<TData> {
  if (typeof resolver !== 'function') {
    throw createPopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      `invokeResolverSafely: resolver must be a function, received ${typeof resolver}.`,
      'Provide a valid resolver callback function to PopoverProvider or schema.',
    );
  }

  const positionalFn = resolver as PopoverResolver<TData, TContext>;
  const positionalAttempt = wrapResult(() =>
    positionalFn(key, parentData ?? undefined, context, signal),
  );

  if (isOk(positionalAttempt)) {
    return positionalAttempt.data;
  }

  const rawError = positionalAttempt.error.cause;
  if (isDestructuringSignatureMismatch(rawError)) {
    const objectFn = resolver as (
      params: ResolverParams<TData, TContext>,
    ) => Promise<TData> | TData;
    const objectAttempt = wrapResult(() =>
      objectFn({
        key,
        parentData: parentData ?? undefined,
        context,
        signal,
      }),
    );

    if (isOk(objectAttempt)) {
      return objectAttempt.data;
    }

    throw objectAttempt.error.cause ?? objectAttempt.error;
  }

  throw rawError ?? positionalAttempt.error;
}

export function updateEntryInStoreLists<TData, TContext, TPopoverKey extends string>(
  safeSet: ResolverPipelineDependencies<TData, TContext, TPopoverKey>['safeSet'],
  key: TPopoverKey,
  patch: Partial<TrailEntry<TData, TPopoverKey>>,
): void {
  safeSet((state) => {
    const inFloating = state.floating.some((e) => e.key === key);
    const inTrail = state.trail.some((e) => e.key === key);
    if (!inFloating && !inTrail) return {};

    const nextFloating = inFloating
      ? state.floating.map((e) => (e.key === key ? { ...e, ...patch } : e))
      : state.floating;
    const nextTrail = inTrail
      ? state.trail.map((e) => (e.key === key ? { ...e, ...patch } : e))
      : state.trail;

    return { floating: nextFloating, trail: nextTrail };
  });
}

export function handleResolverError<TData, TContext, TPopoverKey extends string>(
  objErr: unknown,
  key: TPopoverKey,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  errorEntry?: TrailEntry<TData, TPopoverKey>,
): void {
  const error = toError(objErr);
  if (error.name === 'AbortError') return;

  dispatchStoreEvent(deps.eventListeners, { type: 'resolve_error', key, error }, deps.eventBus);
  const currentEntry = deps.findEntryByKey(key);

  if (currentEntry?.onError) {
    const onErrorResult = wrapResult(() => {
      currentEntry.onError?.(error, key as TPopoverKey);
    });
    if (isErr(onErrorResult)) {
      console.error('[popover-trail]: Exception in onError callback:', onErrorResult.error);
    }
  }

  deps.safeSet((state) => {
    const inFloating = state.floating.some((e) => e.key === key);
    const inTrail = state.trail.some((e) => e.key === key);

    if (inFloating || inTrail) {
      const update = (e: TrailEntry<TData, TPopoverKey>) =>
        e.key === key ? { ...e, error, isLoading: false, status: 'error' as const } : e;
      return {
        floating: inFloating ? state.floating.map(update) : state.floating,
        trail: inTrail ? state.trail.map(update) : state.trail,
      };
    }

    if (params && errorEntry) {
      const patchOrFn = params.insertStatePatch(errorEntry);
      return typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;
    }

    return {};
  });
}

export function handleResolverSuccess<TData, TContext, TPopoverKey extends string>(
  data: TData,
  key: TPopoverKey,
  successEntry: TrailEntry<TData, TPopoverKey>,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  storeCache?: PopoverCache<TData>,
): void {
  const activeCache = storeCache || deps.cache;
  if (activeCache) {
    wrapResult(() => activeCache.set(key, data));
  }

  dispatchStoreEvent(deps.eventListeners, { type: 'resolve_success', key, data }, deps.eventBus);

  deps.safeSet((state) => {
    // Single membership scan; the caller's insert patch is computed lazily
    // and only when the entry actually vanished mid-flight.
    if (state.floating.some((e) => e.key === key)) {
      return { floating: state.floating.map((e) => (e.key === key ? successEntry : e)) };
    }
    if (state.trail.some((e) => e.key === key)) {
      return { trail: state.trail.map((e) => (e.key === key ? successEntry : e)) };
    }

    const patchOrFn = params.insertStatePatch(successEntry);
    return typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;
  });
}

export function startInFlightResolver<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  key: TPopoverKey,
  controllerKey: string,
  parentData: unknown,
  activeResolver: PopoverResolver<TData, TContext>,
  currentContext: TContext,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  buildEntry?: (
    data?: TData | null,
    error?: Error | null,
    isLoading?: boolean,
  ) => TrailEntry<TData, TPopoverKey>,
): { isSync: true; result: TData } | { isSync: false; hasError: boolean } {
  const { eventListeners, registerController, removeController, inFlightPromises, eventBus } = deps;
  dispatchStoreEvent(eventListeners, { type: 'resolve_start', key }, eventBus);
  const controller = registerController(controllerKey);

  const resolveAttempt = wrapResult(() =>
    invokeResolverSafely(
      activeResolver,
      key,
      parentData as TData | null | undefined,
      currentContext,
      controller.signal,
    ),
  );

  if (isErr(resolveAttempt)) {
    removeController(controllerKey, controller);
    const error = toError(resolveAttempt.error.cause ?? resolveAttempt.error);
    const errorEntry = buildEntry ? buildEntry(null, error, false) : undefined;
    handleResolverError(error, key, deps, params, errorEntry);
    return { isSync: false, hasError: true };
  }

  const res = resolveAttempt.data;

  if (isPromise(res)) {
    // Holder indirection lets the cleanup closure compare its own registered
    // promise against the map without a definite-assignment self-reference.
    const tracked: { promise?: Promise<TData> } = {};
    tracked.promise = (async () => {
      try {
        return (await res) as TData;
      } finally {
        // Identity guard: a newer resolution may have replaced this entry.
        if (tracked.promise && inFlightPromises.get(key) === tracked.promise) {
          inFlightPromises.delete(key);
        }
        removeController(controllerKey, controller);
      }
    })();
    inFlightPromises.set(key, tracked.promise);
    return { isSync: false, hasError: false };
  }

  removeController(controllerKey, controller);
  return { isSync: true, result: res as TData };
}

export async function awaitInFlightResolution<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  inFlight: Promise<TData>,
  key: TPopoverKey,
  requestCounter: number,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  storeCache: PopoverCache<TData> | undefined,
  buildEntry: (
    data?: TData | null,
    error?: Error | null,
    isLoading?: boolean,
  ) => TrailEntry<TData, TPopoverKey>,
): Promise<void> {
  const asyncResult = await wrapAsyncResult(inFlight);

  if (params.isStale(requestCounter)) return;

  if (isOk(asyncResult)) {
    handleResolverSuccess(
      asyncResult.data,
      key,
      buildEntry(asyncResult.data, null, false),
      params,
      deps,
      storeCache,
    );
  } else {
    const error = toError(asyncResult.error.cause ?? asyncResult.error);
    const errorEntry = buildEntry(null, error, false);
    handleResolverError(error, key, deps, params, errorEntry);
  }
}

export function tryLaunchSyncResolver<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  key: TPopoverKey,
  controllerKey: string,
  parentData: unknown,
  activeResolver: PopoverResolver<TData, TContext> | undefined,
  currentContext: TContext,
  forceRefresh: boolean,
  requestCounter: number,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  storeCache: PopoverCache<TData> | null | undefined,
  buildEntry: (
    data?: TData | null,
    error?: Error | null,
    isLoading?: boolean,
  ) => TrailEntry<TData, TPopoverKey>,
): boolean {
  if (!activeResolver) return false;
  if (deps.inFlightPromises.has(key) && !forceRefresh) return false;

  const launch = startInFlightResolver(
    key,
    controllerKey,
    parentData,
    activeResolver,
    currentContext,
    deps,
    params,
    buildEntry,
  );

  if (launch.isSync) {
    if (!params.isStale(requestCounter)) {
      handleResolverSuccess(
        launch.result,
        key,
        buildEntry(launch.result, null, false),
        params,
        deps,
        storeCache ?? undefined,
      );
    }
    return true;
  }
  return launch.hasError;
}
