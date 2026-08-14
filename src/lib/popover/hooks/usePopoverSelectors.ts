import * as React from 'react';
import { useCallback, useDebugValue, useMemo } from 'react';
import {
  getEntryState,
  type PopoverStore,
  type TrailEntry,
  type NarrowTrailEntry,
  type UsePopoverResult,
} from '../types';
import { usePopoverActions, usePopoverStore } from '../context/usePopoverStore';
import {
  selectActiveTrail,
  selectFloatingEntries,
  selectEntryByKey,
  selectIsPinned,
  selectOffset,
  selectHasEntry,
} from '../store/storeSelectors';

import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import { shallowEqual } from '../utils/equality';
import { findEntryInStore } from '../utils/storeHelpers';

export type { UsePopoverResult };

const DEFAULT_OFFSET = Object.freeze({ x: 0, y: 0 });

type ReactUseFn = <T>(promise: Promise<T>) => T;
const REACT_USE: ReactUseFn | undefined =
  typeof (React as { use?: unknown }).use === 'function'
    ? (React as { use: ReactUseFn }).use
    : undefined;

/**
 * Hook to retrieve the active trailing popover cascade array.
 *
 * @template TData - The type of resolved data payloads.
 * @returns Array of trailing popover entries in order.
 */
export function usePopoverTrail<
  TData = RegisteredDataMap[RegisteredKeys],
>(): readonly TrailEntry<TData>[] {
  return usePopoverStore(selectActiveTrail<TData>);
}

/**
 * Hook to retrieve the active modeless floating (pinned) popovers array.
 *
 * @template TData - The type of resolved data payloads.
 * @returns Array of floating popover entries.
 */
export function usePopoverFloating<
  TData = RegisteredDataMap[RegisteredKeys],
>(): readonly TrailEntry<TData>[] {
  return usePopoverStore(selectFloatingEntries<TData>);
}

/**
 * Hook to retrieve coordinate offsets of all active popovers.
 *
 * @returns Record of offset coordinate objects mapped by popover key.
 */
export function usePopoverOffsets() {
  return usePopoverStore((state) => state.offsets, shallowEqual);
}

/**
 * Hook to retrieve the pinning state of a specific popover.
 *
 * @param key - The unique identifier key of the popover.
 * @returns True if the popover is currently pinned/floating.
 */
export function useIsPopoverPinned<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectIsPinned(key));
}

/**
 * Hook to retrieve a popover entry (either trailing or floating) by its unique key ID.
 *
 * @template TData - The type of resolved data payloads.
 * @param key - The unique identifier key of the popover.
 * @returns The matching TrailEntry or undefined if not found.
 */
export function usePopoverEntry<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey): TrailEntry<TData> | undefined {
  return usePopoverStore(selectEntryByKey<TData>(key));
}

/**
 * Hook to retrieve a popover entry with guaranteed status narrowing.
 *
 * @template TData - The type of resolved data payloads.
 * @template S - Status string discriminator ('loading' | 'error' | 'success').
 * @param key - The unique identifier key of the popover.
 * @param expectedStatus - Target status discriminator.
 * @returns The matching narrowed entry or undefined if not found or status mismatch.
 */
export function usePopoverEntryStatus<
  TData = RegisteredDataMap[RegisteredKeys],
  S extends 'loading' | 'error' | 'success' = 'success',
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey, expectedStatus: S = 'success' as S): NarrowTrailEntry<TData, S> | undefined {
  const entry = usePopoverEntry<TData, TPopoverKey>(key);
  if (!entry) return undefined;
  const currentStatus = getEntryState(entry).status;
  if (currentStatus === expectedStatus) {
    return entry as NarrowTrailEntry<TData, S>;
  }
  return undefined;
}

/**
 * Hook to retrieve the z-index stack position index of a popover.
 *
 * @param key - The unique identifier key of the popover.
 * @returns The 0-based z-index depth index, or -1 if not found.
 */
export function usePopoverZIndex<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore((state) => state.zIndexOrder.indexOf(key));
}

/**
 * Hook to verify if a popover is currently focused and at the top of the z-index stack.
 *
 * @param key - The unique identifier key of the popover.
 * @returns True if the popover is topmost.
 */
