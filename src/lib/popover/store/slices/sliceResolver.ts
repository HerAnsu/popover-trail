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

function stopEventPropagation(event?: AnchorEventLike): void {
  if (event && 'stopPropagation' in event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
}

function resolveTriggerBoundingRect(
  anchorEvent?: AnchorEventLike,
  optionsRect?: DOMRect | null,
): DOMRect | null {
  if (optionsRect) return optionsRect;
  const target = anchorEvent && 'currentTarget' in anchorEvent ? anchorEvent.currentTarget : null;
  if (
    target &&
    typeof target === 'object' &&
    'getBoundingClientRect' in target &&
    typeof target.getBoundingClientRect === 'function'
  ) {
    return (target as Element).getBoundingClientRect();
  }
  return null;
}

function notifyEntryOpen<TData>(
  findEntryByKey: (key: string) => TrailEntry<TData> | undefined,
  key: string,
): void {
  const entry = findEntryByKey(key);
  if (entry?.onOpen) {
    entry.onOpen(entry);
  }
}

function createEntryUpdatePatch<TData, TContext>(key: string, updatedEntry: TrailEntry<TData>) {
  return (state: PopoverStateData<TData, TContext>) =>
    findEntryInStore(state.floating, state.trail, key)
      ? {
          floating: state.floating.map((e: TrailEntry<TData>) =>
            e.key === key ? updatedEntry : e,
          ),
          trail: state.trail.map((e: TrailEntry<TData>) => (e.key === key ? updatedEntry : e)),
        }
      : {};
}

function isRootAlreadyActive<TData>(
  trail: readonly TrailEntry<TData>[],
  currentOwnerId: string | null | undefined,
  finalOwnerId: string,
  key: string,
  forceRefresh?: boolean,
): boolean {
  if (forceRefresh || trail.length === 0) return false;
  const root = trail[0];
  return (
    root?.key === key && root?.transitionStatus !== 'unmounting' && currentOwnerId === finalOwnerId
  );
}

function isNestedAlreadyActive<TData>(
  existingEntry: TrailEntry<TData> | undefined,
  sourceKey: string,
  forceRefresh?: boolean,
): boolean {
  if (!existingEntry || forceRefresh) return false;
  if (existingEntry.transitionStatus === 'unmounting') return false;
  return existingEntry.parentKey === sourceKey || existingEntry.originalParentKey === sourceKey;
}

function buildRetryPipelineParams<TData, TContext, TPopoverKey extends string = string>(
  key: string,
  entry: TrailEntry<TData>,
  effectiveParentKey: string | undefined,
  parentData: TData | null | undefined,
  deps: SliceContext<TData, TContext, TPopoverKey>['deps'],
) {
  const options = extractEntryOptions(entry);
  const updateStateForEntry = (updated: TrailEntry<TData>) =>
    createEntryUpdatePatch<TData, TContext>(key, updated);

  if (effectiveParentKey) {
    return {
      key,
      parentKey: effectiveParentKey,
      rect: entry.rect ?? null,
      parentData,
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
        insertStatePatch: (entry) => (state) => openRootState(state, finalOwnerId, entry),
      });

      notifyEntryOpen(findEntryByKey, keyOrName);
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
        insertStatePatch: (entry) => (state) => pushNestedState(state, sourceIndex, entry),
      });

      notifyEntryOpen(findEntryByKey, keyOrName);
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

      const params = buildRetryPipelineParams<TData, TContext, TPopoverKey>(
        key,
        entry,
        effectiveParentKey,
        parentData,
        deps,
      );
      await resolvePopoverEntry(params);
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
