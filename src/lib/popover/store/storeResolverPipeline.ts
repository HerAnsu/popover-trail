/**
 * Store Data Resolution Pipeline for popover-trail.
 * Handles async data loading, caching, in-flight deduplication, positional/object resolver fallbacks, and state patch insertion.
 *
 * @module storeResolverPipeline
 */

import type { StoreApi } from 'zustand/vanilla';
import type {
  PopoverStore,
  PopoverResolver,
  TrailEntry,
  PopoverCache,
  OpenRootOptions,
  OpenNestedOptions,
  StatePatch,
  StoreState,
  PopoverStoreEvent,
} from '../types';
import {
  isPromise,
  toError,
  findEntryInStore,
  createTrailEntry,
  createLoadingEntry,
} from '../utils/storeHelpers';
import type { PopoverDAG } from '../utils/dag';
import { dispatchStoreEvent } from './eventBus';

export interface ResolverPipelineDependencies<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  popoverDAG: PopoverDAG;
  cache?: PopoverCache<TData>;
  resolveData: PopoverResolver<TData, TContext>;
  initialContext?: TContext;
  inFlightPromises: Map<string, Promise<TData>>;
  registerController: (key: string) => AbortController;
  removeController: (key: string) => void;
  safeSet: (
    partial:
      | StatePatch<TData, TContext, TPopoverKey>
      | ((
          state: StoreState<TData, TContext, TPopoverKey>,
        ) => StatePatch<TData, TContext, TPopoverKey>),
  ) => void;
  findEntryByKey: (key: string) => TrailEntry<TData> | undefined;
  eventListeners?: Set<(event: PopoverStoreEvent<TData>) => void>;
}

/**
 * Invokes a PopoverResolver handling both positional-arg and object-arg calling conventions.
 */
export function invokeResolverSafely<TData, TContext>(
  resolver: PopoverResolver<TData, TContext>,
  key: string,
  parentData: TData | null | undefined,
  context: TContext | undefined,
  signal: AbortSignal,
): TData | Promise<TData> {
  if (typeof resolver !== 'function') {
    throw new Error(
      `[popover-trail] invokeResolverSafely: resolver must be a function, received ${typeof resolver}.`,
    );
  }

  try {
    return (
      resolver as (
        k: string,
        pd?: TData | null,
        ctx?: TContext,
        sig?: AbortSignal,
      ) => TData | Promise<TData>
    )(key, parentData, context, signal);
  } catch {
    return (
      resolver as unknown as (args: {
        key: string;
        parentData?: TData | null;
        context?: TContext;
        signal?: AbortSignal;
      }) => TData | Promise<TData>
    )({
      key,
      parentData: parentData ?? undefined,
      context,
      signal,
    });
  }
}

export interface ResolvePopoverEntryParams<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  key: string;
  parentKey?: string;
  rect?: DOMRect | null;
  parentData?: TData | null;
  options?: OpenRootOptions & OpenNestedOptions;
  controllerKey: string;
  incrementCounter: () => number;
  isStale: (counter: number) => boolean;
  insertStatePatch: (
    entry: TrailEntry<TData>,
  ) =>
    | StatePatch<TData, TContext, TPopoverKey>
    | ((
        state: StoreState<TData, TContext, TPopoverKey>,
      ) => StatePatch<TData, TContext, TPopoverKey>);
}

