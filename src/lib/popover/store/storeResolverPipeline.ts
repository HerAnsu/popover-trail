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
} from '../types';
import { isPromise, toError, findEntryInStore, createTrailEntry } from '../utils/storeHelpers';
import type { PopoverDAG } from '../utils/dag';

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
}

export function invokeResolverSafely<TData, TContext>(
  resolver: PopoverResolver<TData, TContext>,
  key: string,
  parentData: TData | null | undefined,
  context: TContext | undefined,
  signal: AbortSignal,
): TData | Promise<TData> {
  if (typeof resolver === 'function') {
    try {
      const res = (
        resolver as (
          k: string,
          pd?: TData | null,
          ctx?: TContext,
          sig?: AbortSignal,
        ) => TData | Promise<TData>
      )(key, parentData, context, signal);
      if (res !== undefined) return res;
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
  return undefined as unknown as TData;
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
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  parentData: TData | null | undefined,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  controllerKey: string,
  incrementCounter: () => number,
  isStale: (counter: number) => boolean,
  insertStatePatch: (
    entry: TrailEntry<TData>,
  ) =>
    | StatePatch<TData, TContext, TPopoverKey>
    | ((
        state: StoreState<TData, TContext, TPopoverKey>,
      ) => StatePatch<TData, TContext, TPopoverKey>),
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
): Promise<void> {
  const {
    popoverDAG,
    cache,
    resolveData,
    initialContext,
    inFlightPromises,
    registerController,
    removeController,
    safeSet,
    findEntryByKey,
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

  const updateEntryStateInLists = (patch: Partial<TrailEntry<TData>>) => {
    safeSet((state) => {
      const floatingHasKey = state.floating.some((e) => e.key === key);
      const trailHasKey = state.trail.some((e) => e.key === key);
      if (!floatingHasKey && !trailHasKey) return {};
      return {
        floating: floatingHasKey
          ? state.floating.map((e) => (e.key === key ? { ...e, ...patch } : e))
          : state.floating,
        trail: trailHasKey
          ? state.trail.map((e) => (e.key === key ? { ...e, ...patch } : e))
          : state.trail,
      };
    });
  };

  const commitResolverError = (objErr: unknown) => {
    const error = toError(objErr);
    if (error.name === 'AbortError') return;
    const currentEntry = findEntryByKey(key);
    currentEntry?.onError?.(error, key);
    if (currentEntry) {
      updateEntryStateInLists({ status: 'error', isLoading: false, error });
    } else {
      const errorEntry = buildEntry(undefined, error, false);
      safeSet(insertStatePatch(errorEntry));
    }
  };

  const commitResolverSuccess = (data: TData) => {
    (cache || storeCache)?.set(key, data);
    const successEntry = buildEntry(data, null, false);
    safeSet((state) => {
      const patchOrFn = insertStatePatch(successEntry);
      const computedPatch = typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;
      return findEntryInStore(state.floating, state.trail, key)
        ? state.floating.some((e) => e.key === key)
          ? { floating: state.floating.map((e) => (e.key === key ? successEntry : e)) }
          : { trail: state.trail.map((e) => (e.key === key ? successEntry : e)) }
        : computedPatch;
    });
  };

  const requestCounter = incrementCounter();

  if (cache || storeCache) {
    try {
      const cachedData = (cache || storeCache)?.get(key);
      const resolvedCachedData = isPromise(cachedData) ? await cachedData : cachedData;
      if (resolvedCachedData !== undefined) {
        if (isStale(requestCounter)) return;
        const cachedEntry = buildEntry(resolvedCachedData, null, false);
        safeSet(insertStatePatch(cachedEntry));
        return;
      }
    } catch {
      // Ignore cache read failures
    }
  }

  const forceRefresh = options?.forceRefresh;

  if (
    existingEntry &&
    existingEntry.status === 'success' &&
    existingEntry.data !== undefined &&
    !forceRefresh
  ) {
    if (isStale(requestCounter)) return;
    const entryToReuse = buildEntry(existingEntry.data, null, false);
    safeSet(insertStatePatch(entryToReuse));
    return;
  }

  const activeResolver = get().resolveData ?? resolveData;

  let rawSyncResult: unknown;
  let isSync = false;
  const currentContext = get().context ?? initialContext;

  if (!inFlightPromises.has(key) || forceRefresh) {
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
      commitResolverError(objErr);
      return;
    }
  }

  if (isSync) {
    if (isStale(requestCounter)) return;
    commitResolverSuccess(rawSyncResult as TData);
    return;
  }

  const inFlight = inFlightPromises.get(key);
  if (inFlight) {
    if (!existingEntry || existingEntry.status !== 'success') {
      const loadingEntry = buildEntry(undefined, null, true);
      safeSet(insertStatePatch(loadingEntry));
    }

    try {
      const data = await inFlight;
      if (isStale(requestCounter)) return;
      commitResolverSuccess(data);
    } catch (err) {
      if (isStale(requestCounter)) return;
      commitResolverError(err);
    }
  }
}