export function useIsPopoverTopMost<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(
    (state) => state.zIndexOrder.length > 0 && state.zIndexOrder.at(-1) === key,
  );
}

/**
 * Hook to retrieve the coordinate offset of a specific popover.
 *
 * @param key - The unique identifier key of the popover.
 * @returns The coordinate offset object.
 */
export function usePopoverOffset<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectOffset(key), shallowEqual);
}

/**
 * Hook to retrieve the global context value.
 *
 * @template TContext - The type of context.
 * @returns The active context object.
 */
export function usePopoverContext<TContext = unknown>() {
  return usePopoverStore((state: PopoverStore<unknown, TContext>) => state.context);
}

/**
 * Hook to retrieve the global collision boundary settings.
 *
 * @returns The collision configuration object.
 */
export function usePopoverCollisionConfig() {
  return usePopoverStore((state) => state.collisionConfig);
}

/**
 * Hook to check if a specific popover key is currently open (exists in trail or floating lists).
 *
 * @param key - The unique identifier key of the popover.
 * @returns True if the popover is active and open.
 */
export function useIsPopoverOpen<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean {
  return usePopoverStore(selectHasEntry(key));
}

/**
 * Unified hook combining data, open status, pinning, z-index, and actions for a single popover.
 *
 * @template TData - The type of resolved data payload.
 * @template TContext - The type of shared global context.
 * @template TPopoverKey - Union of valid popover keys.
 *
 * @param key - The unique identifier key of the popover.
 * @returns Unified data values and action wrappers.
 *
 * @example
 * ```tsx
 * import { usePopover } from 'popover-trail';
 *
 * function ProfileCard() {
 *   const { data, isOpen, isPinned, close, pin } = usePopover<UserData>('userProfile');
 *   if (!isOpen) return null;
 *   return <div><h2>{data?.name}</h2><button onClick={close}>Close</button></div>;
 * }
 * ```
 */
export function usePopover<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey): UsePopoverResult<TData> {
  const slice = usePopoverStore(
    useCallback(
      (state: PopoverStore<TData, TContext>) => {
        const entry =
          state.floating.find((e) => e.key === key) ?? state.trail.find((e) => e.key === key);
        const isOpen = entry !== undefined;
        const isPinned = state.pinnedStates[key] ?? false;
        const zIndex = state.zIndexOrder.indexOf(key);
        const isTop = state.zIndexOrder.length > 0 && state.zIndexOrder.at(-1) === key;
        const offset = state.offsets[key] ?? DEFAULT_OFFSET;

        return {
          entry,
          isOpen,
          isPinned,
          zIndex,
          isTop,
          offset,
        };
      },
      [key],
    ),
    shallowEqual,
  );

  const actions = usePopoverActions<TData, TContext, TPopoverKey>();

  const close = useCallback(() => actions.closeByKey(key, { transition: true }), [actions, key]);
  const pin = useCallback((rect: DOMRect) => actions.togglePin(key, rect), [actions, key]);
  const bringToFront = useCallback(() => actions.bringToFront(key), [actions, key]);
  const updateOffset = useCallback(
    (x: number, y: number) => actions.updateOffset(key, x, y),
    [actions, key],
  );

  useDebugValue(
    slice.isOpen
      ? `Popover "${key}" [Status: ${slice.entry?.isLoading ? 'Loading' : slice.entry?.error ? 'Error' : 'Resolved'}, Pinned: ${slice.isPinned}]`
      : `Popover "${key}" [Closed]`,
  );

  return useMemo(
    (): UsePopoverResult<TData> => ({
      entry: slice.entry,
      state: slice.entry
        ? getEntryState(slice.entry)
        : { status: 'loading', isLoading: true, data: undefined, error: null },
      isOpen: slice.isOpen,
      isPinned: slice.isPinned,
      zIndex: slice.zIndex,
      isTop: slice.isTop,
      offset: slice.offset,
      isLoading: slice.entry?.isLoading ?? false,
      data: slice.entry?.data,
      error: slice.entry?.error,
      close,
      pin,
      bringToFront,
      updateOffset,
    }),
    [slice, close, pin, bringToFront, updateOffset],
  );
}