function updateEntryInStoreLists<TData, TContext, TPopoverKey extends string>(
  safeSet: ResolverPipelineDependencies<TData, TContext, TPopoverKey>['safeSet'],
  key: string,
  patch: Partial<TrailEntry<TData>>,
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

function handleResolverError<TData, TContext, TPopoverKey extends string>(
  objErr: unknown,
  key: string,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
): void {
  const error = toError(objErr);
  if (error.name === 'AbortError') return;
  dispatchStoreEvent(deps.eventListeners, { type: 'resolve_error', key, error });
  const currentEntry = deps.findEntryByKey(key);
  try {
    (currentEntry?.onError as unknown as (err: Error, k?: string) => void)?.(error, key);
  } catch (cbErr) {
    console.error('[popover-trail]: Exception in onError callback:', cbErr);
  }
  updateEntryInStoreLists(deps.safeSet, key, {
    error,
    isLoading: false,
    status: 'error',
  });
}

function handleResolverSuccess<TData, TContext, TPopoverKey extends string>(
  data: TData,
  key: string,
  successEntry: TrailEntry<TData>,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  storeCache?: PopoverCache<TData>,
): void {
  const activeCache = storeCache || deps.cache;
  if (activeCache) {
    try {
      activeCache.set(key, data);
    } catch {
      // Ignore cache write errors
    }
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

function getSyncCachedData<TData>(
  activeCache: PopoverCache<TData> | undefined,
  key: string,
): TData | undefined {
  if (!activeCache) return undefined;
  try {
    const raw = activeCache.get(key);
    if (raw !== undefined && !isPromise(raw)) {
      return raw;
    }
  } catch {
    // Ignore cache read failures
  }
  return undefined;
}

function startInFlightResolver<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  key: string,
  controllerKey: string,
  parentData: unknown,
  activeResolver: PopoverResolver<TData, TContext>,
  currentContext: TContext,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
): { isSync: true; result: TData } | { isSync: false; hasError: boolean } {
  const { eventListeners, registerController, removeController, inFlightPromises } = deps;
  dispatchStoreEvent(eventListeners, { type: 'resolve_start', key });
  const controller = registerController(controllerKey);

  try {
    const res = invokeResolverSafely(
      activeResolver,
      key,
      parentData as TData | null | undefined,
      currentContext,
      controller.signal,
    );

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
  } catch (objErr) {
    removeController(controllerKey);
    handleResolverError(objErr, key, deps);
    return { isSync: false, hasError: true };
  }
}

async function awaitInFlightResolution<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  inFlight: Promise<TData>,
  key: string,
  requestCounter: number,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  storeCache: PopoverCache<TData> | undefined,
  buildEntry: (data?: TData | null, error?: Error | null, isLoading?: boolean) => TrailEntry<TData>,
): Promise<void> {
  try {
    const data = await inFlight;
    if (params.isStale(requestCounter)) return;
    handleResolverSuccess(data, key, buildEntry(data, null, false), params, deps, storeCache);
  } catch (err) {
    if (params.isStale(requestCounter)) return;
    handleResolverError(err, key, deps);
  }
}

function tryResolveFromCacheOrState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  cache: PopoverCache<TData> | undefined,
  storeCache: PopoverCache<TData> | null | undefined,
  existingEntry: TrailEntry<TData> | undefined,
  key: string,
  forceRefresh: boolean,
  requestCounter: number,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  safeSet: (
    patch: (
      state: PopoverStore<TData, TContext, TPopoverKey>,
    ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>,
  ) => void,
  buildEntry: (data?: TData | null, error?: Error | null, isLoading?: boolean) => TrailEntry<TData>,
): boolean {
  const effectiveCache = cache ?? storeCache ?? undefined;
  const cachedData = getSyncCachedData(effectiveCache, key);
  if (cachedData !== undefined) {
    if (!params.isStale(requestCounter)) {
      safeSet(
        params.insertStatePatch(buildEntry(cachedData, null, false)) as (
          state: PopoverStore<TData, TContext, TPopoverKey>,
        ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>,
      );
    }
    return true;
  }

  if (
    existingEntry &&
    existingEntry.status === 'success' &&
    existingEntry.data !== undefined &&
    !forceRefresh
  ) {
    if (!params.isStale(requestCounter)) {
      safeSet(
        params.insertStatePatch(buildEntry(existingEntry.data, null, false)) as (
          state: PopoverStore<TData, TContext, TPopoverKey>,
        ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>,
      );
    }
    return true;
  }

  return false;
}

function tryLaunchSyncResolver<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  key: string,
  controllerKey: string,
  parentData: unknown,
  activeResolver: PopoverResolver<TData, TContext> | undefined,
  currentContext: TContext,
  forceRefresh: boolean,
  requestCounter: number,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  storeCache: PopoverCache<TData> | null | undefined,
  buildEntry: (data?: TData | null, error?: Error | null, isLoading?: boolean) => TrailEntry<TData>,
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

/**
 * Resolves popover entry data asynchronously or synchronously and commits state patches to the store.
 *
 * Pipeline Lifecycle Phases:
 * 1. DAG Node Registration: Registers parent-child hierarchy in DAG kernel.
 * 2. Cache Inspection: Checks synchronous memory cache for instant resolution without triggering loading state.
 * 3. Reusable State Inspection: If already resolved and !forceRefresh, reuses existing resolved data.
 * 4. Sync Resolver Execution: Executes synchronous resolver directly without async macrotasks.
 * 5. Async Loading State Dispatch: Dispatches optimistic loading state and commits `dataPromise` for React 19 `use()`.
 * 6. In-Flight Await & Stale Race Guard: Awaits the pending promise and compares `requestCounter` to discard stale results.
 * 7. Success/Error State Commit: Emits store events and writes resolved data or error into the store.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param get - Zustand getState accessor.
 * @param params - Popover resolution parameters.
 * @param deps - Pipeline dependency injection container.
 */
export async function resolvePopoverEntry<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  get: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>['getState'],
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
): Promise<void> {
  const {
    key,
    parentKey,
    rect,
    parentData,
    options,
    controllerKey,
    incrementCounter,
    insertStatePatch,
  } = params;
  const { popoverDAG, cache, resolveData, initialContext, inFlightPromises, safeSet } = deps;

  // Phase 1: Register parent-child ancestry in DAG graph
  popoverDAG.addNode(key, parentKey);
  const { floating, trail, cache: storeCache } = get();
  const existingEntry = findEntryInStore(floating, trail, key);

  const buildEntry = (
    data?: TData | null,
    error: Error | null = null,
    isLoading = false,
  ): TrailEntry<TData> =>
    createTrailEntry(
      key,
      parentKey,
      rect ?? null,
      options,
      existingEntry,
      data ?? undefined,
      error,
      isLoading,
    );

  const requestCounter = incrementCounter();
  const forceRefresh = Boolean(options?.forceRefresh);

  // Phase 2 & 3: Check synchronous cache hits or reusable existing resolved state
  if (
    tryResolveFromCacheOrState(
      cache,
      storeCache,
      existingEntry,
      key,
      forceRefresh,
      requestCounter,
      params,
      safeSet,
      buildEntry,
    )
  ) {
    return;
  }

  // Phase 4: Launch resolver function (handles sync functions without async microtasks)
  const activeResolver = get().resolveData ?? resolveData;
  const currentContext = (get().context ?? initialContext) as TContext;

  const isResolvedOrErrored = tryLaunchSyncResolver(
    key,
    controllerKey,
    parentData,
    activeResolver,
    currentContext,
    forceRefresh,
    requestCounter,
    params,
    deps,
    storeCache,
    buildEntry,
  );
  if (isResolvedOrErrored) return;

  // Phase 5: Async path - insert optimistic loading state synchronously for UI responsiveness
  const inFlight = inFlightPromises.get(key);
  if (!inFlight) return;

  if (!existingEntry || existingEntry.status !== 'success' || forceRefresh) {
    const loadingEntry = createLoadingEntry(key, parentKey, rect ?? null, options, existingEntry);
    safeSet(insertStatePatch(loadingEntry));
  }

  // Phase 6 & 7: Await in-flight promise and commit result with stale request guard
  await awaitInFlightResolution(
    inFlight,
    key,
    requestCounter,
    params,
    deps,
    storeCache ?? undefined,
    buildEntry,
  );
}
