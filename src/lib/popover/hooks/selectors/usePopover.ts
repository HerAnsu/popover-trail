/**
 * High-Level Ergonomic Composite Hook for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/selectors/usePopover
 */

import { useCallback, useDebugValue, useMemo } from 'react';
import {
  getEntryState,
  type PopoverRect,
  type PopoverStore,
  type UsePopoverResult,
} from '../../types';
import { usePopoverActions, usePopoverStore } from '../../context/usePopoverStore';
import type {
  RegisteredKeys,
  RegisteredDataMap,
  ResolveRegisteredData,
} from '../../types/registerTypes';
import { shallowEqual } from '../../utils/equality';

const DEFAULT_OFFSET = Object.freeze({ x: 0, y: 0 });

/**
 * High-level ergonomic composite hook for reactive inspection and control of an individual popover card.
 *
 * @remarks
 * Subscribes to popover presence, pinning, z-index stacking depth, and spatial drag offset using
 * shallow value equality (`shallowEqual`), eliminating redundant re-renders.
 * Returns a discriminated union narrowed on `isOpen`:
 * - When `isOpen: true`, `entry` is guaranteed to be non-undefined with typed data.
 * - When `isOpen: false`, `entry` is undefined with idle state and negative z-index (-1).
 *
 * @template K - Branded key type matching registered schema or raw string.
 * @template TData - Inferred data payload type associated with key K.
 * @template TContext - Ambient context type.
 * @param key - Unique popover card key.
 * @returns Discriminated result object containing state flags, entry snapshot, and action dispatchers.
 *
 * @example
 * ```tsx
 * function ProfileCard() {
 *   const { isOpen, entry, isPinned, pin, close } = usePopover('user_profile');
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div>
 *       <h3>{entry.data.name}</h3>
 *       <button onClick={() => pin()}>Pin</button>
 *       <button onClick={close}>Dismiss</button>
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
        return {
          entry,
          isOpen: entry !== undefined,
          isPinned: state.pinnedStates[key] ?? false,
          zIndex: state.zIndexOrder.indexOf(key),
          isTop: state.zIndexOrder.length > 0 && state.zIndexOrder.at(-1) === key,
          offset: state.offsets[key] ?? DEFAULT_OFFSET,
        };
      },
      [key],
    ),
    shallowEqual,
  );

  const actions = usePopoverActions<TData, TContext, K>();
  const close = useCallback(() => actions.closeByKey(key, { transition: true }), [actions, key]);
  const pin = useCallback(
    (rect?: DOMRect | PopoverRect) => actions.togglePin(key, rect),
    [actions, key],
  );
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

  return useMemo((): UsePopoverResult<TData> => {
    if (slice.isOpen && slice.entry) {
      return {
        isOpen: true,
        entry: slice.entry,
        state: getEntryState(slice.entry),
        isPinned: slice.isPinned,
        zIndex: slice.zIndex,
        isTop: slice.isTop,
        offset: slice.offset,
        isLoading: slice.entry.isLoading ?? false,
        data: slice.entry.data ?? null,
        error: slice.entry.error ?? null,
        close,
        pin,
        bringToFront,
        updateOffset,
      };
    }
    return {
      isOpen: false,
      entry: undefined,
      state: { status: 'idle', isLoading: false, data: undefined, error: null },
      isPinned: false,
      zIndex: -1,
      isTop: false,
      offset: slice.offset,
      isLoading: false,
      data: undefined,
      error: undefined,
      close,
      pin,
      bringToFront,
      updateOffset,
    };
  }, [slice, close, pin, bringToFront, updateOffset]);
}
