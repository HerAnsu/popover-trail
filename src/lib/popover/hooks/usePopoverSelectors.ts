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
  selectParentKey,
  selectChildrenKeys,
  selectBreadcrumbs,
  selectPopoverDepth,
} from '../store/storeSelectors';

import type {
  RegisteredKeys,
  RegisteredDataMap,
  ResolveRegisteredData,
} from '../types/registerTypes';
import { shallowEqual } from '../utils/equality';
import { findEntryInStore } from '../utils/storeHelpers';

export type { UsePopoverResult };

const DEFAULT_OFFSET = Object.freeze({ x: 0, y: 0 });

const REACT_USE = 'use' in React && typeof React.use === 'function' ? React.use : undefined;

/**
 * Returns the array of active cascading trail popover entries (root at index 0).
 *
 * @template TData - Type of data payload associated with popover entries.
 * @returns Readonly array of active trail entries.
 *
 * @example
 * ```tsx
 * function TrailBreadcrumbs() {
 *   const trail = usePopoverTrail();
 *   return <span>Depth: {trail.length}</span>;
 * }
 * ```
 */
export function usePopoverTrail<
  TData = RegisteredDataMap[RegisteredKeys],
>(): readonly TrailEntry<TData>[] {
  return usePopoverStore(selectActiveTrail<TData>);
}

/**
 * Returns the array of active pinned/floating popover entries.
 *
 * @template TData - Type of data payload associated with popover entries.
 * @returns Readonly array of floating entries.
 */
export function usePopoverFloating<
  TData = RegisteredDataMap[RegisteredKeys],
>(): readonly TrailEntry<TData>[] {
  return usePopoverStore(selectFloatingEntries<TData>);
}

/**
 * Returns a dictionary mapping popover keys to their current `(x, y)` drag offsets.
 * Uses shallow equality comparison to prevent unnecessary re-renders.
 */
export function usePopoverOffsets() {
  return usePopoverStore((state) => state.offsets, shallowEqual);
}

/**
 * Checks whether a specific popover card is currently pinned.
 *
 * @template TPopoverKey - Union of valid popover string keys.
 * @param key - Unique popover key.
 * @returns `true` if the popover is pinned, `false` otherwise.
 */
export function useIsPopoverPinned<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectIsPinned(key));
}

/** Symmetric alias for `useIsPopoverPinned`. */
export const usePopoverIsPinned = useIsPopoverPinned;

function isEntryWithStatus<
  TData,
  S extends 'loading' | 'error' | 'success',
  TPopoverKey extends string = string,
>(
  entry: TrailEntry<TData, TPopoverKey>,
  expectedStatus: string,
): entry is NarrowTrailEntry<TData, S, TPopoverKey> {
  return getEntryState(entry).status === expectedStatus;
}

/**
 * Retrieves the `TrailEntry` for a specific popover key from either trail or floating stack.
 * Automatically infers payload data type based on the registered schema.
 *
 * @template K - Target popover key string.
 * @template TData - Resolved data payload type (inferred from `K`).
 * @param key - Unique popover key.
 * @returns The matching `TrailEntry` or `undefined` if closed.
 *
 * @example
 * ```tsx
 * function CardStatus({ cardKey }: { cardKey: string }) {
 *   const entry = usePopoverEntry(cardKey);
 *   if (!entry) return null;
 *   return <span>Status: {entry.status}</span>;
 * }
 * ```
 */
export function usePopoverEntry<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K): TrailEntry<TData, K> | undefined {
  return usePopoverStore(selectEntryByKey<TData, K>(key));
}

/**
 * Retrieves a popover entry with compile-time state narrowing.
 * When `expectedStatus` matches, TypeScript narrows the returned entry to `LoadingTrailEntry`, `ErrorTrailEntry`, or `SuccessTrailEntry`.
 *
 * @template K - Target popover key string.
 * @template S - Expected lifecycle status (`'loading'` | `'error'` | `'success'`, defaults to `'success'`).
 * @template TData - Resolved data payload type.
 * @param key - Unique popover key.
 * @param expectedStatus - Target status to check (defaults to `'success'`).
 * @returns Narrowed entry if status matches, or `undefined`.
 *
 * @example
 * ```tsx
 * function UserView({ cardKey }: { cardKey: string }) {
 *   const entry = usePopoverEntryStatus(cardKey, 'success');
 *   if (!entry) return <Spinner />;
 *   return <div>{entry.data.name}</div>; // entry.data is guaranteed non-null
 * }
 * ```
 */
