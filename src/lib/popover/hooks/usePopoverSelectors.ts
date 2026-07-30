import * as React from 'react';
import { useCallback, useDebugValue, useMemo } from 'react';
import { getEntryState, type PopoverEntryDiscriminatedState, type PopoverStore, type TrailEntry, type UsePopoverResult } from '../types';
import { hasEntryWithKey } from '../utils/storeHelpers';
import { usePopoverActions, usePopoverStore } from '../context';

const DEFAULT_OFFSET = Object.freeze({ x: 0, y: 0 });

function shallowEqual<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is((objA as Record<string, unknown>)[key], (objB as Record<string, unknown>)[key])
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Hook to retrieve the active trailing popover cascade array.
 *
 * @template TData - The type of resolved data payloads.
 * @returns Array of trailing popover entries in order.
 */
export function usePopoverTrail<TData = unknown>(): readonly TrailEntry<TData>[] {
  return usePopoverStore((state: PopoverStore<TData>) => state.trail);
}

/**
 * Hook to retrieve the active modeless floating (pinned) popovers array.
 *
 * @template TData - The type of resolved data payloads.
 * @returns Array of floating popover entries.
 */
export function usePopoverFloating<TData = unknown>(): readonly TrailEntry<TData>[] {
  return usePopoverStore((state: PopoverStore<TData>) => state.floating);
}

/**
 * Hook to retrieve coordinate offsets of all active popovers.
 *
 * @returns Record of offset coordinate objects mapped by popover key.
 */
export function usePopoverOffsets() {
  return usePopoverStore((state) => state.offsets);
}

/**
 * Hook to retrieve the pinning state of a specific popover.
 *
 * @param key - The unique identifier key of the popover.
 * @returns True if the popover is currently pinned/floating.
 */
export function useIsPopoverPinned(key: string) {
  return usePopoverStore((state) => state.pinnedStates[key] ?? false);
}

/**
 * Hook to retrieve a popover entry (either trailing or floating) by its unique key ID.
 *
 * @template TData - The type of resolved data payloads.
 * @param key - The unique identifier key of the popover.
 * @returns The matching TrailEntry or undefined if not found.
 */
export function usePopoverEntry<TData = unknown>(key: string): TrailEntry<TData> | undefined {
  return usePopoverStore(
    (state: PopoverStore<TData>) =>
      state.floating.find((e) => e.key === key) ?? state.trail.find((e) => e.key === key),
  );
}

/**
 * Hook to retrieve the z-index stack position index of a popover.
 *
 * @param key - The unique identifier key of the popover.
 * @returns The 0-based z-index depth index, or -1 if not found.
 */
export function usePopoverZIndex(key: string) {
  return usePopoverStore((state) => state.zIndexOrder.indexOf(key));
}

/**
 * Hook to verify if a popover is currently focused and at the top of the z-index stack.
 *
 * @param key - The unique identifier key of the popover.
 * @returns True if the popover is topmost.
 */
export function useIsPopoverTopMost(key: string) {
  return usePopoverStore(
    (state) =>
      state.zIndexOrder.length > 0 && state.zIndexOrder[state.zIndexOrder.length - 1] === key,
  );
}

/**
 * Hook to retrieve the coordinate offset of a specific popover.
 *
 * @param key - The unique identifier key of the popover.
 * @returns The coordinate offset object.
 */
export function usePopoverOffset(key: string) {
  return usePopoverStore((state) => state.offsets[key] ?? DEFAULT_OFFSET);
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
export function useIsPopoverOpen(key: string): boolean {
  return usePopoverStore(
    useCallback((state: PopoverStore) => hasEntryWithKey(state.floating, state.trail, key), [key]),
  );
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
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(key: TPopoverKey): UsePopoverResult<TData> {
  const slice = usePopoverStore(
    useCallback(
      (state: PopoverStore<TData, TContext>) => {
        const entry =
          state.floating.find((e) => e.key === key) ?? state.trail.find((e) => e.key === key);
        const isOpen = entry !== undefined;
        const isPinned = state.pinnedStates[key] ?? false;
        const zIndex = state.zIndexOrder.indexOf(key);
        const isTop =
          state.zIndexOrder.length > 0 && state.zIndexOrder[state.zIndexOrder.length - 1] === key;
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

  const actions = usePopoverActions<TData, TContext>();

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

  const discriminatedState = useMemo(
    (): PopoverEntryDiscriminatedState<TData> =>
      slice.entry
        ? getEntryState(slice.entry)
        : { status: 'loading', isLoading: true, data: undefined, error: null },
    [slice.entry],
  );

  return useMemo(
    (): UsePopoverResult<TData> => ({
      entry: slice.entry,
      state: discriminatedState,
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
    [slice, discriminatedState, close, pin, bringToFront, updateOffset],
  );
}

/**
 * Discriminated union representation of popover hydration lifecycle status.
 */
export type PopoverHydrationState<TData = unknown> =
  | { status: 'idle'; isHydrating: false; isHydrated: false; data: undefined; error: null }
  | { status: 'hydrating'; isHydrating: true; isHydrated: false; data: undefined; error: null }
  | { status: 'hydrated'; isHydrating: false; isHydrated: true; data: TData; error: null }
  | { status: 'error'; isHydrating: false; isHydrated: false; data: undefined; error: Error };

/**
 * Hook to track loading/error status and trigger manual data reloads for a popover card.
 *
 * @template TData - The type of resolved data payload.
 * @param key - The unique identifier key of the popover card.
 * @returns Object containing state discriminated union, isLoading status, error, and reload trigger callback.
 */
export function usePopoverHydration<TData = unknown>(key: string) {
  const actions = usePopoverActions();
  const entry = usePopoverEntry<TData>(key);
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
 * React 19 native data hook with Suspense support leveraging `use(promise)`.
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
export function usePopoverData<TData = unknown>(key: string): TData | undefined {
  const entry = usePopoverEntry<TData>(key);
  if (entry?.error) return entry.data;
  const ReactUse = (React as unknown as Record<string, unknown>).use as
    | (<T>(p: Promise<T>) => T)
    | undefined;

  if (entry?.dataPromise && typeof ReactUse === 'function') {
    return ReactUse(entry.dataPromise);
  }
  return entry?.data;
}
