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
import { isPromise, toError, findEntryInStore, createTrailEntry } from '../utils/storeHelpers';
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

/**
 * Resolves popover entry data asynchronously or synchronously and commits state patches to the store.
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
    isStale,
    insertStatePatch,
  } = params;
  const {
    popoverDAG,
    cache,
    resolveData,
    initialContext,
    inFlightPromises,
    registerController,
    removeController,
    safeSet,
  } = deps;

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
      rect,
      options,
      existingEntry,
      data ?? undefined,
      error,
      isLoading,
    );

  const requestCounter = incrementCounter();

  // 1. Check synchronous cache hits
  const activeCache = cache || storeCache;
  if (activeCache) {
    try {
      const rawCached = activeCache.get(key);
      if (rawCached !== undefined && !isPromise(rawCached)) {
        if (!isStale(requestCounter)) {
          safeSet(insertStatePatch(buildEntry(rawCached, null, false)));
        }
        return;
      }
    } catch {
      // Ignore cache read failures
    }
  }

  // 2. Reuse existing success entry if not force-refreshing
  const forceRefresh = Boolean(options?.forceRefresh);
  if (
    existingEntry &&
    existingEntry.status === 'success' &&
    existingEntry.data !== undefined &&
    !forceRefresh
  ) {
    if (!isStale(requestCounter)) {
      safeSet(insertStatePatch(buildEntry(existingEntry.data, null, false)));
    }
    return;
  }

  // 3. Launch resolver function (sync or async)
  const activeResolver = get().resolveData ?? resolveData;
  const currentContext = get().context ?? initialContext;

  let rawSyncResult: unknown;
  let isSync = false;

  if (!inFlightPromises.has(key) || forceRefresh) {
    dispatchStoreEvent(deps.eventListeners, { type: 'resolve_start', key });
    const controller = registerController(controllerKey);
    try {
      const res = invokeResolverSafely(
        activeResolver,
        key,
        parentData,
        currentContext,
        controller.signal,
      );
      if (isPromise(res)) {
        const promise: Promise<TData> = (async () => {
          try {
            return await res;
          } finally {
            inFlightPromises.delete(key);
            removeController(controllerKey);
          }
        })();
        inFlightPromises.set(key, promise);
      } else {
        rawSyncResult = res;
        isSync = true;
        removeController(controllerKey);
      }
    } catch (objErr) {
      removeController(controllerKey);
      handleResolverError(objErr, key, deps);
      return;
    }
  }

  if (isSync) {
    if (isStale(requestCounter)) return;
    handleResolverSuccess(
      rawSyncResult as TData,
      key,
      buildEntry(rawSyncResult as TData, null, false),
      params,
      deps,
      storeCache,
    );
    return;
  }

  // 4. Async path: insert loading state synchronously, then await in-flight promise
  const inFlight = inFlightPromises.get(key);
  if (inFlight) {
    if (!existingEntry || existingEntry.status !== 'success' || forceRefresh) {
      safeSet(insertStatePatch(buildEntry(existingEntry?.data, null, true)));
    }

    try {
      const data = await inFlight;
      if (isStale(requestCounter)) return;
      handleResolverSuccess(data, key, buildEntry(data, null, false), params, deps, storeCache);
    } catch (err) {
      if (isStale(requestCounter)) return;
      handleResolverError(err, key, deps);
    }
  }
}
