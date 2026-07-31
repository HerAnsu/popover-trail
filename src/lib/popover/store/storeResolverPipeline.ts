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
} from '../types';
import {
  isPromise,
  toError,
  findEntryInStore,
  createTrailEntry,
  updateEntryInLists,
} from '../utils/storeHelpers';
import type { PopoverDAG } from '../utils/dag';

export interface ResolverPipelineDependencies<TData = unknown, TContext = unknown> {
  popoverDAG: PopoverDAG;
  cache?: PopoverCache<TData>;
  resolveData: PopoverResolver<TData, TContext>;
  initialContext?: TContext;
  inFlightPromises: Map<string, Promise<TData>>;
  registerController: (key: string) => AbortController;
  removeController: (key: string) => void;
  safeSet: (
    partial:
      | Partial<PopoverStore<TData, TContext>>
      | ((state: PopoverStore<TData, TContext>) => Partial<PopoverStore<TData, TContext>>),
  ) => void;
  findEntryByKey: (key: string) => TrailEntry<TData> | undefined;
}

/**
 * Resolves popover entry data asynchronously or synchronously and commits state patches to the store.
 */
export async function resolvePopoverEntry<TData = unknown, TContext = unknown>(
  get: StoreApi<PopoverStore<TData, TContext>>['getState'],
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  parentData: TData | undefined,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  controllerKey: string,
  incrementCounter: () => number,
  isStale: (counter: number) => boolean,
  insertStatePatch: (
    entry: TrailEntry<TData>,
  ) =>
    | Partial<PopoverStore<TData, TContext>>
    | ((state: PopoverStore<TData, TContext>) => Partial<PopoverStore<TData, TContext>>),
  deps: ResolverPipelineDependencies<TData, TContext>,
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
    data?: TData,
    error: Error | null = null,
    isLoading = false,
  ): TrailEntry<TData> =>
    createTrailEntry(key, parentKey, rect, options, existingEntry, data, error, isLoading);

  const updateEntryStateInLists = (patch: Partial<TrailEntry<TData>>) => {
    safeSet((state) => ({
      floating: state.floating.map((e) => (e.key === key ? { ...e, ...patch } : e)),
      trail: state.trail.map((e) => (e.key === key ? { ...e, ...patch } : e)),
    }));
  };

  const requestCounter = incrementCounter();

  if (cache || storeCache) {
    try {
      const cachedData = (cache || storeCache)?.get(key);
      const resolvedCachedData = isPromise(cachedData) ? await cachedData : cachedData;
      if (resolvedCachedData !== undefined) {
        if (isStale(requestCounter)) return;
        const cachedEntry = buildEntry(resolvedCachedData as TData, null, false);
        safeSet(insertStatePatch(cachedEntry));
        return;
      }
    } catch {
      // Ignore cache read failures
    }
  }

  const forceRefresh = (options as { forceRefresh?: boolean })?.forceRefresh;

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
      const res = (activeResolver as Function)(key, parentData, currentContext, controller.signal);
      if (isPromise(res)) {
        const promise = (async () => {
          try {
            return await res;
          } finally {
            inFlightPromises.delete(key);
            removeController(controllerKey);
          }
        })();
        inFlightPromises.set(key, promise as Promise<TData>);
      } else {
        rawSyncResult = res;
        isSync = true;
        removeController(controllerKey);
      }
    } catch {
      try {
        const res = (activeResolver as Function)({
          key,
          parentData,
          context: currentContext,
          signal: controller.signal,
        });
        if (isPromise(res)) {
          const promise = (async () => {
            try {
              return await res;
            } finally {
              inFlightPromises.delete(key);
              removeController(controllerKey);
            }
          })();
          inFlightPromises.set(key, promise as Promise<TData>);
        } else {
          rawSyncResult = res;
          isSync = true;
          removeController(controllerKey);
        }
      } catch (objErr) {
        removeController(controllerKey);
        const error = toError(objErr as never);
        const currentEntry = findEntryByKey(key);
        currentEntry?.onError?.(error, key);
        if (currentEntry) {
          updateEntryStateInLists({ status: 'error', isLoading: false, error });
        } else {
          const errorEntry = buildEntry(undefined, error, false);
          safeSet(insertStatePatch(errorEntry));
        }
        return;
      }
    }
  }

  if (isSync) {
    if (isStale(requestCounter)) return;
    const data = rawSyncResult as TData;
    (cache || storeCache)?.set(key, data as never);
    const successEntry = buildEntry(data, null, false);
    safeSet((state) => {
      const patchOrFn = insertStatePatch(successEntry);
      const computedPatch = typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;
      return findEntryInStore(state.floating, state.trail, key)
        ? updateEntryInLists(state.floating, state.trail, key, successEntry)
        : computedPatch;
    });
    return;
  }

  const inFlight = inFlightPromises.get(key);
  if (inFlight) {
    if (!existingEntry || (existingEntry as { status?: string }).status === 'idle') {
      const loadingEntry = buildEntry(undefined, null, true);
      safeSet(insertStatePatch(loadingEntry));
    }

    try {
      const data = await inFlight;
      if (isStale(requestCounter)) return;

      (cache || storeCache)?.set(key, data as never);
      const successEntry = buildEntry(data, null, false);
      safeSet((state) => {
        const patchOrFn = insertStatePatch(successEntry);
        const computedPatch = typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;
        return findEntryInStore(state.floating, state.trail, key)
          ? updateEntryInLists(state.floating, state.trail, key, successEntry)
          : computedPatch;
      });
    } catch (err) {
      if (isStale(requestCounter)) return;
      const error = toError(err as never);
      if (error.name === 'AbortError') return;

      const currentEntry = findEntryByKey(key);
      currentEntry?.onError?.(error, key);

      if (currentEntry) {
        updateEntryStateInLists({ status: 'error', isLoading: false, error });
      } else {
        const errorEntry = buildEntry(undefined, error, false);
        safeSet(insertStatePatch(errorEntry));
      }
    }
  }
}