export function usePopoverEntryStatus<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K): NarrowTrailEntry<TData, 'success', K> | undefined;
export function usePopoverEntryStatus<
  K extends RegisteredKeys = RegisteredKeys,
  S extends 'loading' | 'error' | 'success' = 'success',
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K, expectedStatus: S): NarrowTrailEntry<TData, S, K> | undefined;
export function usePopoverEntryStatus<
  K extends RegisteredKeys = RegisteredKeys,
  S extends 'loading' | 'error' | 'success' = 'success',
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K, expectedStatus?: S): NarrowTrailEntry<TData, S, K> | undefined {
  const entry = usePopoverEntry<K, TData>(key);
  if (!entry) return undefined;
  if (isEntryWithStatus<TData, S, K>(entry, expectedStatus ?? 'success')) {
    return entry;
  }
  return undefined;
}

/**
 * Returns the z-index stacking order index for a popover key (-1 if not mounted).
 *
 * @param key - Unique popover key.
 * @returns Visual stacking index (higher = on top).
 */
export function usePopoverZIndex<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore((state) => state.zIndexOrder.indexOf(key));
}

/**
 * Checks whether a specific popover card is at the top of the z-index stack.
 *
 * @param key - Unique popover key.
 * @returns `true` if the popover is topmost.
 */
export function useIsPopoverTopMost<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(
    (state) => state.zIndexOrder.length > 0 && state.zIndexOrder.at(-1) === key,
  );
}

/** Symmetric alias for `useIsPopoverTopMost`. */
export const usePopoverIsTopMost = useIsPopoverTopMost;

/**
 * Returns the current `(x, y)` drag position offset for a specific popover card.
 *
 * @param key - Unique popover key.
 * @returns `{ x: number, y: number }` offset.
 */
export function usePopoverOffset<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectOffset(key), shallowEqual);
}

/**
 * Returns the global application context value passed to `PopoverProvider`.
 *
 * @template TContext - External context type.
 * @returns Active context value or null.
 */
export function usePopoverContext<TContext = unknown>() {
  return usePopoverStore((state: PopoverStore<unknown, TContext>) => state.context);
}

/**
 * Returns the active collision boundary detection settings.
 */
export function usePopoverCollisionConfig() {
  return usePopoverStore((state) => state.collisionConfig);
}

/**
 * Checks whether a specific popover key is currently open (either in the cascade trail or pinned).
 *
 * @param key - Unique popover key.
 * @returns `true` if open, `false` otherwise.
 */
export function useIsPopoverOpen<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean {
  return usePopoverStore(selectHasEntry(key));
}

/** Symmetric alias for `useIsPopoverOpen`. */
export const usePopoverIsOpen = useIsPopoverOpen;

/**
 * Returns the parent popover key for a given card, establishing the cascade hierarchy.
 *
 * @param key - Child popover key.
 * @returns Parent key string or undefined if root.
 */
export function usePopoverParentKey<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): string | undefined {
  return usePopoverStore(selectParentKey(key));
}

/**
 * Returns the keys of all direct children popover cards spawned from this parent card.
 *
 * @param key - Parent popover key.
 * @returns Array of child key strings.
 */
export function usePopoverChildrenKeys<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): readonly string[] {
  return usePopoverStore(selectChildrenKeys(key), shallowEqual);
}

/**
 * Returns the full ancestral path of popover keys from the root down to the target key.
 *
 * @param key - Target popover key.
 * @returns Array of ancestor keys including target key.
 *
 * @example
 * ```tsx
 * const breadcrumbs = usePopoverBreadcrumbs('userSettings');
 * // ['rootWorkspace', 'userProfile', 'userSettings']
 * ```
 */
export function usePopoverBreadcrumbs<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): readonly string[] {
  return usePopoverStore(selectBreadcrumbs(key), shallowEqual);
}

/**
 * Returns the 0-based depth level of a popover card in the cascade tree (0 = root).
 *
 * @param key - Target popover key.
 * @returns Depth number (-1 if closed).
 */
export function usePopoverDepth<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): number {
  return usePopoverStore(selectPopoverDepth(key));
}

