/**
 * Data Resolver Domain Action Slice for popover-trail.
 * Encapsulates async/sync data resolution actions (openRootWithResolver, openNestedWithResolver, retryPopover, prefetchPopover, invalidate).
 *
 * @module sliceResolver
 */

import type {
  OpenRootOptions,
  OpenNestedOptions,
  AnchorEventLike,
  TrailEntry,
  PopoverStateData,
  StatePatch,
} from '../../types';
import {
  findEntryInStore,
  findEntryIndex,
  openRootState,
  pushNestedState,
} from '../../utils/storeHelpers';
import { selectEntryByKey } from '../storeSelectors';
import { invokeResolverSafely, type ResolvePopoverEntryParams } from '../storeResolverPipeline';
import { extractDisplayOptions } from '../../utils/displayOptions';
import type { SliceContext } from './sliceContext';

function stopEventPropagation(event?: AnchorEventLike): void {
  if (event && 'stopPropagation' in event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
}

function hasBoundingClientRect(
  target: unknown,
): target is { getBoundingClientRect: () => DOMRect } {
  return (
    typeof target === 'object' &&
    target !== null &&
    'getBoundingClientRect' in target &&
    typeof target.getBoundingClientRect === 'function'
  );
}

function resolveTriggerBoundingRect(
  anchorEvent?: AnchorEventLike,
  optionsRect?: DOMRect | null,
): DOMRect | null {
  if (optionsRect) return optionsRect;
  const target = anchorEvent && 'currentTarget' in anchorEvent ? anchorEvent.currentTarget : null;
  if (hasBoundingClientRect(target)) {
    return target.getBoundingClientRect();
  }
  return null;
}

function notifyEntryOpen<TData, TPopoverKey extends string>(
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined,
  key: TPopoverKey,
): void {
  const entry = findEntryByKey(key);
  if (entry?.onOpen) {
    entry.onOpen(entry);
  }
}

function createEntryUpdatePatch<TData, TContext, TPopoverKey extends string>(
  key: TPopoverKey,
  updatedEntry: TrailEntry<TData, TPopoverKey>,
) {
  return (
    state: PopoverStateData<TData, TContext, TPopoverKey>,
  ): StatePatch<TData, TContext, TPopoverKey> =>
    findEntryInStore(state.floating, state.trail, key)
      ? {
          floating: state.floating.map((e) => (e.key === key ? updatedEntry : e)),
          trail: state.trail.map((e) => (e.key === key ? updatedEntry : e)),
        }
      : {};
}

function isRootAlreadyActive<TData, TPopoverKey extends string>(
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  currentOwnerId: string | null | undefined,
  finalOwnerId: string,
  key: TPopoverKey,
  forceRefresh?: boolean,
): boolean {
  if (forceRefresh || trail.length === 0) return false;
  const root = trail[0];
  return (
    root?.key === key && root?.transitionStatus !== 'unmounting' && currentOwnerId === finalOwnerId
  );
}

function isNestedAlreadyActive<TData, TPopoverKey extends string>(
  existingEntry: TrailEntry<TData, TPopoverKey> | undefined,
  sourceKey: TPopoverKey,
  forceRefresh?: boolean,
): boolean {
  if (!existingEntry || forceRefresh) return false;
  if (existingEntry.transitionStatus === 'unmounting') return false;
  return existingEntry.parentKey === sourceKey || existingEntry.originalParentKey === sourceKey;
}

function buildRetryPipelineParams<TData, TContext, TPopoverKey extends string = string>(
  key: TPopoverKey,
  entry: TrailEntry<TData, TPopoverKey>,
  effectiveParentKey: TPopoverKey | undefined,
  parentData: TData | null | undefined,
  deps: SliceContext<TData, TContext, TPopoverKey>['deps'],
): ResolvePopoverEntryParams<TData, TContext, TPopoverKey> {
  const options = extractDisplayOptions(entry);
  const updateStateForEntry = (updated: TrailEntry<TData, TPopoverKey>) =>
    createEntryUpdatePatch<TData, TContext, TPopoverKey>(key, updated);

  if (effectiveParentKey) {
    return {
      key,
      parentKey: effectiveParentKey,
      rect: entry.rect ?? null,
      parentData: parentData ?? undefined,
      options,
      controllerKey: key,
      incrementCounter: () => deps.incrementNestedCounter(effectiveParentKey),
      isStale: (startedCounter: number) => deps.isNestedStale(effectiveParentKey, startedCounter),
      insertStatePatch: updateStateForEntry,
    };
  }

  return {
    key,
    parentKey: undefined,
    rect: entry.rect ?? null,
    parentData: undefined,
    options,
    controllerKey: '__root__',
    incrementCounter: deps.incrementRootCounter,
    isStale: deps.isRootStale,
    insertStatePatch: updateStateForEntry,
  };
}

/**
 * Factory creating async/sync data resolution actions.
 */
export function createResolverSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const {
    activeControllers,
    incrementRootCounter,
    isRootStale,
    incrementNestedCounter,
    isNestedStale,
    findEntryByKey,
    resolvePopoverEntry,
    cache,
  } = deps;

  const bringToFront = (key: TPopoverKey) => {
    set((state) => {
      const entry = selectEntryByKey<TData, TPopoverKey>(key)(state);
      if (entry?.transitionStatus === 'unmounting') return {};
      return { zIndexOrder: [...state.zIndexOrder.filter((k) => k !== key), key] };
    });
  };

  const slice = {
    openRootWithResolver: async (
      keyOrName: TPopoverKey,
      anchorEvent?: AnchorEventLike,
      options?: Readonly<OpenRootOptions>,
    ) => {
      stopEventPropagation(anchorEvent);
      const { ownerId, trail } = get();
      const finalOwnerId = options?.ownerId ?? ownerId ?? 'default';

      if (isRootAlreadyActive(trail, ownerId, finalOwnerId, keyOrName, options?.forceRefresh)) {
        bringToFront(keyOrName);
        return;
      }

      const triggerRect = resolveTriggerBoundingRect(anchorEvent, options?.triggerRect);

      await resolvePopoverEntry({
        key: keyOrName,
        parentKey: undefined,
        rect: triggerRect,
        parentData: undefined,
        options,
        controllerKey: '__root__',
        incrementCounter: incrementRootCounter,
        isStale: isRootStale,
        insertStatePatch: (entry: TrailEntry<TData, TPopoverKey>) => (state) =>
          openRootState(state, finalOwnerId, entry),
      });

      notifyEntryOpen<TData, TPopoverKey>(findEntryByKey, keyOrName);
    },

    openNestedWithResolver: async (
      keyOrName: TPopoverKey,
      sourceKey: TPopoverKey,
      options?: Readonly<OpenNestedOptions>,
    ) => {
      const { floating, trail } = get();
      const sourceIndex = findEntryIndex(floating, trail, sourceKey);
      if (sourceIndex === -1) return;

      const existingEntry = findEntryInStore(floating, trail, keyOrName);
      if (isNestedAlreadyActive(existingEntry, sourceKey, options?.forceRefresh)) {
        bringToFront(keyOrName);
        return;
      }

      const sourceEntry = findEntryInStore(floating, trail, sourceKey);
      if (!sourceEntry || sourceEntry.transitionStatus === 'unmounting') return;

      const rect = options?.triggerRect ?? sourceEntry.rect;

      await resolvePopoverEntry({
        key: keyOrName,
        parentKey: sourceKey,
        rect: rect ?? null,
        parentData: sourceEntry.data,
        options,
        controllerKey: keyOrName,
        incrementCounter: () => incrementNestedCounter(sourceKey),
        isStale: (startedCounter) => isNestedStale(sourceKey, startedCounter),
        insertStatePatch: (entry: TrailEntry<TData, TPopoverKey>) => (state) =>
          pushNestedState(state, sourceIndex, entry),
      });

      notifyEntryOpen<TData, TPopoverKey>(findEntryByKey, keyOrName);
    },

    retryPopover: async (key: TPopoverKey) => {
      const { floating, trail } = get();
      const entry = findEntryInStore(floating, trail, key);
      if (!entry || entry.isLoading) return;

      const index = findEntryIndex(floating, trail, key);
      if (index === -1) return;

      const effectiveParentKey = entry.parentKey ?? entry.originalParentKey;
      const parentData = effectiveParentKey
        ? findEntryInStore(floating, trail, effectiveParentKey)?.data
        : undefined;

      const params = buildRetryPipelineParams<TData, TContext, TPopoverKey>(
        key,
        entry,
        effectiveParentKey,
        parentData,
        deps,
      );
      await resolvePopoverEntry(params);
    },

    prefetchPopover: async (key: TPopoverKey, parentData?: TData) => {
      const cached = cache?.get(key);
      if (cached !== undefined) return cached;

      let controller = activeControllers.get(key);
      if (!controller) {
        controller = new AbortController();
        activeControllers.set(key, controller);
      }

      try {
        const resolveData = get().resolveData;
        const activeCtx = get().context ?? undefined;
        const res = await invokeResolverSafely(
          resolveData,
          key,
          parentData,
          activeCtx,
          controller.signal,
        );
        cache?.set(key, res);
        return res;
      } finally {
        activeControllers.delete(key);
      }
    },

    /**
     * Atomically invalidates one or more popover keys in a single batched pass.
     */
    invalidate: async (keyOrKeys: TPopoverKey | readonly TPopoverKey[]): Promise<void> => {
      const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
      if (keys.length === 0) return;

      const fetchPromises: Promise<void>[] = [];

      get().actions.batchUpdates(() => {
        for (const key of keys) {
          if (!key) continue;

          cache?.delete(key);

          const { floating, trail } = get();
          const activeEntry = findEntryInStore(floating, trail, key);

          if (activeEntry) {
            const inFlightCtrl = activeControllers.get(key);
            if (inFlightCtrl && activeEntry.isLoading) {
              inFlightCtrl.abort();
              activeControllers.delete(key);
            }

            fetchPromises.push(slice.retryPopover(key));
          }
        }
      });

      await Promise.all(fetchPromises);
    },
  };

  return slice;
}
