/**
 * Pipeline Execution & In-Flight Resolution for popover-trail.
 * Manages invocation, async promise deduplication, AbortSignals, and error dispatching.
 *
 * @module store/resolver/pipelineExecution
 */

import type { PopoverResolver, ResolverParams, TrailEntry, PopoverCache } from '../../types';
import { isPromise, toError, findEntryInStore } from '../../utils/storeHelpers';
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
      msg.includes('cannot read property') ||
      msg.includes('cannot read properties') ||
      msg.includes('expected object') ||
      msg.includes('undefined') ||
      msg.includes('null')
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
): void {
  const error = toError(objErr);
  if (error.name === 'AbortError') return;

  dispatchStoreEvent(deps.eventListeners, { type: 'resolve_error', key, error });
  const currentEntry = deps.findEntryByKey(key);

  if (currentEntry?.onError) {
    const onErrorResult = wrapResult(() => {
      currentEntry.onError?.(error, key as TPopoverKey);
    });
    if (isErr(onErrorResult)) {
      console.error('[popover-trail]: Exception in onError callback:', onErrorResult.error);
    }
  }

  updateEntryInStoreLists(deps.safeSet, key, {
    error,
    isLoading: false,
    status: 'error',
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

  dispatchStoreEvent(deps.eventListeners, { type: 'resolve_success', key, data });

  deps.safeSet((state) => {
    const patchOrFn = params.insertStatePatch(successEntry);
    const computedPatch = typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;

    return findEntryInStore(state.floating, state.trail, key)
      ? state.floating.some((e) => e.key === key)
        ? { floating: state.floating.map((e) => (e.key === key ? successEntry : e)) }
        : { trail: state.trail.map((e) => (e.key === key ? successEntry : e)) }
      : computedPatch;
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
): { isSync: true; result: TData } | { isSync: false; hasError: boolean } {
  const { eventListeners, registerController, removeController, inFlightPromises } = deps;
  dispatchStoreEvent(eventListeners, { type: 'resolve_start', key });
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
    removeController(controllerKey);
    handleResolverError(resolveAttempt.error.cause ?? resolveAttempt.error, key, deps);
    return { isSync: false, hasError: true };
  }

  const res = resolveAttempt.data;

  if (isPromise(res)) {
    const promise: Promise<TData> = (async () => {
      try {
        return (await res) as TData;
      } finally {
        inFlightPromises.delete(key);
        removeController(controllerKey);
      }
    })();
    inFlightPromises.set(key, promise);
    return { isSync: false, hasError: false };
  }

  removeController(controllerKey);
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
    handleResolverError(asyncResult.error.cause ?? asyncResult.error, key, deps);
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
