/**
 * Data Resolver Domain Action Slice for popover-trail.
 * Encapsulates async/sync data resolution actions (openRootWithResolver, openNestedWithResolver, retryPopover, prefetchPopover).
 *
 * @module sliceResolver
 */

import type {
  OpenRootOptions,
  OpenNestedOptions,
  AnchorEventLike,
  TrailEntry,
  PopoverStateData,
} from '../../types';
import {
  findEntryInStore,
  findEntryIndex,
  openRootState,
  pushNestedState,
} from '../../utils/storeHelpers';
import { selectEntryByKey } from '../storeSelectors';
import { invokeResolverSafely } from '../storeResolverPipeline';
import type { SliceContext } from './sliceContext';

/**
 * Extracts display/layout options from an existing TrailEntry to reconstruct
 * the original options object for re-resolution (e.g. retry).
 * Keeps `retryPopover` free of repetitive field-by-field copy.
 */
function extractEntryOptions<TData>(entry: TrailEntry<TData>): OpenRootOptions & OpenNestedOptions {
  return {
    collision: entry.collision,
    hover: entry.hover,
    ariaDescribedby: entry.ariaDescribedby,
    allowDragWhenUnpinned: entry.allowDragWhenUnpinned,
    allowDragWhenPinned: entry.allowDragWhenPinned,
    placement: entry.placement,
    offset: entry.offset,
    exitTransitionDuration: entry.exitTransitionDuration,
    baseZIndex: entry.baseZIndex,
    cascadeOffsetStep: entry.cascadeOffsetStep,
    cascadeOffsetDirection: entry.cascadeOffsetDirection,
    enableTilt: entry.enableTilt,
    maxTiltAngle: entry.maxTiltAngle,
    tiltSensitivity: entry.tiltSensitivity,
    dragAxis: entry.dragAxis,
    tiltFriction: entry.tiltFriction,
    tiltDecay: entry.tiltDecay,
    mountingClassName: entry.mountingClassName,
    unmountingClassName: entry.unmountingClassName,
    mountedClassName: entry.mountedClassName,
    stackGroup: entry.stackGroup,
    layoutStrategy: entry.layoutStrategy,
    keyboardShortcuts: entry.keyboardShortcuts,
    focusLockOptions: entry.focusLockOptions,
    buttonControls: entry.buttonControls,
    responsiveMode: entry.responsiveMode,
  };
}

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

  const bringToFront = (key: string) => {
    set((state) => {
      const entry = selectEntryByKey<TData>(key)(state);
      if (entry?.transitionStatus === 'unmounting') return {};
      return { zIndexOrder: [...state.zIndexOrder.filter((k) => k !== key), key] };
    });
  };

  return {
    openRootWithResolver: async (
      keyOrName: string,
      anchorEvent?: AnchorEventLike,
      options?: Readonly<OpenRootOptions>,
    ) => {
      if (
        anchorEvent &&
        'stopPropagation' in anchorEvent &&
        typeof anchorEvent.stopPropagation === 'function'
      ) {
        anchorEvent.stopPropagation();
      }
      const { ownerId, trail } = get();
      const finalOwnerId = options?.ownerId ?? ownerId ?? 'default';

      if (
        !options?.forceRefresh &&
        trail.length > 0 &&
        trail[0]?.key === keyOrName &&
        trail[0]?.transitionStatus !== 'unmounting' &&
        get().ownerId === finalOwnerId
      ) {
        bringToFront(keyOrName);
        return;
      }

      const target =
        anchorEvent && 'currentTarget' in anchorEvent ? anchorEvent.currentTarget : null;
      const triggerEl =
        target &&
        typeof target === 'object' &&
        'getBoundingClientRect' in target &&
        typeof target.getBoundingClientRect === 'function'
          ? (target as Element)
          : null;
      const optRect = options?.triggerRect;
      const triggerRect = optRect ?? triggerEl?.getBoundingClientRect() ?? null;

      await resolvePopoverEntry({
        key: keyOrName,
        parentKey: undefined,
        rect: triggerRect,
        parentData: undefined,
        options,
        controllerKey: '__root__',
        incrementCounter: incrementRootCounter,
        isStale: isRootStale,
        insertStatePatch: (entry) => (state) => openRootState(state, finalOwnerId, entry),
      });

      const entry = findEntryByKey(keyOrName);
      if (entry?.onOpen) {
        entry.onOpen(entry);
      }
    },

    openNestedWithResolver: async (
      keyOrName: string,
      sourceKey: string,
      options?: Readonly<OpenNestedOptions>,
    ) => {
      const { floating, trail } = get();
      const sourceIndex = findEntryIndex(floating, trail, sourceKey);
      if (sourceIndex === -1) return;

      const existingEntry = findEntryInStore(floating, trail, keyOrName);
      if (existingEntry && !options?.forceRefresh) {
        if (
          existingEntry.transitionStatus !== 'unmounting' &&
          (existingEntry.parentKey === sourceKey || existingEntry.originalParentKey === sourceKey)
        ) {
          bringToFront(keyOrName);
          return;
        }
      }

      const sourceEntry = findEntryInStore(floating, trail, sourceKey);
      if (!sourceEntry || sourceEntry.transitionStatus === 'unmounting') return;

      const optRect = options?.triggerRect;
      const rect = optRect ?? sourceEntry.rect;

      await resolvePopoverEntry({
        key: keyOrName,
        parentKey: sourceKey,
        rect: rect ?? null,
        parentData: sourceEntry.data,
        options,
        controllerKey: keyOrName,
        incrementCounter: () => incrementNestedCounter(sourceKey),
        isStale: (startedCounter) => isNestedStale(sourceKey, startedCounter),
        insertStatePatch: (entry) => (state) => pushNestedState(state, sourceIndex, entry),
      });

      const entry = findEntryByKey(keyOrName);
      if (entry?.onOpen) {
        entry.onOpen(entry);
      }
    },

    retryPopover: async (key: string) => {
      const { floating, trail } = get();
      const entry = findEntryInStore(floating, trail, key);
      if (!entry || entry.isLoading) return;

      const index = findEntryIndex(floating, trail, key);
      if (index === -1) return;

      const effectiveParentKey = entry.parentKey ?? entry.originalParentKey;
      const parentData = effectiveParentKey
        ? findEntryInStore(floating, trail, effectiveParentKey)?.data
        : undefined;

      const options = extractEntryOptions(entry);

      const updateStateForEntry =
        (updatedEntry: TrailEntry<TData>) => (state: PopoverStateData<TData, TContext>) =>
          findEntryInStore(state.floating, state.trail, key)
            ? {
                floating: state.floating.map((e: TrailEntry<TData>) =>
                  e.key === key ? updatedEntry : e,
                ),
                trail: state.trail.map((e: TrailEntry<TData>) =>
                  e.key === key ? updatedEntry : e,
                ),
              }
            : {};

      if (effectiveParentKey) {
        await resolvePopoverEntry({
          key,
          parentKey: effectiveParentKey,
          rect: entry.rect ?? null,
          parentData,
          options,
          controllerKey: key,
          incrementCounter: () => incrementNestedCounter(effectiveParentKey),
          isStale: (startedCounter) => isNestedStale(effectiveParentKey, startedCounter),
          insertStatePatch: updateStateForEntry,
        });
      } else {
        await resolvePopoverEntry({
          key,
          parentKey: undefined,
          rect: entry.rect ?? null,
          parentData: undefined,
          options,
          controllerKey: '__root__',
          incrementCounter: incrementRootCounter,
          isStale: isRootStale,
          insertStatePatch: updateStateForEntry,
        });
      }
    },

    prefetchPopover: async (key: string, parentData?: TData) => {
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
  };
}