/**
 * Discriminated union representation of popover hydration lifecycle status.
 */
export type PopoverHydrationState<TData = unknown> =
  | { status: 'idle'; isHydrating: false; isHydrated: false; data: undefined; error: null }
  | { status: 'hydrating'; isHydrating: true; isHydrated: false; data: undefined; error: null }
  | { status: 'hydrated'; isHydrating: false; isHydrated: true; data: TData | null; error: null }
  | { status: 'error'; isHydrating: false; isHydrated: false; data: undefined; error: Error };

/**
 * Hook to track loading/error status and trigger manual data reloads for a popover card.
 *
 * @template TData - The type of resolved data payload.
 * @param key - The unique identifier key of the popover card.
 * @returns Object containing state discriminated union, isLoading status, error, and reload trigger callback.
 */
export function usePopoverHydration<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey) {
  const actions = usePopoverActions();
  const entry = usePopoverEntry<TData, TPopoverKey>(key);
  const reload = useCallback(() => {
    void actions.retryPopover(key);
  }, [actions, key]);

  let state: PopoverHydrationState<TData> = {
    status: 'idle',
    isHydrating: false,
    isHydrated: false,
    data: undefined,
    error: null,
  };

  if (entry) {
    if (entry.isLoading) {
      state = {
        status: 'hydrating',
        isHydrating: true,
        isHydrated: false,
        data: undefined,
        error: null,
      };
    } else if (entry.error) {
      state = {
        status: 'error',
        isHydrating: false,
        isHydrated: false,
        data: undefined,
        error: entry.error,
      };
    } else if (entry.data !== undefined) {
      state = {
        status: 'hydrated',
        isHydrating: false,
        isHydrated: true,
        data: entry.data,
        error: null,
      };
    }
  }

  useDebugValue(
    state.status === 'hydrating'
      ? `Hydrating "${key}"...`
      : state.status === 'error'
        ? `Hydration Error: ${state.error.message}`
        : `Hydrated "${key}"`,
  );

  return {
    state,
    isLoading: state.isHydrating,
    error: state.error,
    data: state.data,
    reload,
  };
}

/**
 * Hook to retrieve resolved data for a popover key with React 19 use() support.
 *
 * @template TData - The type of resolved data payload.
 * @param key - The unique identifier key of the popover card.
 * @returns The resolved data payload. Suspends when entry.dataPromise is pending in React 19.
 *
 * @example
 * ```tsx
 * import { usePopoverData } from 'popover-trail';
 *
 * function UserDetails() {
 *   const data = usePopoverData<UserData>('userProfile');
 *   return <div>{data?.email}</div>;
 * }
 * ```
 */
export function usePopoverData<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey): TData | null | undefined {
  const entry = usePopoverEntry<TData, TPopoverKey>(key);
  if (entry?.error) return entry.data;

  if (entry?.dataPromise && typeof REACT_USE === 'function') {
    return REACT_USE(entry.dataPromise);
  }
  return entry?.data;
}

/**
 * Hook to retrieve loading state of a specific popover.
 */
export function usePopoverIsLoading<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean {
  return usePopoverStore(
    (state) => findEntryInStore(state.floating, state.trail, key)?.isLoading ?? false,
  );
}

/**
 * Hook to retrieve the error of a specific popover if any.
 */
export function usePopoverError<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): Error | null {
  return usePopoverStore(
    (state) => findEntryInStore(state.floating, state.trail, key)?.error ?? null,
  );
}

/**
 * Hook to retrieve the root popover entry from the trail stack.
 */
export function usePopoverRootEntry<TData = RegisteredDataMap[RegisteredKeys]>():
  | TrailEntry<TData>
  | undefined {
  return usePopoverStore((state) => state.trail[0] as TrailEntry<TData> | undefined);
}

/**
 * Hook to retrieve the total count of active popovers.
 */
export function usePopoverTotalActiveCount(): number {
  return usePopoverStore((state) => state.floating.length + state.trail.length);
}

/**
 * Hook to check if the store is completely idle (0 popovers open).
 */
export function useIsPopoverIdle(): boolean {
  return usePopoverStore((state) => state.floating.length === 0 && state.trail.length === 0);
}