/**
 * All-in-one hook combining entry state, open/pin flags, z-index, and actions for a single popover card.
 *
 * @template K - Target popover key string.
 * @template TData - Resolved data payload type (inferred from `K`).
 * @template TContext - Global external context type.
 * @param key - Unique popover key.
 * @returns Object with entry, state, isOpen, isPinned, zIndex, isTop, data, error, close(), pin(), bringToFront().
 *
 * @example
 * ```tsx
 * function ProfilePopover({ id }: { id: string }) {
 *   const { isOpen, isPinned, data, isLoading, close, pin } = usePopover(`profile-${id}`);
 *   if (!isOpen) return null;
 *   return (
 *     <div>
 *       <h2>{data?.name}</h2>
 *       <button onClick={() => pin(rect)}>Pin</button>
 *       <button onClick={close}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePopover<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
  TContext = unknown,
>(key: K): UsePopoverResult<TData> {
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

  const actions = usePopoverActions<TData, TContext, K>();

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
 * Tracks the async hydration and data loading lifecycle for a specific popover card.
 * Provides `isLoading`, `error`, `data`, and a `reload()` function.
 *
 * @template K - Target popover key string.
 * @template TData - Resolved data payload type (inferred from `K`).
 * @param key - Unique popover key.
 *
 * @example
 * ```tsx
 * function DataCard({ cardKey }: { cardKey: string }) {
 *   const { data, isLoading, error, reload } = usePopoverHydration(cardKey);
 *   if (isLoading) return <Spinner />;
 *   if (error) return <button onClick={reload}>Retry</button>;
 *   return <div>{data?.name}</div>;
 * }
 * ```
 */
export function usePopoverHydration<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K) {
  const actions = usePopoverActions();
  const entry = usePopoverEntry<K, TData>(key);
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

  return {
    state,
    isLoading: state.isHydrating,
    error: state.error,
    data: state.data,
    reload,
  };
}

/**
 * Retrieves the resolved data payload for a specific popover key.
 * Compatible with React 19 `use(promise)` Suspense boundaries when `dataPromise` is available.
 *
 * @template K - Target popover key string.
 * @template TData - Resolved data payload type (inferred from `K`).
 * @param key - Unique popover key.
 * @returns Resolved data payload, or `null` / `undefined` if not resolved.
 *
 * @example
 * ```tsx
 * function UserHeader({ userKey }: { userKey: string }) {
 *   const user = usePopoverData(userKey);
 *   return <h1>{user?.name ?? 'Loading...'}</h1>;
 * }
 * ```
 */
export function usePopoverData<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K): TData | null | undefined {
  const entry = usePopoverEntry<K, TData>(key);
  if (entry?.error) return entry.data;

  if (entry?.dataPromise && typeof REACT_USE === 'function') {
    return REACT_USE(entry.dataPromise);
  }
  return entry?.data;
}

/**
 * Checks whether data resolution is currently in progress for a specific popover card.
 *
 * @param key - Unique popover key.
 * @returns `true` if loading, `false` otherwise.
 */
export function usePopoverIsLoading<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean {
  return usePopoverStore(
    (state) => findEntryInStore(state.floating, state.trail, key)?.isLoading ?? false,
  );
}

/** Symmetric alias for `usePopoverIsLoading`. */
export const useIsPopoverLoading = usePopoverIsLoading;

/**
 * Retrieves the error encountered during data resolution for a specific popover card.
 *
 * @param key - Unique popover key.
 * @returns `Error` instance or `null`.
 */
export function usePopoverError<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): Error | null {
  return usePopoverStore(
    (state) => findEntryInStore(state.floating, state.trail, key)?.error ?? null,
  );
}

/** Symmetric alias for `usePopoverError`. */
export const useIsPopoverError = usePopoverError;

/**
 * Retrieves the root `TrailEntry` that initiated the active cascade stack (index 0).
 *
 * @template TData - Resolved data payload type.
 * @returns Root entry or `undefined` if trail is empty.
 */
export function usePopoverRootEntry<TData = RegisteredDataMap[RegisteredKeys]>():
  | TrailEntry<TData>
  | undefined {
  return usePopoverStore<TrailEntry<TData> | undefined, TData>((state) => state.trail[0]);
}

/**
 * Returns the total count of currently open popover cards (trail + floating).
 */
export function usePopoverTotalActiveCount(): number {
  return usePopoverStore((state) => state.floating.length + state.trail.length);
}

/**
 * Checks whether the popover system is completely idle (0 open cards in trail and floating list).
 *
 * @returns `true` if idle, `false` if any popover is open.
 */
export function useIsPopoverIdle(): boolean {
  return usePopoverStore((state) => state.floating.length === 0 && state.trail.length === 0);
}

/** Symmetric alias for `useIsPopoverIdle`. */
export const usePopoverIsIdle = useIsPopoverIdle;
